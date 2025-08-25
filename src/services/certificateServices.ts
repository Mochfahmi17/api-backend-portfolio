import db from "../lib/db";

export const allCertificates = async () => {
  try {
    const certificates = await db.certificate.findMany({ orderBy: { createdAt: "desc" } });
    return certificates;
  } catch (error) {
    throw error;
  }
};

export const getCertificateById = async (id: string) => {
  try {
    const certificate = await db.certificate.findUnique({ where: { id } });

    return certificate;
  } catch (error) {
    throw error;
  }
};

export const store = async (title: string, certificateUrl: string, certificate_public_id: string) => {
  try {
    const certificate = await db.certificate.create({ data: { title, certificateUrl, certificate_public_id } });

    return certificate;
  } catch (error) {
    throw error;
  }
};

export const update = async (id: string, title: string, certificateUrl: string, certificate_public_id: string) => {
  try {
    const updateCertificate = await db.certificate.update({
      where: { id },
      data: {
        title,
        certificateUrl,
        certificate_public_id,
      },
    });

    return updateCertificate;
  } catch (error) {
    throw error;
  }
};

export const destroy = async (id: string) => {
  try {
    const certificate = await db.certificate.delete({ where: { id } });
    return certificate;
  } catch (error) {
    throw error;
  }
};
