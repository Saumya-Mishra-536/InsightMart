import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth users
  googleId: { type: String, sparse: true }, // Google OAuth ID
  role: {
    type: String,
    enum: ["seller", "customer"],
    default: "customer",
  },
});

// Ensure unique email index is applied
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
