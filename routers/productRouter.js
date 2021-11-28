import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import data from "../data.js";
import { isAdmin, isAuthenticated, isSellerOrAdmin } from "../utils.js";

const productRouter = express.Router();

productRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const seller = req.query.seller || "";
    const sellerFilter = seller ? { seller } : {};
    const products = await Product.find({ ...sellerFilter }).populate(
      "seller",
      "seller.name seller.logo"
    );
    res.send(products);
  })
);

productRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    // await Product.remove({});
    const createdProducts = await Product.insertMany(data.products);
    res.send(createdProducts);
  })
);

productRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "seller.name seller.logo seller.rating seller.numReviews"
    );
    if (product) res.send(product);
    else
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The product specified does not exist.",
      });
  })
);

productRouter.post(
  "/",
  isAuthenticated,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = new Product({
      name: "sample name " + Date.now(),
      seller: req.user_id,
      image: "/images/p1.jpg",
      price: 0,
      category: "sample category",
      brand: "sample brand",
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: "sample description",
    });
    const newProduct = await product.save();
    res.send({ message: "Product Added.", product: newProduct });
  })
);

productRouter.put(
  "/:id",
  isAuthenticated,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;

      const updatedProduct = await product.save();
      res.send({
        message: "Product update operation succeeded.",
        product: updatedProduct,
      });
    } else {
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The product specified does not exist.",
      });
    }
  })
);

productRouter.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      const productToDelete = await product.remove();
      res.send({
        message: "Product Successfully Deleted",
        product: productToDelete,
      });
    } else
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The product specified does not exist.",
      });
  })
);

export default productRouter;
