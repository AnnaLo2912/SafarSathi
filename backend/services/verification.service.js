import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads", "verification");

export async function persistUploadedFile(file) {
  await fs.mkdir(uploadsDir, { recursive: true });
  const ext = path.extname(file.originalname || "") || (file.mimetype === "application/pdf" ? ".pdf" : ".png");
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const absolutePath = path.join(uploadsDir, uniqueName);
  await fs.writeFile(absolutePath, file.buffer);
  return {
    absolutePath,
    relativeUrl: `/uploads/verification/${uniqueName}`,
  };
}

export async function preprocessImage(inputPath) {
  const parsed = path.parse(inputPath);
  const outputPath = path.join(parsed.dir, `${parsed.name}-preprocessed${parsed.ext || ".png"}`);

  await sharp(inputPath)
    .grayscale()
    .normalize()
    .threshold(150)
    .toFile(outputPath);

  return outputPath;
}

async function runTesseractFromPath(imagePath) {
  const result = await Tesseract.recognize(imagePath, "eng", {
    logger: () => {},
  });

  return {
    text: result?.data?.text || "",
    confidence: typeof result?.data?.confidence === "number" ? result.data.confidence / 100 : 0.5,
  };
}

export async function extractTextWithOcr(file, persistedPath) {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    const text = parsed?.text?.trim() || "";

    // For text-based PDFs, this is more reliable than image OCR.
    if (text.length > 20) {
      return {
        text,
        confidence: 0.85,
      };
    }

    return {
      text,
      confidence: 0.4,
    };
  }

  const preprocessedPath = await preprocessImage(persistedPath);
  return runTesseractFromPath(preprocessedPath);
}
