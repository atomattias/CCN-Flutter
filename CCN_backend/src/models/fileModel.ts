const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  channelID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Channel",
    trim: true,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ["pdf", "doc", "docx", "voiceNote", "videoCall", "picture"],
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileData: {
    type: Buffer,
    required: true,
  },
});

export const FileModel = mongoose.model("File", FileSchema);
