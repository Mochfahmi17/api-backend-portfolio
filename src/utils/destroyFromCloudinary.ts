import cloudinary from "../lib/cloudinary";

export default async function destroyFromCloudinary(publicId: string): Promise<void> {
  if (!publicId) return;
  const resourceType = publicId.match(/\.(pdf|docx|doc)$/i) ? "raw" : "image";
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
