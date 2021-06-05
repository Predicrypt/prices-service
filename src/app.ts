import express, { Router } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { json } from 'body-parser';
import {Server} from 'socket.io';
import { createServer } from 'http';


const app = express();
const server = createServer(app);
const ws = new Server(server, {
  path: '/prices/ws/'
})



app.use(cors());
app.use(json());

if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}

export { server, ws };
