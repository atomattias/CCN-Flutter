// User Types
export enum UserRole {
  ADMIN = "ADMIN",
  CLINICIAN = "CLINICIAN",
  SUPERUSER = "SUPERUSER",
}

export enum UserStatus {
  VERIFIED = "VERIFIED",
  SUSPENDED = "SUSPENDED",
  UNVERIFIED = "UNVERIFIED",
}

export interface User {
  _id: string;
  fullname: string;
  email: string;
  address?: string;
  country?: string;
  phone?: string;
  status: UserStatus;
  role: UserRole;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

// Channel Types
export interface Channel {
  _id: string;
  owner: string | User;
  name: string;
  description?: string;
  tag: string;
  specialty: boolean;
  users: (string | User)[];
  createdAt: string;
  updatedAt: string;
}

// Message Types
export interface Message {
  _id: string;
  user: string | User;
  content: string;
  parentMessage?: string | Message;
  recipient?: string | User;
  fromChannel?: string | Channel;
  channelID?: string | Channel;
  forwarded?: boolean;
  read?: boolean;
  readReceipt?: Array<{
    user: string | User;
    timestamp: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Subscription Types
export interface Subscription {
  _id: string;
  user: string | User;
  channel: string | Channel;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  Channels: undefined;
  Chat: { channelId: string; channelName: string };
  Profile: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Channels: undefined;
  Chat: undefined;
  Profile: undefined;
};

