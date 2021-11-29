import express from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import data from "../data.js";
import bcrypt from "bcryptjs";
import { generateToken, isAdmin, isAuthenticated } from "../utils.js";

const userRouter = express.Router();

const _400_ERROR =
  "HTTP Status Code: 400 (Bad Request) - The user specified does not exist. Check the id URL parameter for typos...";

userRouter.post(
  "/sign-up",
  expressAsyncHandler(async (req, res) => {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });
    const newUser = await user.save();
    res.send({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
      isSeller: newUser.isSeller,
      token: generateToken(newUser),
    });
  })
);

userRouter.get(
  "/",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.get(
  "/seed",
  expressAsyncHandler(async (req, res) => {
    // await User.remove({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);

userRouter.get(
  "/top-sellers",
  expressAsyncHandler(async (req, res) => {
    const topSellers = await User.find({ isSeller: true })
      .sort({ "seller.rating": -1 })
      .limit(3);
    res.send(topSellers);
  })
);

userRouter.post(
  "/sign-in",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          isSeller: user.isSeller,
          token: generateToken(user),
        });
        return;
      }
    }
    res
      .status(401)
      .send({ message: "The password or email address is invalid." });
  })
);

userRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) res.send(user);
    else
      res
        .status(400)
        .send({ message: "The user you've specified does not exist." });
  })
);

userRouter.put(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name === user.name ? user.name : req.body.name;
      user.isAdmin =
        req.body.isAdmin === user.isAdmin ? user.isAdmin : req.body.isAdmin;
      user.isSeller =
        req.body.isSeller === user.isSeller ? user.isSeller : req.body.isSeller;
      const updatedUser = await user.save();
      res.send({ message: "User updated successfully.", user: updatedUser });
    } else res.status(400).send({ message: _400_ERROR });
  })
);

userRouter.put(
  "/profile/:id",
  isAuthenticated,
  expressAsyncHandler(async (req, res) => {
    const id = mongoose.Types.ObjectId(req.params.id);
    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name === user.name ? user.name : req.body.name;
      user.email = req.body.email === user.email ? user.email : req.body.email;

      if (user.isSeller) {
        user.seller.name =
          req.body.sellerName === user.seller.name
            ? user.seller.name
            : req.body.sellerName;
        user.seller.logo =
          req.body.sellerLogo === user.seller.logo
            ? user.seller.logo
            : req.body.sellerLogo;
        user.seller.description =
          req.body.sellerDescription === user.seller.description
            ? user.seller.description
            : req.body.sellerDescription;
      }

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();

      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSeller: updatedUser.isSeller,
        token: generateToken(updatedUser),
      });
    }
  })
);

userRouter.delete(
  "/:id",
  isAuthenticated,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        res.status(401).send({
          message: "You're not allowed to delete users in the admin role.",
        });
        return;
      }
      const deletedUser = await user.remove();
      res.send({ message: "User successfully deleted.", user: deletedUser });
    } else res.status(400).send({ message: _400_ERROR });
  })
);

export default userRouter;
