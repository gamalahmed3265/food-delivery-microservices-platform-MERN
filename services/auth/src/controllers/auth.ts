
import { Request, Response } from "express";

export const loginUser = async (req: Request, res: Response) => {
    return res.status(200).json({ message: "Login user" });
    
}
export const registerUser = async (req: Request, res: Response) => {
    return res.status(200).json({ message: "Register user" });
}