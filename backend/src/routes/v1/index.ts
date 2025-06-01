import { Router } from "express";
import { authRouter } from  "./router/user";
import { workerRouter } from "./router/worker";

export const router = Router();


router.use("/user", authRouter);
router.use("/worker", workerRouter)