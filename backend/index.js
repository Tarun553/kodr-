import express from "express";
import { connectToDB } from "./db/db.js";
import User from "./models/user.model.js";
import dotenv from "dotenv";
import ImageKit from "imagekit";
import upload from "./config/multer.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import cors from "cors";


dotenv.config();
const app = express();

const imagekit = new ImageKit({
  publicKey:
    process.env.IMAGEKIT_PUBLIC_KEY || "public_9UGATATd8gZpx6HXBt6UwozTUenew=",
  privateKey:
    process.env.IMAGEKIT_PRIVATE_KEY || "private_KRbNQ9MVLBEgr/lB1AxjLaGJYiw=",
  urlEndpoint:
    process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/nsltal2oci",
});

connectToDB();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
}));
// health check
app.get("/health", (req, res) => {
  res.send("OK");
});

app.post("/api/users", upload.single("image"), async (req, res) => {
  try {
    const { postMessage } = req.body;

    if (!postMessage || !req.file) {
      return res
        .status(400)
        .json({ error: "Missing required fields or no image provided" });
    }

    const image = req.file.buffer.toString("base64");
    const id = uuidv4();

    let file;
    try {
      file = await imagekit.upload({
        file: image,
        fileName: `${id}-${req.file.originalname}`,
        folder: "post",
      });
    } catch (err) {
      console.error("ImageKit upload failed:", err);
      return res.status(500).json({ error: "Image upload failed" });
    }

    const newUser = await User.create({
      postMessage,
      image: file.url,
      id,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/api/users/:id", async (req, res) => {
  try {
    const { postMessage } = req.body;
    const { id } = req.params;

    if (!postMessage) {
      return res.status(400).json({ error: "postMessage is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { postMessage },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





app.post("/api/users/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const userIp = req.ip; // get user IP
    console.log("User IP:", userIp);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const likedUser = await User.findById(id);

    if (!likedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ safe check
    if (likedUser.likedBy && likedUser.likedBy.includes(userIp)) {
      return res.status(400).json({ error: "You already liked this user" });
    }

    likedUser.likes += 1;
    likedUser.likedBy.push(userIp); // store IP
    await likedUser.save();

    res.json(likedUser);
  } catch (error) {
    console.error("Error liking user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/users/:id/comment", async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, user } = req.body; // user is optional (could be username/ip)

    if (!comment) {
      return res.status(400).json({ error: "Comment is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const commentedUser = await User.findById(id);

    if (!commentedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // add comment to array
    commentedUser.comments.push({
      text: comment,
      user: user || req.ip, // fallback to ip if no user provided
    });

    await commentedUser.save();

    res.json(commentedUser);
  } catch (error) {
    console.error("Error commenting on user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
