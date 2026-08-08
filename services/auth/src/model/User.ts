import { Document, Schema, model } from "mongoose";

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  role: string;
    isVerified: boolean;
  googleId?: string;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ["customer", "rider","seller","admin"], default: "customer" },
     isVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

const User = model<IUser>("User", userSchema); // <-- this line is the fix
export default User;