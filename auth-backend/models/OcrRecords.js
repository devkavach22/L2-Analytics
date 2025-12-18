import mongoose from "mongoose";

const OcrRecordSchema = new mongoose.Schema({
  fileId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "File", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  folderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Folder",
    required: true 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  extractedText: { 
    type: String, 
    default: "" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const OcrRecord = mongoose.model("OcrRecord", OcrRecordSchema);

export default OcrRecord;