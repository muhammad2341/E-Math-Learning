import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { Role, AccountStatus } from "../types";

export interface IUserDocument extends Document {
  name: string;
  username: string;
  nrp?: string;
  email?: string;
  password?: string;
  role: Role;
  school?: string;
  age?: number;
  classGroup?: string;
  status: AccountStatus;
  /** Guru/admin pemilik (hanya untuk akun siswa) */
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3 },
    nrp: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: Object.values(Role), default: Role.SISWA },
    school: { type: String, default: "-" },
    age: { type: Number, default: 0 },
    classGroup: { type: String, default: "Reguler" },
    status: { type: String, enum: Object.values(AccountStatus), default: AccountStatus.ACTIVE },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const r = ret as unknown as Record<string, unknown>;
    delete r.password;
    delete r.__v;
    return ret;
  },
});

export const User = mongoose.model<IUserDocument>("User", userSchema);
