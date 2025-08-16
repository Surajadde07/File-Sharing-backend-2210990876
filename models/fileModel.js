const mongoose = require("mongoose");

const { Schema } = mongoose;

const fileSchema = new Schema({
    filename: { type: String, required: true },
    filePath: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    uploadTime: { type: Date, default: Date.now },
    expiryTime: { type: Date, required: true },
    senderEmail: { type: String },
    receiverEmail: { type: String },
    downloadCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model("File", fileSchema);