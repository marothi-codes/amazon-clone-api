import express from "express";
import dotenv from "dotenv";
import data from "./data.js";
import mongoose from "mongoose";
import userRouter from "./routers/userRouter.js";

dotenv.config();

const app = express();
mongoose.connect(
  process.env.MONGODB_URL || "mongodb://localhost/amazon-clone-2",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);

app.disable("x-powered-by");

app.use("/api/users", userRouter);

app.get("/api/products/:id", (req, res) => {
  const product = data.products.find((x) => x._id === req.params.id);

  if (product) {
    res.send(product);
  } else {
    res.status(400).send({ message: "Product not found." });
  }
});

app.get("/api/products", (req, res) => {
  res.send(data.products);
});

app.get("/", (req, res) => {
  res.send("The server is ready.");
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log("The app is running on: http//:localhost:" + PORT)
);
