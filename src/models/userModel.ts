import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/user";

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    messages: [{
      type: mongoose.Types.ObjectId,
      // ref: 'Message'  // Assuming you have a Message model
    }],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;