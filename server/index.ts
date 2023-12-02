import express, { Express, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { systemEndpoints } from './endpoints/system';
import { adminEndpoints } from './endpoints/admin';
import { workspaceEndpoints } from './endpoints/workspaces';

dotenv.config();

const app: Express = express();
const apiRouter = express.Router();
const port = process.env.PORT;
const FILE_LIMIT = '3GB';


app.use(cors({ origin: true }));
app.use(bodyParser.text({ limit: FILE_LIMIT }));
app.use(bodyParser.json({ limit: FILE_LIMIT }));
app.use(
  bodyParser.urlencoded({
    limit: FILE_LIMIT,
    extended: true,
  })
);

app.use('/api', apiRouter);
systemEndpoints(apiRouter);
adminEndpoints(apiRouter);
workspaceEndpoints(apiRouter);

app.all('*', function (_, response: Response) {
  response.sendStatus(404);
});

app
  .listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });

process.on('unhandledRejection', (reason, promise) => {
  console.error(
    `🎃🎃 UnHandledRejection on ${promise} because ${reason}`,
    reason
  );
});