import { server, ws } from './app';
import mongoose from 'mongoose';
import winston from 'winston';
import dotenv from 'dotenv';
import { startWebsocketsPrices } from './services/websocket';

dotenv.config({ path: './config.env' });
const LOGGER = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' }),
  ],
});

if (!process.env.DATABASE_URI) {
  LOGGER.warn('No DATABASE_URI env variable');
  process.exit();
}

const PORT = process.env.PORT || 3000;
const DB = process.env.DATABASE_URI!;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successfull');
    startWebsocketsPrices(ws);
  });

server.listen(PORT, () => {
  console.info(`Listening on port ${PORT}...`);
});
