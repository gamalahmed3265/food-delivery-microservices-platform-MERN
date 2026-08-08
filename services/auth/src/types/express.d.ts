declare global {
  namespace Express {
    interface Request {
      user?: import("../model/User").IUser; // or any User type
    }
  }
}