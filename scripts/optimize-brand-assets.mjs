import { readFileSync, copyFileSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd();
const outDir = resolve(root, "public/brand");
mkdirSync(outDir, { recursive: true });

const extractEmbeddedImage = (svgPath) => {
  const svg = readFileSync(svgPath, "utf8");
  const match = svg.match(
    /xlink:href="data:image\/(png|jpeg);base64,([^"]+)"|href="data:image\/(png|jpeg);base64,([^"]+)"/,
  );
  if (!match) {
    throw new Error(`No embedded raster found in ${svgPath}`);
  }
  const format = match[1] ?? match[3];
  const b64 = match[2] ?? match[4];
  return { format, buffer: Buffer.from(b64, "base64"), svg };
};

const wrapPngAsSvg = (pngBuffer, width, height) => {
  const b64 = pngBuffer.toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-hidden="true">
  <image href="data:image/png;base64,${b64}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
</svg>
`;
};

const optimizeWordmark = async (sourcePath, outName) => {
  const { buffer } = extractEmbeddedImage(sourcePath);
  let outBuffer = buffer;
  let width = 640;
  let height = 160;

  try {
    const sharp = require("sharp");
    const image = sharp(buffer).trim();
    const meta = await image.metadata();
    const targetWidth = Math.min(meta.width ?? 1280, 960);
    const resized = await image
      .resize({ width: targetWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer({ resolveWithObject: true });
    outBuffer = resized.data;
    width = resized.info.width;
    height = resized.info.height;
  } catch {
    // sharp unavailable — ship trimmed-as-possible original raster wrapped in SVG
  }

  writeFileSync(resolve(outDir, outName), wrapPngAsSvg(outBuffer, width, height));
  return { outName, bytes: outBuffer.byteLength, width, height };
};

const main = async () => {
  const light = resolve(root, "src/components/app/assets/logo/light-mode.svg");
  const dark = resolve(root, "src/components/app/assets/logo/darkmode.svg");

  const results = [
    await optimizeWordmark(light, "vendara-wordmark-light.svg"),
    await optimizeWordmark(dark, "vendara-wordmark-dark.svg"),
  ];

  // Icon derivatives: reuse existing PWA icons until a ribbon-only crop is supplied.
  copyFileSync(
    resolve(root, "public/icons/icon-192x192.png"),
    resolve(outDir, "vendara-app-icon-192.png"),
  );
  copyFileSync(
    resolve(root, "public/icons/icon-512x512.png"),
    resolve(outDir, "vendara-app-icon-512.png"),
  );

  writeFileSync(
    resolve(outDir, "vendara-mark.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-hidden="true">
  <image href="/brand/vendara-app-icon-192.png" width="64" height="64" preserveAspectRatio="xMidYMid meet" />
</svg>
`,
  );

  const report = {
    generatedAt: new Date().toISOString(),
    sourcesUnchanged: [
      "src/components/app/assets/logo/light-mode.svg",
      "src/components/app/assets/logo/darkmode.svg",
    ],
    outputs: Object.fromEntries(
      [
        "vendara-wordmark-light.svg",
        "vendara-wordmark-dark.svg",
        "vendara-mark.svg",
        "vendara-app-icon-192.png",
        "vendara-app-icon-512.png",
      ].map((name) => [name, statSync(resolve(outDir, name)).size]),
    ),
    wordmarkOptimize: results,
    notes: [
      "Source logo SVGs left untouched.",
      "Wordmarks re-wrapped from embedded rasters; sharp used when available.",
      "App mark PNGs currently reuse existing PWA icons pending ribbon-only export.",
    ],
  };

  writeFileSync(
    resolve(root, "contexts/execution/app-reference-redesign/phase-1-brand-assets.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
