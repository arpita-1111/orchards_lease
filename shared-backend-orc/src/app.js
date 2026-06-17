import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.get("/", (_, res) => {
 res.json({
   message: "Orchard Lease API Running"
 });
});

export default app;