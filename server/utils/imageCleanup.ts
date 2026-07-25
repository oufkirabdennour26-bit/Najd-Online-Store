import fs from 'fs';
import path from 'path';

/**
 * Safely deletes an image from the filesystem if it is a local upload.
 * @param imageUrl The URL of the image (e.g., /uploads/products/product-123.webp)
 */
export function deleteLocalImage(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;

  // Check if it is a local upload
  if (imageUrl.startsWith('/uploads/')) {
    // Convert URL path to filesystem path
    // Remove leading slash, join with current working directory
    const relativePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    const fullPath = path.join(process.cwd(), relativePath);

    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Successfully deleted old image file: ${fullPath}`);
        return true;
      }
    } catch (err) {
      console.error(`Failed to delete local image file at ${fullPath}:`, err);
    }
  }

  return false;
}
