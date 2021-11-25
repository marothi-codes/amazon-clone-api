import express from "express";
import multer from "multer";
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

export default uploadRouter;
