import { Document } from 'mongoose';
import mongoose from '../database';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    passwordResetToken: string;
    passwordResetExpires: Date;
}

export interface IUserView extends Document {
    name: string,
    email: string,
    createdAt: Date,
}

export const UserView = {
    render(user: IUser){
      return {
            id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
      };
    }
  }

const UserSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

UserSchema.pre<IUser>('save', async function(next) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next(null);
});

export const User = mongoose.model<IUser>('User', UserSchema);