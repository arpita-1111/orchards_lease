import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./src/app.js";

dotenv.config();

mongoose
.connect(process.env.MONGO_URI)
.then(() => {
 app.listen(process.env.PORT, () => {
   console.log(
    `Server running on ${process.env.PORT}`
   );
 });
})
.catch(console.error);