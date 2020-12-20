import nodemailer from 'nodemailer';

import { host, port, user, pass}  from '../config/mail.json';

 const transport = nodemailer.createTransport({
    host,
    port,
    auth: {
        user,
        pass
    }
});

export default transport;