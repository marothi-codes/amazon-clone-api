import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import { isAdmin, isAuthenticated } from "../utils.js";

const orderRouter = express.Router();

orderRouter.get(
  "/",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate("user", "name");
    res.send(orders);
  })
);

orderRouter.get(
  "/history",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

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

orderRouter.get(
  "/:id",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) res.send(order);
    else
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The order specified does not exist...",
      });
  })
);

orderRouter.put(
  "/:id/pay",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updatedOrder = await order.save();
      res.send({ message: "Order Paid", order: updatedOrder });
    } else
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The order specified does not exist...",
      });
  })
);

orderRouter.put(
  "/:id/deliver",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.send({ message: "Order marked as delivered", order: updatedOrder });
    } else
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The order specified does not exist...",
      });
  })
);

orderRouter.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      const orderToDelete = await order.remove();
      res.send({ message: "Order deleted", order: orderToDelete });
    } else {
      res.status(400).send({
        message:
          "HTTP Status Code: 400 (Bad Request) - The order specified does not exist...",
      });
    }
  })
);

export default orderRouter;
