import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../model/User";
import logger from "../utils/logger";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL as string;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  logger.error("Google OAuth environment variables are not set");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || email?.split("@")[0] || "Google User";
        const image = profile.photos?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(null, false, { message: "Google account has no email" });
        }

        let user = await User.findOne({ email });

        if (user) {
          if (!user.googleId) {
            user.googleId = googleId;
            await user.save();
          }
          return done(null, user);
        }

        // Generate dummy password for Google users
        const dummyPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(dummyPassword, 10);

        user = await User.create({
          name,
          email,
          password: hashedPassword,
          image,
          googleId,
          isVerified: true,
          role: "user",
        });

        return done(null, user);
      } catch (error) {
        logger.error("Google auth strategy error", { error });
        return done(error as Error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});