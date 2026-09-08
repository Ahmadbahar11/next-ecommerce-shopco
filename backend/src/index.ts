import "dotenv/config";
import express from "express";
import cors from "cors";
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

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
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
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`shopco-backend listening on http://localhost:${port}`);
});
