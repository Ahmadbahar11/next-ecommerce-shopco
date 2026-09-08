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

const productBrandInput = z.object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
});

router.get("/", async (_req, res) => {
    const brands = await prisma.productBrand.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
    });
    res.json(brands.map(({ _count, ...brand }) => ({ ...brand, productCount: _count.products })));
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
    const parsed = productBrandInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const name = parsed.data.name.trim();
    const slug = (parsed.data.slug ?? slugify(name)).trim();

    try {
        const brand = await prisma.productBrand.create({
            data: { name, slug },
        });
        res.status(201).json(brand);
    } catch (err: any) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "This brand already exists" });
        }
        throw err;
    }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = productBrandInput.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await prisma.productBrand.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Brand not found" });

    const name = parsed.data.name?.trim();
    const slug = parsed.data.slug?.trim() || (name ? slugify(name) : undefined);
    try {
        const brand = await prisma.productBrand.update({
            where: { id },
            data: { ...(name ? { name } : {}), ...(slug ? { slug } : {}) },
        });
        res.json(brand);
    } catch (err: any) {
        if (err.code === "P2002") return res.status(409).json({ error: "This brand already exists" });
        throw err;
    }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
        return res.status(409).json({ error: `Cannot delete: ${productCount} product(s) still use this brand.` });
    }
    try {
        await prisma.productBrand.delete({ where: { id } });
        res.status(204).send();
    } catch (err: any) {
        if (err.code === "P2025") return res.status(404).json({ error: "Brand not found" });
        throw err;
    }
});

export default router;
