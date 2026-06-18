import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);
app.get("/", (_, res) => {
  res.json({
    message: "Orchard Lease API Running"
  });
});

export default app;