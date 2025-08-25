import { UploadApiOptions } from "cloudinary";
import cloudinary from "../lib/cloudinary";

type UploadResult = {
  secure_url: string;
  public_id: string;
};

/**
 * Upload image (from browser or backend) to Cloudinary.
 *
 * @param image - File from browser (`File`) or backend (`Express.Multer.File`)
 * @param subFolder - Optional Cloudinary folder (default: "")
 * @returns Promise with `secure_url` and `public_id`
 * @throws If buffer not found (in backend)
 */
export default async function uploadToCloudinary(file: File | Express.Multer.File, subFolder: string = "portfolio"): Promise<UploadResult> {
  let buffer: Buffer;

  if (typeof window !== "undefined" && file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    const nodeImage = file as Express.Multer.File;
    if (!nodeImage.buffer) {
      throw new Error("Image buffer not fount (backend)");
    }

    buffer = nodeImage.buffer;
  }

  const options: UploadApiOptions = {
    folder: `portfolio/${subFolder}`,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err);
      resolve({
        secure_url: result.secure_url,
        public_id: result.public_id,
      });
    });
    stream.end(buffer);
  });
}
