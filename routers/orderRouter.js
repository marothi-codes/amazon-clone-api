import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import { isAuthenticated } from "../utils.js";

const orderRouter = express.Router();

orderRouter.post(
  "/",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    if (req.body.orderItems.length === 0)
      res.status(400).send({ message: "Cart is empty." });
    else {
      const order = new Order({
        orderItems: req.body.orderItems,
        shippingAddress: req.body.shippingAddress,
        paymentMethod: req.body.paymentMethod,
        itemsPrice: req.body.itemsPrice,
        shippingPrice: req.body.shippingPrice,
        taxPrice: req.body.taxPrice,
        total: req.body.total,
        user: req.user._id,
      });
      const newOrder = await order.save();
      res.status(201).send({ message: "New order placed", order: newOrder });
    }
  })
);

export default orderRouter;
