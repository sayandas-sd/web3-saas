import {Router} from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../../db";
import { JWT_SECRET } from "../../../config";
import { authmiddleWare } from "../../../middleware";

export const authRouter = Router();


authRouter.post("/presignedUrl", authmiddleWare, (req, res) => {
   res.json({
    msg: "succesffuly generate"
   })
   return;
})


authRouter.post("/signin", async (req, res) =>{

    try{

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

