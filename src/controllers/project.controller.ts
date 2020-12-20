import { Application, Response, Router } from 'express';
import authMiddleware from '../middlewares/auth';
import { Project } from '../models/Project';
import { Task, ITask} from '../models/Task';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: any, res: Response) => {
    try {
        const projects = await Project.find().populate(['user', 'tasks']);

        return res.send({ projects });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ error: 'Error loading projects' });
    }
});

router.get('/:projectId', async (req: any, res: Response) => {
    try {
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        if (!project)
            return res.status(400).send({ error: 'Project not found' });

        return res.send({ project });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ error: 'Error loading project' });
    }
});

router.post('/', async (req: any, res: Response) => {

    try {
        const { title, description, tasks} = req.body;
        const project = await Project.create({
            title,
            description,
            user: req.userId
        });

        await Promise.all(tasks.map(async (task: ITask) => {
            const projectTask = new Task({ ... task,
                project: project._id
            });

            await projectTask.save();

            project.tasks?.push(projectTask);
        }));

        await project.save();

        return res.send({ project });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ error: 'Error creating new project' });
    }
});

router.put('/:projectId', async (req: any, res: Response) => {
    try {
        const { title, description, tasks} = req.body;
        const project = await Project.findByIdAndUpdate(req.params.projectId, {
            title,
            description
        }, { new: true });

        if (!project)
            return res.status(400).send({ error: 'Project not found' });

        project.tasks = [];
        await Task.remove({ project: project._id });

        await Promise.all(tasks.map(async (task: ITask) => {
            const projectTask = new Task({
                ...task,
                project: project._id
            });

            await projectTask.save();

            project.tasks?.push(projectTask);
        }));

        await project.save();

        return res.send({ project });
    } catch (err) {
        console.error(err);
        return res.status(400).send({ error: 'Error creating new project' });
    }
});

router.delete('/:projectId', async (req: any, res: Response) => {
    try {
        await Project.findByIdAndRemove(req.params.projectId);

        return res.send();
    } catch (err) {
        console.error(err);
        return res.status(400).send({ error: 'Error deleting project' });
    }
});

export default (app: Application) => app.use('/projects', router);