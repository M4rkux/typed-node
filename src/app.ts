import express from 'express';
import bodyParser from 'body-parser';
import authController from './controllers/auth.controller';
import projectController from './controllers/project.controller';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/', (req, res) => {
  res.send('The sedulous hyena ate the antelope!');
});

authController(app);
projectController(app);

app.listen(port, () => {
  return console.log(`server is listening on ${port}`);
});