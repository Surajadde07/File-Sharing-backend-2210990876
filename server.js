const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

app.get("/", (req, res) => {
    res.send("File Sharing App Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
