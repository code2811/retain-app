import { Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserInput {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';
      createdAt: Date;
    };
    token: string;
  };
  message?: string;
}