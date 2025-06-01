import {Router} from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db";
import { JWT_SECRET } from "../../../config";

export const authRouter = Router();


authRouter.post("/signin", async (req, res) =>{

    const pubAddress = "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzcZ";

    const existingUser = await prisma.user.findFirst({
        where: {
            address: pubAddress
        }
    })

    if(existingUser) {
        const token =  jwt.sign({
            userId: existingUser.id
        },JWT_SECRET)

        res.json({
            token
        })
        
    } else {
        const user = await prisma.user.create({
            data: {
                address: pubAddress
            }
        })

        const token =  jwt.sign({
            userId: user.id
        },JWT_SECRET)

        res.json({
            token: token
        })
    }




    res.status(200).json({
        message: "successfully signin"
    })
})

