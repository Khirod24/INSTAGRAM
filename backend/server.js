import express, {urlencoded} from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config({});
import { app, server } from "./socket/socket.js";
import path from "path";

const __dirname = path.resolve();

import connectDB from "./utils/db.js";


//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({extended:true}));
const corsOpt = {
    origin:process.env.URL,
    credentials:true,
}
app.use(cors(corsOpt));

//FETCH ROUTES
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"


//API REQUESTS
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/message", messageRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")))
app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
})

app.get("/",(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Welcome to social media websbite!"
    })
})
const PORT = process.env.PORT || 8080;
server.listen(PORT,()=>{
    connectDB();
    console.log(`Server started at ${PORT}`);
})