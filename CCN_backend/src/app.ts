import express, { Application } from "express";
import http from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cors from "cors";
import { ChatRouter } from "./routes/chatRoutes";
import { MeetingRouter } from "./routes/meetingRoutes";
import userRouter from "./routes/userRoutes";
import authRouter from "./routes/authRoutes";
import subscriptionRouter from "./routes/subscriptionRoutes";
import adminRouter from "./routes/adminRoutes";
import { DB_URI, ENVIRONMENT } from "./utils/secret";
import middlewares from "./utils/middlewares";
import * as doc from "./doc.json";
import swaggerUI from "swagger-ui-express";
import errorHandler from "errorhandler";
import { ROLE } from "./models/userModel";
import fileRoute from "./routes/fileRoutes";

// instances
const app: Application = express();
const server = http.createServer(app);
const io = new Server(server);

// error handling
if (ENVIRONMENT === "development") {
  app.use(errorHandler());
}

// database connection
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("\nCCN database connection established");
  })
  .catch((err) => {
    console.log("\nAn error occured\n%s", err);
  });

// connection port
const port = process.env.PORT || 3000;

const chatRouter = new ChatRouter(io);
const meetingRouter = new MeetingRouter();

// middleware
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/doc", swaggerUI.serve, swaggerUI.setup(doc, { explorer: true }));

app.use("/api/auth", authRouter);
app.use("/api/user", middlewares.auth, userRouter);
app.use("/api/subscription", middlewares.auth, subscriptionRouter);
app.use(
  "/api/admin",
  middlewares.auth,
  middlewares.authRole([ROLE.ADMIN, ROLE.SUPERUSER]),
  adminRouter
);
app.use("/api/file", fileRoute); 
app.use("/api/chat", middlewares.auth, chatRouter.router);
app.use("/api/meeting", middlewares.auth, meetingRouter.router);
io.use(middlewares.socket);

io.on("connection", async (socket) => {
  console.log("User connected");

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  try {
    await chatRouter.handleSocket(socket);
  } catch (err) {
    socket.disconnect(true);
  }
});

// server
server.listen(port, () => {
  console.log(
    "CCN is running on http://127.0.0.1:%d in %s mode",
    port,
    process.env.NODE_ENV
  );
  console.log(" Enter ctrl + c to quit");
});
