import express from "express";

const app = express();

const port = 3000;

app.use(express.json())


app.get("/", (req,res)=>{
    res.status(200).json({
        msg: "hello guys"
    })
})

app.listen(port, ()=>{
    console.log(`server is running in port${port}`)
})

