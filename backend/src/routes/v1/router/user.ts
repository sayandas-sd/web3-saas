import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db/db";
import { CLOUDFLARE_BUCKET,CLOUDFLARE_ENDPOINT, JWT_SECRET, RPC_URL, S3_ACCESS_KEY, S3_SECRET_KEY } from "../../../config/config";

import { taskInput } from "../../../types/types";
import { authmiddleWare } from "../../../middleware/authMiddleware";
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import nacl from "tweetnacl";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemInstruction, SystemProgram } from "@solana/web3.js";

export const authRouter = Router();

const DEFAULT_TITLE = "Choose the most voted one";

const WALLET_ADDRESS = "HtkgKvwwJdEwq3EpwwCtVcHqvZed1Davc1wCB4JQkzcZ";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const TRANSFER_AMOUNT = 0.1 * LAMPORTS_PER_SOL;


const s3Client = new S3Client({
  region: 'auto',
  endpoint: CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

prisma.$transaction(
    async (prisma) => {
      // Code running in a transaction...
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    }
)

authRouter.get("/presignedurl", authmiddleWare, async (req,res) => {

    try {

        const key = `keys/${crypto.randomUUID()}/image.png`;

        const command = new PutObjectCommand({
        Bucket: CLOUDFLARE_BUCKET, 
        Key: key,
        ContentType: 'image/png', 
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

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
        const { publicKey, signature } = req.body;
        const message = new TextEncoder().encode("wants you to sign in with your Solana account")

        console.log("pubkey: ", publicKey);
        console.log("keypair: ", new Uint8Array(signature.data));

       
        const result = nacl.sign.detached.verify(
            message,
            new Uint8Array(signature.data),
            new PublicKey(publicKey).toBytes()
        );
        


        if (!result) {
            res.status(411).json({
                message: "Incorrect signature"
            })
            return;
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                address: publicKey
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
                    address: publicKey
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

 

    const values: Record<string, { count: number; option: { imageUrl: string } }> = {};

    allTask.options.forEach((option, index) => {
        values[`option${index + 1}`] = {
        count: 0,
        option: {
            imageUrl: option.image_url,
        },
        };
    });

    
    response.forEach((r) => {
    const optionIndex = allTask.options.findIndex((opt) => opt.id === r.optionId);
    if (optionIndex !== -1) {
      const optionKey = `option${optionIndex + 1}`;
      if (values[optionKey]) {
        values[optionKey].count++;
      }
    }
  });

    res.json({
        result: values, 
        taskDetails: { title: allTask.title }, 
    });
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

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        }
    })

    if (!user) {
        res.status(404).json({ 
            message: "User not found" 
        });
      return;
    }


    const transaction = await connection.getTransaction(parseData.data.signature, {
        maxSupportedTransactionVersion: 1
    });


    if (!transaction || !transaction.meta) {
        res.status(404).json({ 
            message: "Transaction not found" 
        });
        return;
    }


    const message = transaction.transaction.message;
    const accountKeys = message.getAccountKeys();

   
    const transferInstruction = message.compiledInstructions.find((ix) => {
        const programId = accountKeys.staticAccountKeys[ix.programIdIndex];
        return programId.toBase58() === SystemProgram.programId.toBase58();
    });

    if (!transferInstruction) {
        res.status(411).json({
            message: "No SOL transfer instruction found",
        });
        return;
    }

    // Convert Pubkey -> AccountMeta :-)

    const accountMetas = accountKeys.staticAccountKeys.map((key) => ({
        pubkey: key,
        isSigner: false,   
        isWritable: true, 
    }));

    
    const decodedTransfer = SystemInstruction.decodeTransfer({
        programId: SystemProgram.programId,
        keys: accountMetas,      
        data: Buffer.from(transferInstruction.data),
    });

    // check receiver
    if (decodedTransfer.toPubkey.toBase58() !== WALLET_ADDRESS) {
        res.status(411).json({
             message: "Transaction sent to wrong address" 
        });
        return;
    }



    if (decodedTransfer.lamports !== BigInt(TRANSFER_AMOUNT)) {
        res.status(411).json({
            message: "Transaction amount incorrect",
        });
        return;
    }


    // check sender
    if (decodedTransfer.fromPubkey.toBase58() !== user.address) {
        res.status(411).json({ 
            message: "Transaction sent from wrong address" 
        });
        return;
    }



    let response = await prisma.$transaction(async (tx) => {

        const response = await tx.task.create({
            data: {
                title:  parseData.data.title ?? DEFAULT_TITLE,
                signature: parseData.data.signature,
                amount: TRANSFER_AMOUNT,
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


