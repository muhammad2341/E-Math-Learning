export enum Role {
  ADMIN = "admin",
  SISWA = "siswa",
}

export enum AccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum EvaluationStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  SUBMITTED = "SUBMITTED",
  PENDING_REVIEW = "PENDING_REVIEW",
  REVISION_REQUIRED = "REVISION_REQUIRED",
  VERIFIED = "VERIFIED",
  RELEASED = "RELEASED",
}

export interface IUser {
  _id: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  id: string;
  username: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
