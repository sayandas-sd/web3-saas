import {Router} from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db";
import { JWT_SECRET } from "../../../config";
import { authmiddleWare } from "../../../middleware";

export const authRouter = Router();



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
