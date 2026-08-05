import { Document, Schema } from "mongoose";

export interface IUser  extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string;
//   verified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}


const User = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
//   verified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default User;