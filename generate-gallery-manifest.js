import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

async function walkDir(dir, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await walkDir(fullPath, baseDir);
      files.push(...subFiles);
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      // compute posix-style relative path under baseDir (public/gallery)
      const rel = path.relative(baseDir, fullPath).split(path.sep).join("/");
      files.push(rel);
    }
  }
  return files;
}

function isTwoByThree(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return { ok: false, ratio: NaN };
  }
  const ratio = width / height;
  const target = 2 / 3;
  // allow tiny numerical tolerance (~0.5%)
  const ok = Math.abs(ratio - target) <= 0.005;
  return { ok, ratio };
}

async function generateManifest() {
  // Define the source directory (your gallery images)
  const galleryPath = path.join(process.cwd(), "public/gallery");

  // Recursively collect image files (relative paths under galleryPath)
  const imageFiles = await walkDir(galleryPath, galleryPath);

  // Build a manifest array by reading intrinsic dimensions for each image
  const manifest = [];
  const wrongAspect = [];
  for (const relPath of imageFiles) {
    const filePath = path.join(galleryPath, relPath);
    try {
      const metadata = await sharp(filePath).metadata();
      const width = metadata.width;
      const height = metadata.height;

      manifest.push({
        filename: relPath,
        width,
        height,
      });

      const { ok, ratio } = isTwoByThree(width, height);
      if (!ok) {
        const ratioStr = Number.isFinite(ratio) ? ratio.toFixed(4) : "N/A";
        wrongAspect.push({
          filename: relPath,
          width: width ?? 0,
          height: height ?? 0,
          ratioStr,
        });
      }
    } catch (error) {
      console.error(`Error processing ${relPath}:`, error);
    }
  }

  // Define the output path for the manifest (assets/gallery_files.json)
  const manifestPath = path.join(process.cwd(), "assets/gallery_files.json");

  // Write the JSON file (formatted with indentation)
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(
    `Manifest generated with ${manifest.length} images at ${manifestPath}`,
  );

  // Aspect ratio report (expected exactly 2:3)
  if (wrongAspect.length > 0) {
    console.warn(
      `Aspect ratio check: expected 2:3. Found ${wrongAspect.length} image(s) with mismatched aspect ratio:`,
    );
    for (const item of wrongAspect) {
      console.warn(
        ` - ${item.filename} (${item.width}x${item.height}, AR=${item.ratioStr})`,
      );
    }
  } else {
    console.log("Aspect ratio check passed: all images are 2:3.");
  }
}

generateManifest().catch((err) => {
  console.error("Error generating manifest:", err);
});
