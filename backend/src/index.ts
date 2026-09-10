import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import categoriesRouter from "./routes/categories";
import subCategoriesRouter from "./routes/subcategories";
import productsRouter from "./routes/products";
import productBrandsRouter from "./routes/product-brands";
import productConditionsRouter from "./routes/product-conditions";
import productStatusesRouter from "./routes/product-statuses";
import authRouter from "./routes/auth";
import ordersRouter from "./routes/orders";
import customersRouter from "./routes/customers";
import uploadRouter from "./routes/upload";
import { logError } from "./lib/logger";
import { prisma } from "./lib/prisma";

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS ?? "http://localhost:3000,http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

app.use("/uploads", express.static("uploads"));

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "ok" });
  } catch (error) {
    logError(error, { route: "/health", type: "databaseHealth" });
    res.status(503).json({ status: "error", database: "unavailable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/subcategories", subCategoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/product-brands", productBrandsRouter);
app.use("/api/product-conditions", productConditionsRouter);
app.use("/api/product-statuses", productStatusesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/customers", customersRouter);
app.use("/api/upload", uploadRouter);

app.use((req, res) => {
  logError(`Route not found: ${req.method} ${req.path}`, {
    path: req.path,
    type: "notFound",
  });
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.use(
  (err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logError(err, { method: req.method, path: req.path });
    res.status(500).json({ error: "Internal server error" });
  }
);

process.on("uncaughtException", (error) => logError(error, { type: "uncaughtException" }));
process.on("unhandledRejection", (error) => logError(error, { type: "unhandledRejection" }));

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`shopco-backend listening on http://localhost:${port}`);
});
