import http from "http";
import { Server } from "socket.io";
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import userRouter from "./routers/userRouter.js";
import productRouter from "./routers/productRouter.js";
import orderRouter from "./routers/orderRouter.js";
import uploadRouter from "./routers/uploadRouter.js";

dotenv.config();

const app = express();

// Middleware...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// HTTP Header config.
app.disable("x-powered-by");

// Connect mongoose ODM to MongoDB.
mongoose.connect(process.env.MONGODB_URL);

// Routes.
app.use("/api/uploads", uploadRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.get("/api/config/paypal", (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID);
});
app.get("/api/config/google", (req, res) => {
  res.send(process.env.GOOGLE_API_KEY);
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("The server is ready.");
});

app.use((err, req, res, next) => {
  res.status(500).send({ message: err.message });
});

const PORT = process.env.PORT;

const httpServer = http.Server(app);
const socket_io = new Server(httpServer, { cors: { origin: "*" } });
const users = [];

socket_io.on("connection", (socket) => {
  console.log("connection", socket.id);
  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log("Offline", user.name);
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        socket_io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });

  socket.on("onLogin", (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };

    const existUser = users.find((x) => x._id === updatedUser._id);

    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }

    console.log("Online", user.name);
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      socket_io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.isAdmin) {
      socket_io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

  socket.on("onUserSelected", (user) => {
    const admin = users.find((x) => x.isAdmin && x.online);
    if (admin) {
      const existUser = users.find((x) => x._id === user._id);
      socket_io.to(admin.socketId).emit("selectUser", existUser);
    }
  });

  socket.on("onMessage", (message) => {
    if (message.isAdmin) {
      const user = users.find((x) => x._id === message._id && x.online);
      if (user) {
        socket_io.to(user.socketId).emit("message", message);
        user.messages.push(message);
      }
    } else {
      const admin = users.find((x) => x.isAdmin && x.online);
      if (admin) {
        socket_io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x._id === message._id && x.online);
        user.messages.push(message);
      } else {
        socket_io.to(socket.id).emit("message", {
          name: "Admin",
          body: "Sorry. I am not online right now",
        });
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`App is running on: http://localhost:${PORT}`);
});
