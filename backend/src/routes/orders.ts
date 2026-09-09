import { Router, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const requireAdmin: RequestHandler[] = [authenticate, authorize("admin")];

const checkoutInput = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shipping: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    phone: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

function computeUnitPrice(price: number, discountPercentage: number) {
  return discountPercentage > 0
    ? Math.round(price - (price * discountPercentage) / 100)
    : price;
}

// POST /api/orders - public checkout submission
router.post("/", async (req: Request, res: Response) => {
  const parsed = checkoutInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { customer, shipping, items } = parsed.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const existingCustomer = await tx.customer.findUnique({
        where: { email: customer.email },
      });
      if (existingCustomer?.status === "blocked") {
        throw new Error("BLOCKED_CUSTOMER");
      }

      const customerRecord = await tx.customer.upsert({
        where: { email: customer.email },
        update: { name: customer.name, phone: customer.phone },
        create: { name: customer.name, email: customer.email, phone: customer.phone },
      });

      const productIds = items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { statusOption: true },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let total = 0;
      const orderItemsData: {
        productId: number;
        productTitle: string;
        price: number;
        quantity: number;
      }[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
        if (product.statusOption?.slug !== "active") {
          throw new Error(`PRODUCT_UNAVAILABLE:${product.title}`);
        }
        if (product.stock < item.quantity) throw new Error(`INSUFFICIENT_STOCK:${product.title}`);

        const unitPrice = computeUnitPrice(product.price, product.discountPercentage);
        total += unitPrice * item.quantity;
        orderItemsData.push({
          productId: product.id,
          productTitle: product.title,
          price: unitPrice,
          quantity: item.quantity,
        });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber: `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          customerId: customerRecord.id,
          total,
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingPhone: shipping.phone,
          items: { create: orderItemsData },
        },
        include: { items: true, customer: true },
      });

      return tx.order.update({
        where: { id: created.id },
        data: { orderNumber: `#${1000 + created.id}` },
        include: { items: true, customer: true },
      });
    });

    res.status(201).json(order);
  } catch (err: any) {
    if (err.message === "BLOCKED_CUSTOMER") {
      return res.status(403).json({ error: "This account is blocked and cannot place orders" });
    }
    if (typeof err.message === "string" && err.message.startsWith("PRODUCT_NOT_FOUND")) {
      return res.status(400).json({ error: "One or more products no longer exist" });
    }
    if (typeof err.message === "string" && err.message.startsWith("PRODUCT_UNAVAILABLE")) {
      return res.status(400).json({ error: err.message.replace("PRODUCT_UNAVAILABLE:", "") + " is no longer available" });
    }
    if (typeof err.message === "string" && err.message.startsWith("INSUFFICIENT_STOCK")) {
      return res.status(409).json({ error: "Not enough stock for " + err.message.replace("INSUFFICIENT_STOCK:", "") });
    }
    throw err;
  }
});

// GET /api/orders?status=&search= - admin only
router.get("/", requireAdmin, async (req: Request, res: Response) => {
  const { status, search } = req.query;
  const where: any = {};
  if (status) where.status = String(status);
  if (search) {
    where.OR = [
      { orderNumber: { contains: String(search), mode: "insensitive" } },
      { customer: { name: { contains: String(search), mode: "insensitive" } } },
      { customer: { email: { contains: String(search), mode: "insensitive" } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true, customer: true },
    orderBy: { id: "desc" },
  });
  res.json(orders);
});

// GET /api/orders/:id - admin only
router.get("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, customer: true },
  });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

const statusInput = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

// PUT /api/orders/:id - admin only, status updates
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const parsed = statusInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { items: true, customer: true },
    });
    res.json(order);
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    throw err;
  }
});

export default router;
