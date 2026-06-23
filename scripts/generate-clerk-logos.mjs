/**
 * Generates PNG logos for Clerk dashboard upload from SVG sources.
 * Run: node scripts/generate-clerk-logos.mjs
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const brandDir = path.join(root, "public", "brand");

const outputs = [
  {
    input: "clerk-logo.svg",
    output: "clerk-logo.png",
    width: 512,
    height: 512,
  },
  {
    input: "clerk-logo.svg",
    output: "clerk-logo-1024.png",
    width: 1024,
    height: 1024,
  },
  {
    input: "clerk-logo-wordmark.svg",
    output: "clerk-logo-wordmark.png",
    width: 640,
    height: 160,
  },
];

await mkdir(brandDir, { recursive: true });

for (const item of outputs) {
  const inputPath = path.join(brandDir, item.input);
  const outputPath = path.join(brandDir, item.output);
  const svg = await readFile(inputPath);

  await sharp(svg)
    .resize(item.width, item.height, { fit: "contain", background: "#ffffff" })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Created ${path.relative(root, outputPath)} (${item.width}x${item.height})`);
}

console.log("\nUpload public/brand/clerk-logo.png to Clerk Dashboard → Configure → Customization → Logo");
