import express from "express";
import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import config from "../config.js";
import { isAuthenticated } from "../utils.js";

const uploadRouter = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});

const upload = multer({ storage });

uploadRouter.post("/", isAuthenticated, upload.single("image"), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;
  res.send(imageUrl);
});

aws.config.update({
  accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_S3_ACCESS_KEY_SECRET,
});

const s3 = new aws.S3();
const storageS3 = multerS3({
  s3,
  bucket: "amazon-clone-mc",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadS3 = multer({ storage: storageS3 });

uploadRouter.post("/s3", uploadS3.single("image"), (req, res) => {
  res.send(req.file.location);
});

export default uploadRouter;
