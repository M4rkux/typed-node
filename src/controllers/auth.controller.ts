import { Router, Application, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import authConfig from '../config/auth.json';
import { IUser, User, UserView } from '../models/User';
import mailer from '../modules/mailer';

const router = Router();

function generateToken(params: IUser) {
    return jwt.sign({ id: params._id }, authConfig.secret, {
        expiresIn: 86400
    });
}

router.post('/register', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email }))
            return res.status(400).send({ error: 'User already exists'});

        const user = await User.create<IUser>(req.body);

        return res.send({
            user: UserView.render(user),
            token: generateToken(user)
        });
    } catch (err) {
        return res.status(400).send({ error: 'Registration failed' })
    }
});

router.post('/authenticate', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Login failed' });

    res.send({
        user: UserView.render(user),
        token: generateToken(user)
    });
});

router.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            to: email,
            from: 'm4rkux@gmail.com',
            html: `<p>Você pediu para alterar a senha. Utilize esse token <strong>${token}</strong></p>`
        }, (err) => {
            if (err)
                return res.status(400).send({ error: 'Cannot send forgot password email' });

            res.send('Email sent');
        })

    } catch (err) {
        console.error(err);
        res.status(400).send({ error: 'Error on forgot password'});
    }
});

router.post('/reset-password', async (req: Request, res: Response) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if (!user)
            return res.status(400).send({ error: 'User not found' });

        if (token !== user.passwordResetToken)
            return res.status(300).send({ error: 'Token invalid' });

        const now = new Date();

        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expired, generate a new one' });

        user.password = password;

        await user.save();

        res.send('Password changed');

    } catch (err) {
        console.error(err);
        res.status(400).send({ error: 'Error on reset password' });
    }
});

const userController = (app: Application) => app.use('/auth', router);
export default userController;