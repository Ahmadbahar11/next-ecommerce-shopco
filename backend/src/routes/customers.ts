import { Router, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const requireAdmin: RequestHandler[] = [authenticate, authorize("admin")];

router.use(requireAdmin);

// GET /api/customers?search= - flat list with order aggregates
router.get("/", async (req, res) => {
  const { search } = req.query;
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
    ];
  }

  const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: "desc" } });
  const orderAgg = await prisma.order.groupBy({
    by: ["customerId"],
    _count: { _all: true },
    _sum: { total: true },
  });
  const aggMap = new Map(orderAgg.map((a) => [a.customerId, a]));

  res.json(
    customers.map((c) => ({
      ...c,
      ordersCount: aggMap.get(c.id)?._count._all ?? 0,
      totalSpent: aggMap.get(c.id)?._sum.total ?? 0,
    }))
  );
});

// GET /api/customers/:id - detail with order history
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { orders: { include: { items: true }, orderBy: { id: "desc" } } },
  });
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});

const customerUpdateInput = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "blocked"]).optional(),
});

// PUT /api/customers/:id
router.put("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const parsed = customerUpdateInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const customer = await prisma.customer.update({ where: { id }, data: parsed.data });
    res.json(customer);
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }
    throw err;
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const orderCount = await prisma.order.count({ where: { customerId: id } });
  if (orderCount > 0) {
    return res.status(409).json({
      error: `Cannot delete: ${orderCount} order(s) still reference this customer.`,
    });
  }

  try {
    await prisma.customer.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Customer not found" });
    }
    throw err;
  }
});

export default router;
