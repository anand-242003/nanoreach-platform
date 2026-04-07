import multer from "multer";
import multerS3 from "multer-s3";
import s3 from "../config/s3.js";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error("Invalid file type. Allowed: PDF, JPG, JPEG, PNG"), false);
};

const sanitizeFilename = (name) => name.replace(/[^a-zA-Z0-9._-]/g, "_");

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read", // remove if private
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `uploads/${Date.now()}-${sanitizeFilename(file.originalname)}`;
      cb(null, fileName);
    },
  }),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

export default upload;