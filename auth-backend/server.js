import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import pdfRoutes from "./routes/pdfRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js"; // Import password routes
import { runIndexingPipeline } from "./search/indexingPipeline.js";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();

const reportsDir = path.join(process.cwd(), 'generated_reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
    console.log("Created directory: generated_reports");
}

const MONGO_URL = process.env.MONGO_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

const allowedOrigins = [
    "http://localhost:5174", // For
    //  local development
    "http://localhost:5173",
    "http://localhost:3000", // Alternate local port
    "https://kavachservices.com", // 👈 ADD YOUR LIVE DOMAIN
    "https://www.kavachservices.com",
    "http://localhost:8080",              
    "https://kavach-pdf-tools.onrender.com",   // Local fronten          // Production frontend (domain)
];

app.use(cors({
    origin: allowedOrigins, 
    credentials: true   
}));    

// app.options("*")
app.use(express.json());
app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use("/workspace",express.static(path.join(process.cwd(), "uploads", "workspace")));

app.use("/api/auth",authRoutes);
app.use("/api/pdf",pdfRoutes);
app.use("/api/search",searchRoutes);
app.use("/api",passwordRoutes);

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(async () => {

    await runIndexingPipeline();
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`Server running on ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("MongoDB connection error:", error);
});


// mongoose.connect(process.env.MONGO_URL)
//   .then(async () => {
//     console.log("MongoDB Connected");

    
//     await runIndexingPipeline();

//     app.listen(process.env.PORT, "0.0.0.0", () =>
//       console.log(`Server running at ${process.env.PORT}`)
//     );
//   })
//   .catch(err => console.log("MongoDB Error:", err));