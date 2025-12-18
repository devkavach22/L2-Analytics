import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";
import { authorize } from "../middlewares/roles.js";
import Folder from "../models/Folder.js";
import File from "../models/File.js";
import upload from "../middlewares/upload.js";
import fs from "fs";
import path from "path";
import { sendToOCR } from "../services/ocrService.js";
import OcrRecord from "../models/OcrRecords.js";

const router = express.Router();
const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || "./uploads";

console.log("LOCAL_STORAGE_PATH:", LOCAL_STORAGE_PATH);

router.post("/register", register);
router.post("/login", login);

router.get("/admin", auth, authorize("admin"), (req, res) => {
    res.json({ message: "Admin Access Granted!" });
});

router.get("/user", auth, authorize("admin", "user"), (req, res) => {
    res.json({ message: "User Access Granted!" });
});

router.post("/logout", logout);

/* -----------------------------------------------------------
   CREATE FOLDER
----------------------------------------------------------- */
router.post("/folder/create", auth, async (req, res) => {
    try {
        const { name, createdAt, updatedAt, desc } = req.body;

        const folder = await Folder.create({
            userId: req.user.id,
            name,
            desc: desc || "",
            createdAt: createdAt || new Date(),
            updatedAt: updatedAt || new Date(),
        });

        res.json({ message: "Folder Created", folder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* -----------------------------------------------------------
   GET USER FOLDERS
----------------------------------------------------------- */
router.get("/folders", auth, async (req, res) => {
    try {
        const folders = await Folder.find({ userId: req.user.id });
        res.json({ folders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* -----------------------------------------------------------
   UPLOAD FILE TO SPECIFIC FOLDER
----------------------------------------------------------- */
router.post("/upload/:folderId", auth, upload.array("files"), async (req, res) => {
    try {
        const folderId = req.params.folderId;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        // User's file storage path
        const userFolderPath = path.join(
            LOCAL_STORAGE_PATH,
            req.user.id.toString(),
            folderId.toString()
        );

        if (!fs.existsSync(userFolderPath)) {
            fs.mkdirSync(userFolderPath, { recursive: true });
        }

        const uploadedFiles = [];
        const ocrRecords = [];

        for (const file of req.files) {
            const finalPath = path.join(userFolderPath, file.filename);

            // Move file from temp upload to final user folder
            fs.renameSync(file.path, finalPath);

            uploadedFiles.push({
                folderId,
                userId: req.user.id,
                originalName: file.originalname,
                storedName: file.filename,
                size: file.size,
                extension: file.originalname.split(".").pop(),
                mimeType: file.mimetype,
                localPath: finalPath,
                publicPath: `/workspace/${req.user.id}/${folderId}/${file.filename}`,
                uploadDate: new Date(),
            });
        }

        const savedFiles = await File.insertMany(uploadedFiles);

        savedFiles.forEach((savedFile) => {
            sendToOCR(savedFile.localPath)
                .then(async (ocrText) => {
                    await OcrRecord.create({
                        fileId: savedFile._id,
                        userId: savedFile.userId,
                        folderId: savedFile.folderId,
                        fileName: savedFile.originalName,
                        extractedText: ocrText,
                    });
                    console.log(`OCR saved for file: ${savedFile.originalName}`);
                })
                .catch((err) => {
                    console.error(`OCR failed for file ${savedFile.originalName}:`, err);
                });
        });

        res.status(200).json({
            message: "Files uploaded successfully",
            files: savedFiles,
        });

    } catch (error) {
        console.error("UPLOAD ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});
/* -----------------------------------------------------------
   1. GET ALL FILES (Generic Route FIRST)
----------------------------------------------------------- */
router.get("/files",auth,async(req,res) => {
    try 
    {
        const files = await File.find({ userId: req.user.id}).sort({ uploadDate: -1});
        res.json({ files});
    }
    catch (error)
    {
        res.status(500).json({ error: error.message});
    }
});

/* -----------------------------------------------------------
   GET FILES FROM A FOLDER
----------------------------------------------------------- */
router.get("/files/:folderId", auth, async (req, res) => {
    try {
        const files = await File.find({
            folderId: req.params.folderId,
            userId: req.user.id,
        });

        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
