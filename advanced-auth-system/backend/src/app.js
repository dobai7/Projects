import express from "express";
import authRouter from "./routes/auth.router.js";
import cookieparcer from "cookie-parser"

const app = express()

app.use(express.json());
app.use(cookieparcer())

app.use("/api/auth",authRouter);

export default app