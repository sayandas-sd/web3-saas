import { Router } from "express";
import { prisma } from "../../../db/db";
import jwt from "jsonwebtoken";
import { TOTAL_LAMPORTS_AMOUNT, WORKER_JWT_SECRET } from "../../../config/config";

import { getTask } from "../../../task";
import { submissionInput } from "../../../types/types";
import { workermiddleWare } from "../../../middleware/workerMiddleware";



export const workerRouter = Router();

const SUBMISSION = 100;


workerRouter.post("/signin", async(req, res)=>{
    
    try {
         const pubKey = "nknka";

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


workerRouter.get("/task", workermiddleWare , async(req,res) => {

    //@ts-ignore
    const user_Id: string = req.userId;

    const allTask = await getTask(Number(user_Id));

    if(!allTask) {
        res.status(411).json({
            message: "There are no more task left"
        })
        return;

    } else {

        res.status(200).json({
            allTask
        })

        return;
    }
})


workerRouter.post("/submission", workermiddleWare, async(req, res) => {

    const body = req.body;
    //@ts-ignore
    const userId = req.userId;

    const parseData = submissionInput.safeParse(body);

    
    try {
            if(parseData.success) {

                const task = await getTask(Number(userId));

                if(!task || task?.id !== Number(parseData.data.taskId)) {
                        res.status(411).json({
                            message: "Incorrect Task Id"
                        })
                        return;
                }

                const amount =  (Number(task.amount) / SUBMISSION).toString();

              

                const submission = await prisma.$transaction(async (tx) => {

                    const submission = await tx.submission.create({
                        data: {
                            optionId: Number(parseData.data.selectId),
                            taskId: Number(parseData.data.taskId),
                            workerId: userId ,
                            amount
                        }

                    })

                   await tx.worker.update({
                       where: {
                            id: userId
                       },
                       data: {
                            pendingAmount: {
                                increment: Number(amount) * TOTAL_LAMPORTS_AMOUNT
                            }
                       }
                    })

                    return submission;
                })

                

                const nextTask = await getTask(userId);

                res.status(200).json({
                    message: "successfully created",
                    nextTask,
                    amount
                })


                
            }

    } catch(e) {
        res.status(500).json({
            error: "server error"
        })
    }
    
})

workerRouter.get("/balance", workermiddleWare, async(req, res) => {

    //@ts-ignore
    const userId = req.userId;


    const balance = await prisma.worker.findFirst({
        where: {
            id: Number(userId),
        }
    })

    res.json({
        pendingAmount: balance?.pendingAmount,
        lockedAmount: balance?.lockedAmount
    })
})


