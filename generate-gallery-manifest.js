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

async function generateManifest() {
  // Define the source directory (your gallery images)
  const galleryPath = path.join(process.cwd(), "public/gallery");

  // Recursively collect image files (relative paths under galleryPath)
  const imageFiles = await walkDir(galleryPath, galleryPath);

  // Build a manifest array by reading intrinsic dimensions for each image
  const manifest = [];
  for (const relPath of imageFiles) {
    const filePath = path.join(galleryPath, relPath);
    try {
      const metadata = await sharp(filePath).metadata();
      manifest.push({
        filename: relPath,
        width: metadata.width,
        height: metadata.height,
      });
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
}

generateManifest().catch((err) => {
  console.error("Error generating manifest:", err);
});
