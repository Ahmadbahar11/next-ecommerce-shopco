import { Router, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const requireAdmin: RequestHandler[] = [authenticate, authorize("admin")];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function upsertBrandId(name: string) {
  const value = name.trim();
  try {
    const existing = await prisma.productBrand.findFirst({
      where: { OR: [{ name: value }, { slug: value }] },
      select: { id: true },
    });
    if (existing) return existing.id;
    return await prisma.productBrand.upsert({
      where: { name: value },
      update: {},
      create: { name: value, slug: slugify(value) },
    }).then((record) => record.id);
  } catch (err: any) {
    if (err.code === "P2002") throw { ...err, lookup: "brand" };
    throw err;
  }
}

async function upsertConditionId(name: string) {
  const value = name.trim();
  try {
    const existing = await prisma.productConditionOption.findFirst({
      where: { OR: [{ name: value }, { slug: value }] },
      select: { id: true },
    });
    if (existing) return existing.id;
    return await prisma.productConditionOption.upsert({
      where: { name: value },
      update: {},
      create: { name: value, slug: slugify(value) },
    }).then((record) => record.id);
  } catch (err: any) {
    if (err.code === "P2002") throw { ...err, lookup: "condition" };
    throw err;
  }
}

async function upsertStatusId(name: string) {
  const value = name.trim();
  try {
    const existing = await prisma.productStatusOption.findFirst({
      where: { OR: [{ name: value }, { slug: value }] },
      select: { id: true },
    });
    if (existing) return existing.id;
    return await prisma.productStatusOption.upsert({
      where: { name: value },
      update: {},
      create: { name: value, slug: slugify(value) },
    }).then((record) => record.id);
  } catch (err: any) {
    if (err.code === "P2002") throw { ...err, lookup: "status" };
    throw err;
  }
}

const productInput = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  srcUrl: z.string().min(1),
  gallery: z.array(z.string()).optional().default([]),
  brand: z.string().min(1),
  condition: z.string().min(1).default("new"),
  size: z.string().optional().default(""),
  price: z.number().int().nonnegative(),
  discountPercentage: z.number().int().min(0).max(100).default(0),
  stock: z.number().int().min(0).default(0),
  status: z.string().min(1).default("draft"),
  rating: z.number().min(0).max(5).default(0),
  categoryId: z.number().int().positive(),
  subCategoryId: z.number().int().positive().nullable().optional(),
});

function presentProduct(product: any) {
  const { brandOption, conditionOption, statusOption, ...base } = product;
  return {
    ...base,
    brand: brandOption?.name ?? "",
    condition: conditionOption?.slug ?? conditionOption?.name ?? "",
    status: statusOption?.slug ?? statusOption?.name ?? "",
  };
}

function uniqueProductError(err: any) {
  if (err?.lookup === "brand") return "This brand name or slug already exists";
  if (err?.lookup === "condition") return "This condition name or slug already exists";
  if (err?.lookup === "status") return "This status name or slug already exists";
  const target = Array.isArray(err?.meta?.target) ? err.meta.target.join(",") : String(err?.meta?.target ?? "");
  if (target.includes("slug")) return "A product with this slug already exists";
  if (target.includes("ProductBrand")) return "This brand name or slug already exists";
  if (target.includes("ProductConditionOption")) return "This condition name or slug already exists";
  if (target.includes("ProductStatusOption")) return "This status name or slug already exists";
  return "A value with these details already exists";
}

async function validateCategoryPair(categoryId: number, subCategoryId?: number | null) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return "categoryId does not exist";

  if (subCategoryId) {
    const subCategory = await prisma.subCategory.findUnique({ where: { id: subCategoryId } });
    if (!subCategory) return "subCategoryId does not exist";
    if (subCategory.categoryId !== categoryId) {
      return "subCategoryId does not belong to the selected category";
    }
  }
  return null;
}

// GET /api/products?categoryId=&subCategoryId=&brand=&condition=&status=&search=&minPrice=&maxPrice=
router.get("/", async (req, res) => {
  const { categoryId, subCategoryId, brand, condition, status, search, minPrice, maxPrice } = req.query;

  const where: any = {};

  if (categoryId) where.categoryId = Number(categoryId);
  if (subCategoryId) where.subCategoryId = Number(subCategoryId);
  if (brand) where.brandOption = { name: { equals: String(brand), mode: "insensitive" } };
  if (condition) where.conditionOption = { slug: String(condition) };
  if (status) where.statusOption = { slug: String(status) };
  if (search) where.title = { contains: String(search), mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true, subCategory: true, brandOption: true, conditionOption: true, statusOption: true },
    orderBy: { id: "desc" },
  });
  res.json(products.map(presentProduct));
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true, subCategory: true, brandOption: true, conditionOption: true, statusOption: true },
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(presentProduct(product));
});

// POST /api/products
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const parsed = productInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const validationError = await validateCategoryPair(
    parsed.data.categoryId,
    parsed.data.subCategoryId
  );
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const brandId = await upsertBrandId(parsed.data.brand);
    const conditionId = await upsertConditionId(parsed.data.condition);
    const statusId = await upsertStatusId(parsed.data.status);
    const { brand, condition, status, ...productData } = parsed.data;

    const product = await prisma.product.create({
      data: {
        ...productData,
        brandId,
        conditionId,
        statusId,
      },
      include: { category: true, subCategory: true, brandOption: true, conditionOption: true, statusOption: true },
    });
    res.status(201).json(presentProduct(product));
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: uniqueProductError(err) });
    }
    throw err;
  }
});

// PUT /api/products/:id
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const parsed = productInput.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Product not found" });

  if (parsed.data.categoryId || parsed.data.subCategoryId !== undefined) {
    const categoryId = parsed.data.categoryId ?? existing.categoryId;
    const subCategoryId =
      parsed.data.subCategoryId !== undefined ? parsed.data.subCategoryId : existing.subCategoryId;
    const validationError = await validateCategoryPair(categoryId, subCategoryId);
    if (validationError) return res.status(400).json({ error: validationError });
  }

  try {
    const brandId = parsed.data.brand ? await upsertBrandId(parsed.data.brand) : undefined;
    const conditionId = parsed.data.condition ? await upsertConditionId(parsed.data.condition) : undefined;
    const statusId = parsed.data.status ? await upsertStatusId(parsed.data.status) : undefined;

    const { brand, condition, status, ...productData } = parsed.data;
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(brandId !== undefined ? { brandId } : {}),
        ...(conditionId !== undefined ? { conditionId } : {}),
        ...(statusId !== undefined ? { statusId } : {}),
      },
      include: { category: true, subCategory: true, brandOption: true, conditionOption: true, statusOption: true },
    });
    res.json(presentProduct(product));
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: uniqueProductError(err) });
    }
    throw err;
  }
});

// DELETE /api/products/:id
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    throw err;
  }
});

export default router;
