import { Document } from 'mongoose';
import mongoose from '../database';
import { IProject } from './Project';
import { IUser } from './User';

export interface ITask extends Document {
    title: string,
    password: string,
    completed: boolean,
    project: IProject,
    user: IUser,
    createdAt: Date,
}

const TaskSchema = new mongoose.Schema<ITask>({
    title: {
        type: String,
        require: true,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        require: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

export const Task = mongoose.model<ITask>('Task', TaskSchema);