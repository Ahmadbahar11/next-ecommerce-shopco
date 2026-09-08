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

const productConditionInput = z.object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
});

router.get("/", async (_req, res) => {
    const conditions = await prisma.productConditionOption.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
    });
    res.json(conditions.map(({ _count, ...condition }) => ({ ...condition, productCount: _count.products })));
});

router.post("/", requireAdmin, async (req: Request, res: Response) => {
    const parsed = productConditionInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.flatten() });
    }

    const name = parsed.data.name.trim();
    const slug = (parsed.data.slug ?? slugify(name)).trim();

    try {
        const condition = await prisma.productConditionOption.create({
            data: { name, slug },
        });
        res.status(201).json(condition);
    } catch (err: any) {
        if (err.code === "P2002") {
            return res.status(409).json({ error: "This condition already exists" });
        }
        throw err;
    }
});

router.put("/:id", requireAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = productConditionInput.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await prisma.productConditionOption.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Condition not found" });

    const name = parsed.data.name?.trim();
    const slug = parsed.data.slug?.trim() || (name ? slugify(name) : undefined);
    try {
        const condition = await prisma.productConditionOption.update({
            where: { id },
            data: { ...(name ? { name } : {}), ...(slug ? { slug } : {}) },
        });
        res.json(condition);
    } catch (err: any) {
        if (err.code === "P2002") return res.status(409).json({ error: "This condition already exists" });
        throw err;
    }
});

router.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const productCount = await prisma.product.count({ where: { conditionId: id } });
    if (productCount > 0) {
        return res.status(409).json({ error: `Cannot delete: ${productCount} product(s) still use this condition.` });
    }
    try {
        await prisma.productConditionOption.delete({ where: { id } });
        res.status(204).send();
    } catch (err: any) {
        if (err.code === "P2025") return res.status(404).json({ error: "Condition not found" });
        throw err;
    }
});

export default router;
