import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db/db";
import { CLOUDFLARE_BUCKET,CLOUDFLARE_ENDPOINT, JWT_SECRET, S3_ACCESS_KEY, S3_SECRET_KEY, TOTAL_LAMPORTS_AMOUNT } from "../../../config/config";

import { taskInput } from "../../../types/types";
import { authmiddleWare } from "../../../middleware/authMiddleware";
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const authRouter = Router();

const DEFAULT_TITLE = "Choose the most voted one";

const s3Client = new S3Client({
  region: 'auto',
  endpoint: CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

authRouter.get("/presignedurl", async (req,res) => {

    try {

        const key = `keys/${crypto.randomUUID()}/image.png`;

        const command = new PutObjectCommand({
        Bucket: CLOUDFLARE_BUCKET, 
        Key: key,
        ContentType: 'image/png', 
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        console.log({ url })

        res.json({
            preSignedUrl: url,
            key
        })
    

    } catch(e) {
        res.status(500).json({
            error: "'Failed to generate presigned URL'"
        })
    }

})

authRouter.post("/signin", async (req, res) =>{

    try{
        const pubAddress = "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzc";

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
            
            return;
            
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
            
            return;
        
        }

}catch(e) {
        res.status(500).json({
            error: "Something went wrong"
        })
    }

})


authRouter.get("/task", authmiddleWare, async (req,res) => {
    //@ts-ignore
    const task_Id = req.query.taskId;
    //@ts-ignore
    const user_Id = req.userId;


    if (!task_Id) {
        res.status(400).json({ message: "Missing taskId in query" });
        return;
    }


    console.log({
        userId: user_Id,
        taskId: task_Id
    })

    const allTask = await prisma.task.findFirst({
        where: {
            userId: Number(user_Id),
            id: Number(task_Id)
        },
        include: {
            options: true,
        }
    })

    if(!allTask) {
        res.status(411).json({
            message: "you don't have access"
        })
       return;
    }

    const response = await prisma.submission.findMany({
        where: {
            taskId: Number(task_Id)
        },
        include: {
            option: true
        }
    }) 

 

    const values: Record<string, {
        count: number,
        option: {
            imageUrl:  string
        }
    }> = {};

    allTask.options.forEach(option => {
        values[option.id] = {
            count: 0,
            option: {
                imageUrl: option.image_url
            }
        }
    })

    
    response.forEach(r => {
            values[r.optionId].count++;
        
    })

    res.json({
        values
    })
})


authRouter.post("/task", authmiddleWare, async (req, res) =>{

    //@ts-ignore
    const userId = req.userId;

    const body = req.body;

    const parseData = taskInput.safeParse(body);

    if(!parseData.success) {
        res.status(411).json({
            message: "you've sent the wrong inputs"
        })
        return;
    }

    let response = await prisma.$transaction(async (tx) => {

        const response = await tx.task.create({
            data: {
                title:  parseData.data.title ?? DEFAULT_TITLE,
                signature: parseData.data.signature,
                amount: 1 * TOTAL_LAMPORTS_AMOUNT,
                userId: userId
            }
        })

        await tx.option.createMany({
            data: parseData.data.options.map(x => ({
                image_url: x.image_url,
                taskId: response.id
            }))
        })  

        return response;

    })

    res.status(200).json({
        id: response.id
    })
    
})


