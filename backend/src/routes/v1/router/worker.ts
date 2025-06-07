import { Router } from "express";
import { prisma } from "../../../db";
import jwt from "jsonwebtoken";
import { WORKER_JWT_SECRET } from "../../../config";
import { workerAuthmiddleWare } from "../../../middleware";

export const workerRouter = Router();


workerRouter.post("/signin", async(req, res)=>{
    
    try {
         const pubKey = "nknkasa";

        const existingUser = await prisma.worker.findFirst({
            where: {
                address: pubKey
            }
        })

        if(existingUser) {
            const token = jwt.sign({
                userId: existingUser.id
            }, WORKER_JWT_SECRET);

            res.status(200).json({
                token
            })
            return;

        } else {
            const user = await prisma.worker.create({
                data: {
                    address: pubKey,
                    pendingAmount: 0,
                    lockedAmount: 0
                }
            })

            const token = jwt.sign({
                userId: user.id
            }, WORKER_JWT_SECRET)

            res.status(200).json({
                token
            })
            return;
        }
    } catch(e) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }
    
})


workerRouter.get("/task", workerAuthmiddleWare ,async(req,res) => {

    //@ts-ignore
    const user_Id = req.userId;


    const alltask = await prisma.task.findFirst({
        where: {
            successful: false,
            submission: {
                none: {
                    workerId: user_Id,
                }
            }
        },
        select: {
            title: true,
            options: true
        }
    })

    if(!alltask) {
        res.status(411).json({
            message: "There are no more task left"
        })
        return;
    } else {
        res.status(200).json({
            alltask
        })
        return;
    }
})