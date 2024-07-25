import { Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  messages: Types.ObjectId[];
  created_at: Date;
  updated_at: Date;
}