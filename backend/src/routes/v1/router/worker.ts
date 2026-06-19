import { Router } from "express";
import { prisma } from "../../../db/db";
import jwt from "jsonwebtoken";
import { PRIVATE_KEY, WORKER_JWT_SECRET } from "../../../config/config";

import { getTask } from "../../../task";
import { submissionInput } from "../../../types/types";
import { workermiddleWare } from "../../../middleware/workerMiddleware";
import nacl from "tweetnacl";

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import bs58 from "bs58";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

export const workerRouter = Router();

const SUBMISSION = 100;


workerRouter.post("/signin", async(req, res)=>{
    
    try {

        
        const { publicKey, signature } = req.body;
        const message = new TextEncoder().encode("wants you to sign in with your Solana account as a worker")

        const signatureBytes =
            Array.isArray(signature) ? new Uint8Array(signature) :
            signature?.data && Array.isArray(signature.data) ? new Uint8Array(signature.data) :
            signature?.buffer instanceof ArrayBuffer ? new Uint8Array(signature.buffer) :
            undefined;

        if (!signatureBytes) {
            res.status(400).json({ message: "Invalid signature format" });
            return;
        }

        const result =  nacl.sign.detached.verify(
            message,
            signatureBytes,
            new PublicKey(publicKey).toBytes()
        );

        if(!result) {
            res.status(411).json({
                message: "Incorrect signature"
            })
            return;
        }
        

        const existingUser = await prisma.worker.findFirst({
            where: {
                address: publicKey
            }
        })

        if(existingUser) {
            const token = jwt.sign({
                userId: existingUser.id
            }, WORKER_JWT_SECRET);

            res.status(200).json({
                token,
                amount: existingUser.pendingAmount / LAMPORTS_PER_SOL
            })
            return;

        } else {
            const user = await prisma.worker.create({
                data: {
                    address: publicKey,
                    pendingAmount: 0,
                    lockedAmount: 0
                }
            })

            const token = jwt.sign({
                userId: user.id
            }, WORKER_JWT_SECRET)

            res.status(200).json({
                token,
                amount: 0
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

              

                await prisma.$transaction(async (tx) => {

                    const submission = await tx.submission.create({
                        data: {
                            optionId: Number(parseData.data.selectId),
                            taskId: Number(parseData.data.taskId),
                            workerId: userId ,
                            amount: Number(amount)
                        }

                    })

                   await tx.worker.update({
                       where: {
                            id: userId
                       },
                       data: {
                            pendingAmount: {
                                increment: Number(amount)
                            }
                       }
                    })

                    return submission;
                })

                

                const nextTask = await getTask(Number(userId));

                res.status(200).json({
                    message: "successfully created",
                    nextTask: nextTask || null,
                    amount
                })


                
            } else {
                res.status(411).json({
                    message: "incorrect inputs"
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

    res.status(200).json({
        pendingAmount: balance?.pendingAmount,
        lockedAmount: balance?.lockedAmount
    })
})

workerRouter.post("/withdraw", workermiddleWare, async (req, res) => {

        //@ts-ignore
        const userId = req.userId;

    try{

         const workerPay = await prisma.worker.findFirst({
            where: {
                id: Number(userId)
            }
        })

        if(!workerPay) {
            res.status(403).json({
                message: "user not found"
            })
            return;
        }


        if (workerPay.pendingAmount <= 0) {
            res.status(400).json({ 
                message: "No pending payment available" 
            });
            return;
        }


        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey("HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzcZ"),
                toPubkey: new PublicKey(workerPay.address),
                lamports: LAMPORTS_PER_SOL * workerPay.pendingAmount / LAMPORTS_PER_SOL,
            })
        );

        const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
        
        const signature = "";

            try {

                await sendAndConfirmTransaction(
                    connection,
                    transaction,
                    [keypair] 
                );

            } catch(e) {
                res.status(500).json({
                    message: "Transaction failed"
                })
                return;
            }
            

            await prisma.$transaction(async (tx) => {

                await tx.worker.update({
                    where: {
                        id: Number(userId)
                    },
                    data: {
                        pendingAmount: {
                            decrement: workerPay.pendingAmount
                        }, 
                        lockedAmount: {
                            increment: workerPay.pendingAmount
                        }
                    }
                })


                await tx.pay.create({
                    data: {
                        workerId: workerPay.id,
                        signature,
                        status: "Processing",
                        amount: workerPay.pendingAmount
                    }
                })

            });

            res.status(200).json({
                message: "Successful",
                amount: workerPay.pendingAmount / LAMPORTS_PER_SOL,
                signature
            })


    } catch(e) {
        res.status(500).json({
            message: "Server Error"
        })
    }

})
