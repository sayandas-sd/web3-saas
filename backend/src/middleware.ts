import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, WORKER_JWT_SECRET } from "./config";

export function authmiddleWare(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, JWT_SECRET)  as { userId: number };
      

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

export function workerAuthmiddleWare(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            message: "Unauthorized"
        })
        return;
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, WORKER_JWT_SECRET)  as { userId: number };
      

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