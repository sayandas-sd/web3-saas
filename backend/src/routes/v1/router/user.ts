import {Router} from "express";

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
    res.status(200).json({
        message: "successfully signup"
    })
})

authRouter.post("/signin", (req, res) =>{
    res.status(200).json({
        message: "successfully signin"
    })
})

