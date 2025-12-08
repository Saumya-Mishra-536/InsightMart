import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import { signAccessToken } from "../utils/auth.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

export const configurePassport = () => {
    // Check if Google OAuth credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.log("⚠️  Google OAuth credentials not configured. Google sign-in will be disabled.");
        console.log("   Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file to enable.");
        return;
    }

    // Google OAuth Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
                scope: ["profile", "email"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user already exists with this Google ID
                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        // Check if user exists with this email
                        user = await User.findOne({ email: profile.emails[0].value });

                        if (user) {
                            // Link Google account to existing user
                            user.googleId = profile.id;
                            await user.save();
                        } else {
                            // Create new user (default role: customer)
                            user = await User.create({
                                googleId: profile.id,
                                name: profile.displayName,
                                email: profile.emails[0].value,
                                role: "customer", // Default role for Google OAuth users
                            });
                        }
                    }

                    // Generate JWT token
                    const token = signAccessToken({
                        id: user._id.toString(),
                        email: user.email,
                        role: user.role,
                    });

                    return done(null, { user, token });
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    console.log("✅ Google OAuth configured successfully");

    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    // Deserialize user from session
    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};

export default passport;
