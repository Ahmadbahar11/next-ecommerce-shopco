import fs from "fs";
import path from "path";
import { Router } from "express";
import multer from "multer";

const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads", "products");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    cb(null, `${Date.now()}-${base || "product"}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      cb(new Error("Only JPG, PNG, GIF, and WEBP images are allowed."));
      return;
    }
    cb(null, true);
  },
});

function buildPublicUrl(filename: string) {
  const backendBaseUrl =
    process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
  return `${backendBaseUrl.replace(/\/$/, "")}/uploads/products/${filename}`;
}

router.post("/", upload.array("files", 10), (req, res) => {
  const uploadedFiles = Array.isArray(req.files) ? req.files : [];

  if (!uploadedFiles.length) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const urls = uploadedFiles.map((file) => buildPublicUrl(file.filename));

  return res.status(200).json({
    urls,
    url: urls[0],
    filename: uploadedFiles[0]?.filename,
    filenames: uploadedFiles.map((file) => file.filename),
  });
});

router.post("/single", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  return res.status(200).json({
    url: buildPublicUrl(req.file.filename),
    filename: req.file.filename,
  });
});

export default router;
