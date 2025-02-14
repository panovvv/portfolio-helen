import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

async function generateManifest() {
  // Define the source directory (your gallery images)
  const galleryPath = path.join(process.cwd(), "public/gallery");

  // Read the contents of the gallery folder
  const files = await fs.readdir(galleryPath);

  // Filter to only image files (jpg and png)
  const imageFiles = files.filter((file) => /\.(jpe?g|png)$/i.test(file));

  // Build a manifest array by reading intrinsic dimensions for each image
  const manifest = [];
  for (const file of imageFiles) {
    const filePath = path.join(galleryPath, file);
    try {
      const metadata = await sharp(filePath).metadata();
      manifest.push({
        filename: file,
        width: metadata.width,
        height: metadata.height,
      });
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
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
