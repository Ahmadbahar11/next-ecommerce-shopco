import { Router, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const requireAdmin: RequestHandler[] = [authenticate, authorize("admin")];

const categoryInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
});

// GET /api/categories - flat list with subcategories and product counts
router.get("/", async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { subCategories: true },
    orderBy: { name: "asc" },
  });
  const productCounts = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });
  const subCategoryCounts = await prisma.product.groupBy({
    by: ["subCategoryId"],
    _count: { _all: true },
  });
  const categoryCountMap = new Map(productCounts.map((c) => [c.categoryId, c._count._all]));
  const subCategoryCountMap = new Map(
    subCategoryCounts
      .filter((c) => c.subCategoryId !== null)
      .map((c) => [c.subCategoryId as number, c._count._all])
  );

  res.json(
    categories.map((category) => ({
      ...category,
      productCount: categoryCountMap.get(category.id) ?? 0,
      subCategories: category.subCategories.map((sub) => ({
        ...sub,
        productCount: subCategoryCountMap.get(sub.id) ?? 0,
      })),
    }))
  );
});

// GET /api/categories/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const category = await prisma.category.findUnique({
    where: { id },
    include: { subCategories: true },
  });
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.json(category);
});

// POST /api/categories
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const parsed = categoryInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json(category);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A category with this slug already exists" });
    }
    throw err;
  }
});

// PUT /api/categories/:id
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const parsed = categoryInput.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Category not found" });

  try {
    const category = await prisma.category.update({ where: { id }, data: parsed.data });
    res.json(category);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A category with this slug already exists" });
    }
    throw err;
  }
});

// DELETE /api/categories/:id
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const subCategoryCount = await prisma.subCategory.count({ where: { categoryId: id } });
  if (subCategoryCount > 0) {
    return res.status(409).json({
      error: `Cannot delete: ${subCategoryCount} subcategor${subCategoryCount === 1 ? "y" : "ies"} still reference this category. Move or delete them first.`,
    });
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return res.status(409).json({
      error: `Cannot delete: ${productCount} product(s) still belong to this category. Move or delete them first.`,
    });
  }

  try {
    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Category not found" });
    }
    throw err;
  }
});

export default router;
