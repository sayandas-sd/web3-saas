import express from "express";
import { router } from "./routes/v1";

const app = express();

const port = 3000;

app.use(express.json())


app.get("/", (req,res)=>{
    res.status(200).json({
        msg: "server is working"
    })
})

app.use("/api/v1", router)

app.listen(port, ()=>{
    console.log(`server is running in port : ${port}`)
})

