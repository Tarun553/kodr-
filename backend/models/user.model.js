import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    postMessage: { type: String, required: true },
    image: { type: String, required: true },
    id: { type: String },
    likes: { type: Number, default: 0 },
    // store the ip address of the user who liked the post
    likedBy: { type: [String], default: [] }, 
    comments: [
      {
        text: { type: String, required: true },  // actual comment
        createdAt: { type: Date, default: Date.now }, // timestamp
        user: { type: String }, // optional: username/ip/email/etc
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
