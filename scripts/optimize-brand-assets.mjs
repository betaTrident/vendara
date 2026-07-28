import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const LIGHT_SOURCE = "src/components/app/assets/logo/light-modee.svg";

const require = createRequire(import.meta.url);
const root = process.cwd();
const outDir = resolve(root, "public/brand");
mkdirSync(outDir, { recursive: true });

const extractEmbeddedImage = (svgPath) => {
  const svg = readFileSync(svgPath, "utf8");
  const matches = [...svg.matchAll(/(?:xlink:href|href)="data:image\/(png|jpeg);base64,([^"]+)"/g)];
  const embeddedImages = matches.map((match) => ({
    format: match[1],
    buffer: Buffer.from(match[2], "base64"),
  }));
  const selected = embeddedImages.sort(
    (left, right) => right.buffer.byteLength - left.buffer.byteLength,
  )[0];

  if (!selected) {
    throw new Error(`No embedded raster found in ${svgPath}`);
  }

  return {
    ...selected,
    svg,
  };
};

const wrapPngAsSvg = (pngBuffer, width, height) => {
  const b64 = pngBuffer.toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-hidden="true">
  <image href="data:image/png;base64,${b64}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" />
</svg>
`;
};

const optimizeWordmark = async (sourcePath, outName) => {
  const { svg } = extractEmbeddedImage(sourcePath);
  const outputPath = resolve(outDir, outName);
  let outBuffer;
  let width = 640;
  let height = 160;

  try {
    const sharp = require("sharp");
    const image = sharp(Buffer.from(svg)).trim();
    const meta = await image.metadata();
    const targetWidth = Math.min(meta.width ?? 1280, 960);
    const resized = await image
      .resize({ width: targetWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, quality: 90 })
      .toBuffer({ resolveWithObject: true });
    outBuffer = resized.data;
    width = resized.info.width;
    height = resized.info.height;
  } catch (error) {
    if (!existsSync(outputPath)) {
      throw new Error(
        `Unable to optimize ${sourcePath}, and no checked-in derivative exists at ${outputPath}. Install sharp before regenerating brand assets.`,
        { cause: error },
      );
    }

    console.warn(`Reusing the checked-in optimized derivative ${outName}; sharp is unavailable.`);
    return {
      outName,
      bytes: statSync(outputPath).size,
      width: null,
      height: null,
      reusedExisting: true,
    };
  }

  writeFileSync(outputPath, wrapPngAsSvg(outBuffer, width, height));
  return { outName, bytes: outBuffer.byteLength, width, height };
};

const main = async () => {
  const light = {
    absolutePath: resolve(root, LIGHT_SOURCE),
    relativePath: LIGHT_SOURCE,
  };
  const dark = {
    absolutePath: resolve(root, "src/components/app/assets/logo/darkmode.svg"),
    relativePath: "src/components/app/assets/logo/darkmode.svg",
  };

  const results = [
    await optimizeWordmark(light.absolutePath, "vendara-wordmark-light.svg"),
    await optimizeWordmark(dark.absolutePath, "vendara-wordmark-dark.svg"),
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
    sourcesUnchanged: [light.relativePath, dark.relativePath],
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
      "Wordmarks rendered from the complete source SVG composition; sharp used when available.",
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
