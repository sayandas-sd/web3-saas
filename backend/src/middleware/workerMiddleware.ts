import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { WORKER_JWT_SECRET } from "../config/config";



export function workermiddleWare(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;


    if(!authHeader) {
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }


    try{
        const decoded = jwt.verify(authHeader, WORKER_JWT_SECRET)  as { userId: number };
      

        //@ts-ignore
        if(decoded.userId) { 
        //@ts-ignore
            req.userId = decoded.userId;
            return next();
            
        } else {
            res.status(403).json({
            message: "You are not logged in"
            })
            return;
        }
    }catch(e) {
        res.status(403).json({
            message: "You are not logged in"
        })
        return;
    }
}