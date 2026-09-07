import { Router, Request, Response, RequestHandler } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const requireAdmin: RequestHandler[] = [authenticate, authorize("admin")];

const subCategoryInput = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().default(""),
  categoryId: z.number().int().positive(),
});

// GET /api/subcategories?categoryId=
router.get("/", async (req, res) => {
  const { categoryId } = req.query;
  const subCategories = await prisma.subCategory.findMany({
    where: categoryId ? { categoryId: Number(categoryId) } : undefined,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  const counts = await prisma.product.groupBy({
    by: ["subCategoryId"],
    _count: { _all: true },
  });
  const countMap = new Map(
    counts.filter((c) => c.subCategoryId !== null).map((c) => [c.subCategoryId as number, c._count._all])
  );

  res.json(
    subCategories.map((sub) => ({ ...sub, productCount: countMap.get(sub.id) ?? 0 }))
  );
});

// GET /api/subcategories/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const subCategory = await prisma.subCategory.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!subCategory) return res.status(404).json({ error: "Subcategory not found" });
  res.json(subCategory);
});

// POST /api/subcategories
router.post("/", requireAdmin, async (req: Request, res: Response) => {
  const parsed = subCategoryInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return res.status(400).json({ error: "categoryId does not exist" });

  try {
    const subCategory = await prisma.subCategory.create({ data: parsed.data });
    res.status(201).json(subCategory);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A subcategory with this slug already exists" });
    }
    throw err;
  }
});

// PUT /api/subcategories/:id
router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const parsed = subCategoryInput.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await prisma.subCategory.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: "Subcategory not found" });

  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
    if (!category) return res.status(400).json({ error: "categoryId does not exist" });
  }

  try {
    const subCategory = await prisma.subCategory.update({ where: { id }, data: parsed.data });
    res.json(subCategory);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A subcategory with this slug already exists" });
    }
    throw err;
  }
});

// DELETE /api/subcategories/:id
router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const productCount = await prisma.product.count({ where: { subCategoryId: id } });
  if (productCount > 0) {
    return res.status(409).json({
      error: `Cannot delete: ${productCount} product(s) still belong to this subcategory. Move or delete them first.`,
    });
  }

  try {
    await prisma.subCategory.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Subcategory not found" });
    }
    throw err;
  }
});

export default router;
