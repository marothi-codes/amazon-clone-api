import express from "express";
import dotenv from "dotenv";
import data from "./data.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.get("/api/products", (req, res) => {
  res.send(data.products);
});

app.get("/", (req, res) => {
  res.send("The server is ready.");
});

app.listen(PORT, () =>
  console.log("The app is running on: http//:localhost:" + PORT)
);
