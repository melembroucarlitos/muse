/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import redis from 'redis';
import { createConnection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import authRoutes from './routes/authenticate';

// TODO: console.log redis connections, Get test:server working, Checkout concurrently, do away with redundant redis clients --script to make sure the database is running, --script to make translate manual tests into spec skeletons, --reinforce validation on the database level, --get debugging figured out, --script that automatically replaces secrets in .env file
(async () => {
  dotenv.config();

  await createConnection();

  const redisClient = redis.createClient();
  const RedisStore = connectRedis(session);

  redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
  });

  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: process.env.ORIGIN!,
      optionsSuccessStatus: 200,
    })
  );

  app.use(
    session({
      genid: () => {
        return uuidv4();
      },
      store: new RedisStore({
        host: 'localhost',
        port: 6379,
        client: redisClient,
      }),
      name: '_museDemo',
      secret: process.env.SESSION_SECRET!,
      resave: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60000,
      },
      saveUninitialized: true,
    })
  );

  app.use('/api/auth', authRoutes);

  const { PORT } = process.env;
  app.listen(PORT, async () => {
    console.log(`server started on port: ${PORT}`);
  });
})();
