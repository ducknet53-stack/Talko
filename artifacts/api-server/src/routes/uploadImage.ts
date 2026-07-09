import { Router, type IRouter } from "express";
import multer from "multer";
import { requireFirebaseAuth } from "../lib/authMiddleware";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    cb(null, true);
  },
});

router.post(
  "/upload-image",
  requireFirebaseAuth,
  (req, res, next) => {
    upload.single("image")(req, res, (err: unknown) => {
      if (err) {
        const message =
          err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE"
            ? "Yalnızca PNG, JPEG, WEBP veya GIF görselleri yüklenebilir."
            : "Görsel yüklenemedi. Dosya boyutu 8MB'ı aşıyor olabilir.";
        res.status(400).json({ error: message });
        return;
      }
      next();
    });
  },
  async (req, res): Promise<void> => {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    logger.error("IMGBB_API_KEY is not configured");
    res.status(500).json({ error: "Görsel yükleme servisi yapılandırılmamış." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "Görsel dosyası bulunamadı." });
    return;
  }

  try {
    const base64 = req.file.buffer.toString("base64");
    const body = new URLSearchParams();
    body.set("image", base64);

    const imgbbRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        body,
      },
    );

    const data = (await imgbbRes.json()) as {
      success?: boolean;
      data?: { url?: string };
      error?: { message?: string };
    };

    if (!imgbbRes.ok || !data.success || !data.data?.url) {
      logger.error({ data }, "ImgBB upload failed");
      res.status(502).json({ error: "Görsel yüklenemedi." });
      return;
    }

    res.json({ url: data.data.url });
  } catch (err) {
    logger.error({ err }, "Error uploading image to ImgBB");
    res.status(500).json({ error: "Görsel yüklenirken bir hata oluştu." });
  }
});

export default router;
