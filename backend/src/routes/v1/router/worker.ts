import { Router } from "express";

export const workerRouter = Router();


workerRouter.post("/", (req, res)=>{
    res.status(200).json({
        message: "successfully send tasks"
    })
})