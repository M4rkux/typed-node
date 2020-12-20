import { Document } from 'mongoose';
import mongoose from '../database';
import { IUser } from './User';
import { ITask } from './Task';

export interface IProject extends Document {
    title: string,
    description: string,
    createdAt?: Date,
    user: IUser,
    tasks?: ITask[]
}

const ProjectSchema = new mongoose.Schema<IProject>({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);