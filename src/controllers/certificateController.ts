import { NextFunction, Request, Response } from "express";
import createError from "http-errors";
import { allCertificates, destroy, getCertificateById, store, update } from "../services/certificateServices";
import uploadToCloudinary from "../utils/uploadToCloudinary";
import destroyFromCloudinary from "../utils/destroyFromCloudinary";

/**
 * Get all certificates from the database.
 *
 * @route GET /api/certificates
 * @returns {200 OK} Returns list of certificates
 * @returns {500 Internal Server Error} On unexpected error
 */
export const getAllCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const certificates = await allCertificates();

    if (certificates.length === 0) {
      return res.status(200).json({
        success: true,
        error: false,
        message: "No certificates found!",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      error: false,
      data: certificates,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Get detail of a certificate by its ID.
 *
 * @route GET /api/certificates/:id
 * @param {string} id - ID of the certificate to retrieve
 * @returns {200 OK} Returns the certificate data
 * @returns {404 Not Found} If certificate not found
 * @returns {500 Internal Server Error} On unexpected error
 */
export const getDetailCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const certificate = await getCertificateById(id);
    if (!certificate) {
      return next(createError(404, "Certificate not found!"));
    }

    return res.status(200).json({
      success: true,
      error: false,
      message: "Successfully to get certificate!",
      data: certificate,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Create a new certificate with image upload.
 *
 * @route POST /api/certificates/create
 * @param {string} title - Certificate title
 * @param {Express.Multer.File} req.file - Uploaded certificate image
 * @returns {201 Created} On successful creation
 * @returns {400 Bad Request} If image is invalid or missing
 * @returns {500 Internal Server Error} On unexpected error
 */
export const addNewCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    const certificateImage = req.file;

    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!certificateImage) return next(createError(400, "Image is required!"));
    if (!allowedMime.includes(certificateImage.mimetype) || certificateImage.size > maxSize) return next(createError(400, "Invalid image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));

    const { secure_url, public_id } = await uploadToCloudinary(certificateImage, "certificate");
    const newCertificate = await store(title, secure_url, public_id);

    return res.status(201).json({
      success: true,
      error: false,
      message: "Successfully to create certificate!",
      data: newCertificate,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Edit an existing certificate by ID. Optionally updates image.
 *
 * @route PUT /api/certificates/edit/:id
 * @param {string} id - ID of the certificate
 * @param {string} [title] - New title (optional)
 * @param {Express.Multer.File} [req.file] - New image file (optional)
 * @returns {200 OK} On successful update
 * @returns {400 Bad Request} If image is invalid
 * @returns {404 Not Found} If certificate not found
 * @returns {500 Internal Server Error} On unexpected error
 */
export const editCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.body;
    const { id } = req.params;
    const certificateImage = req.file;

    const allowedMime = ["image/jpg", "image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    const certificate = await getCertificateById(id);

    if (!certificate) {
      return next(createError(404, "Certificate not found!"));
    }

    let certificateUrl = certificate.certificateUrl;
    let certificateId = certificate.certificate_public_id;
    if (certificateImage) {
      if (!allowedMime.includes(certificateImage.mimetype) && certificateImage.size > maxSize) {
        return next(createError(400, "Invalid image file! Must be JPG, JPEG, PNG, or WEBP under 2MB."));
      }

      if (certificateId) {
        await destroyFromCloudinary(certificateId);
      }

      const uploadResult = await uploadToCloudinary(certificateImage, "certificate");
      certificateUrl = uploadResult.secure_url;
      certificateId = uploadResult.public_id;
    }

    const updateData = {
      title: title ?? certificate.title,
      certificateUrl,
      certificateId,
    };
    const updatedCertificate = await update(certificate.id, updateData.title, updateData.certificateUrl, updateData.certificateId);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Update certificate successfully!",
      data: updatedCertificate,
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};

/**
 * Delete a certificate by its ID.
 *
 * This will remove the certificate from the database and also delete the associated image from Cloudinary.
 *
 * @route DELETE /api/certificates/delete/:id
 * @param {string} id - ID of the certificate to delete
 * @returns {200 OK} If deletion is successful
 * @returns {404 Not Found} If the certificate is not found
 * @returns {500 Internal Server Error} If an unexpected error occurs
 */
export const deleteCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const certificate = await getCertificateById(id);
    if (!certificate) {
      return next(createError(404, "Certificate not found!"));
    }

    await destroyFromCloudinary(certificate.certificate_public_id);
    await destroy(certificate.id);

    return res.status(200).json({
      success: true,
      error: false,
      message: "Deleted certificate successfully!",
    });
  } catch (error) {
    console.error(error);
    return next(createError(500, "Something went wrong!"));
  }
};
