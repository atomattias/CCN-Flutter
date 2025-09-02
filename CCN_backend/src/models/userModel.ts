import mongoose, { Date, Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export enum ROLE {
  ADMIN = "ADMIN",
  CLINICIAN = "CLINICIAN",
  SUPERUSER = "SUPERUSER",
}

export enum STATUS {
  VERIFIED = "VERIFIED",
  SUSPENDED = "SUSPENDED",
  UNVERIFIED = "UNVERIFIED",
}

export interface User {
  fullname: string;
  email: string;
  address: string;
  country: string;
  phone: string;
  status: STATUS;
  role: ROLE;
  profilePicture: string;
  password: string;
  pin: string;
  passwordResetToken: string | undefined;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface VerifyEmail {
  email: string;
  otpCode: string;
  isVerified: boolean;
}

export interface UserDocument extends Document, User {}

export interface VerifyEmailDocument extends Document, VerifyEmail {}

const userSchema = new Schema<UserDocument>(
  {
    fullname: {
      type: String,
      required: [true, "Provide fullname"],
      trim: true,
    },
    email: { type: String, required: [true, "Provide an email"], trim: true },
    password: {
      type: String,
      required: [true, "Provide a password"],
      trim: true,
      min: [8, "password should be at least 8 characters long"],
    },
    pin: {
      type: String,
      trim: true,
      min: [4, "password should be 4 characters long"],
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.CLINICIAN,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.SUSPENDED,
      trim: true,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    passwordResetToken: {
      type: String,
      expires: 3600,
    },
    address: String,
    country: String,
    phone: String,
  },
  {
    collection: "users",
    timestamps: true,
  }
);

const verifyEmailSchema = new Schema<VerifyEmailDocument>(
  {
    email: {
      type: String,
      required: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

verifyEmailSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isNew && !this.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
  } catch (err) {
    return false;
  }
};

export const User = mongoose.model<UserDocument>("User", userSchema);

export const verifyEmailModel = mongoose.model<VerifyEmailDocument>(
  "VerifyEmail",
  verifyEmailSchema
);
