import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

export const generateToken = (id: Types.ObjectId): string => {
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRE as SignOptions['expiresIn'] || '7d',
  };
  return jwt.sign({ id }, process.env.JWT_SECRET!, options);
};

export const verifyToken = (token: string): { id: string } => {
  return jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
};