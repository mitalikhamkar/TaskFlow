import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: string;
  bio: string;
  dob: string;
  contact: string;
  age: string;
  company: string;
  designation: string;
  address: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'Collaborator',
    },
    bio: {
      type: String,
      default: 'New TaskFlow account. Excited to collaborate and manage projects efficiently!',
    },
    dob: {
      type: String,
      default: '',
    },
    contact: {
      type: String,
      default: '',
    },
    age: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    designation: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
