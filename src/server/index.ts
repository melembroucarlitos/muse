/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import { createServer } from 'http';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import morgan from 'morgan';
import redis from 'redis';
import { Server, Socket } from 'socket.io';
import { createConnection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Room, RoomState } from '@src/types';
import { mod } from '../utils/misc';
import authRoutes from './routes/authenticate';

// TODO: socket typings, console.log redis connections, Get test:server working, Checkout concurrently, do away with redundant redis clients --script to make sure the database is running, --script to make translate manual tests into spec skeletons, --reinforce validation on the database level, --get debugging figured out, --script that automatically replaces secrets in .env file
(async () => {
  dotenv.config();
  const { NODE_ENV, PORT, ORIGIN, SESSION_SECRET } = process.env;

  await createConnection();

  const redisAuthClient = redis.createClient();
  const redisJamClient = new Redis();

  const RedisStore = connectRedis(session);

  redisAuthClient.on('error', (err) => {
    console.log('Redis Auth error: ', err);
  });

  redisJamClient.on('error', (err) => {
    console.log('Redis Jam error: ', err);
  });

  // TODO: Put the socket server behind authentication
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connect', (socket: Socket) => {
    console.log('we connected:');

    const liveRoomsUpdate = async () => {
      // io.sockets.adapter.rooms
      const roomKeys = await redisJamClient.keys('jam:*');
      const prep = roomKeys.map(async (roomKey) => {
        const doom = await redisJamClient.get(roomKey);
        const { playersCap, currentPlayers } = JSON.parse(doom!);
        return {
          id: roomKey.slice(4),
          playersCap,
          currentPlayers,
        };
      });
      const res: Room[] = await Promise.all(prep);
      console.log('live rooms updated', res);
      io.emit('live rooms updated', res);
    };

    socket.on('create room', async (input) => {
      console.log('creating room...', input);
      const id = uuidv4(); // I'll just trust your uniqueness
      const time = new Date();
      const jamSession: RoomState = {
        id,
        playersCap: input.playersCap,
        players: [input.username],
        currentPlayers: [input.username],
        currentTurn: input.username,
        gameStates: [Array(16).fill(Array(3).fill(false))],
        playersHistory: [{ username: input.username, type: 'create', time }],
        messages: [],
        createdBy: input.username,
        createdAt: time,
        updatedAt: time,
        closedAt: null,
      };
      const ready = JSON.stringify(jamSession);
      await redisJamClient.set(`jam:${id}`, ready); // Do we really need to await?? Also, maybe better to use RabbitMQ???

      socket.join(id);
      liveRoomsUpdate();
      socket.emit('room init', jamSession);
    });

    // TODO: Grand refactor
    socket.on('join room', async (input) => {
      // Insert check to see if id is even valid
      // Insert check to see if player isn't in the room
      const currentSessionPrep = await redisJamClient.get(`jam:${input.id}`);
      const currentSession: RoomState = JSON.parse(currentSessionPrep!);
      if (currentSession.currentPlayers.length >= currentSession.playersCap) {
        socket.emit('room is full');
      } else {
        const time = new Date();
        const updatedSession: RoomState = {
          ...currentSession,
          players: currentSession.players.includes(input.username)
            ? currentSession.players
            : currentSession.players.concat([input.username]),
          currentPlayers: currentSession.currentPlayers.concat([input.username]),
          playersHistory: currentSession.playersHistory.concat([{ username: input.username, type: 'join', time }]),
          updatedAt: time,
        };

        await redisJamClient.set(`jam:${input.id}`, JSON.stringify(updatedSession)); // Do we really need to await?? Also, maybe better to use RabbitMQ???
        socket.join(input.id);

        socket.emit('room init', updatedSession);
        io.to(input.id).emit('room players update', {
          currentPlayers: updatedSession.currentPlayers,
          playersHistory: updatedSession.playersHistory,
        });

        liveRoomsUpdate();
      }
    });

    socket.on('leave room', async (input) => {
      console.log('leave room triggered');
      // Insert check to see if id is even valid
      // Insert check to see if player is in the room
      const currentSessionPrep = await redisJamClient.get(`jam:${input.id}`);
      const currentSession: RoomState = JSON.parse(currentSessionPrep!);
      console.log('currentSession is:', currentSession);

      const time = new Date();
      const updatedSession: RoomState = {
        ...currentSession,
        currentPlayers: currentSession.currentPlayers.filter((user) => user !== input.username),
        playersHistory: currentSession.playersHistory.concat([{ username: input.username, type: 'leave', time }]),
        updatedAt: time,
      };

      await redisJamClient.set(`jam:${input.id}`, JSON.stringify(updatedSession)); // Do we really need to await?? Also, maybe better to use RabbitMQ???
      socket.leave(input.id);

      io.to(input.id).emit('room players update', {
        currentPlayers: updatedSession.currentPlayers,
        joinLeaveHistory: updatedSession.playersHistory,
      });

      console.log('updated sesssion is:', updatedSession);
      liveRoomsUpdate();
    });

    socket.on('close room', async (input) => {
      // Insert check to see if id is even valid
      // Insert check to see if player is in the room
      // Insert check to see if there is only one player in the room

      // const currentSessionPrep = await redisJamClient.get(`jam:${input.id}`);
      // const currentSession: RoomState = JSON.parse(currentSessionPrep!);

      // const time = new Date();
      // const updatedSession: RoomState = {
      //   ...currentSession,
      //   currentPlayers: currentSession.currentPlayers.filter((user) => user !== input.username),
      //   playersHistory: currentSession.playersHistory.concat([{ username: input.username, type: 'close', time }]),
      //   updatedAt: time,
      //   closedAt: time,
      // };

      socket.leave(input.id);

      await redisJamClient.del(`jam:${input.id}`); // Do we really need to await?? Also, maybe better to use RabbitMQ???

      await liveRoomsUpdate();
      // TODO: Persist our session in the database
    });

    socket.on('current rooms', () => {
      console.log('current rooms hit');
      liveRoomsUpdate();
    });

    socket.on('play turn', async (input) => {
      // Insert check to see if id is even valid
      const currentSessionPrep = await redisJamClient.get(`jam:${input.id}`);
      const currentSession: RoomState = JSON.parse(currentSessionPrep!);
      const time = new Date();

      const { currentPlayers } = currentSession;
      const updatedSession: RoomState = {
        ...currentSession,
        currentTurn: currentPlayers[mod(currentPlayers.indexOf(input.username) + 1, currentPlayers.length)], // test you out
        gameStates: currentSession.gameStates.concat([input.gameState]),
        updatedAt: time,
      };

      await redisJamClient.set(`jam:${input.id}`, JSON.stringify(updatedSession)); // Do we really need to await?? Also, maybe better to use RabbitMQ???
      io.to(input.id).emit('turn played', {
        messages: currentSession.messages.concat([input.message]),
      });
    });

    socket.on('message room', async (input) => {
      // Insert check to see if id is even valid
      console.log('received message', input);
      const currentSessionPrep = await redisJamClient.get(`jam:${input.id}`);
      const currentSession: RoomState = JSON.parse(currentSessionPrep!);
      const time = new Date();

      const updatedSession: RoomState = {
        ...currentSession,
        messages: currentSession.messages.concat([
          { message: input.message, time: input.time, username: input.username },
        ]),
        updatedAt: time,
      };

      await redisJamClient.set(`jam:${input.id}`, JSON.stringify(updatedSession)); // Do we really need to await?? Also, maybe better to use RabbitMQ???
      io.to(input.id).emit('room messaged', updatedSession.messages);
    });
    // TOPONDER: I want there to be guaranteed consistency between server and clients state. Should I just send over a message, or the entire state
  });

  // clean up your sockets upon disconnect

  httpServer.listen(8080);

  const app = express();

  app.use(express.json());
  app.use(morgan('dev'));
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: ORIGIN!,
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
        client: redisAuthClient,
      }),
      name: '_museDemo',
      secret: SESSION_SECRET!,
      resave: false,
      cookie: {
        secure: NODE_ENV === 'production',
        maxAge: 60000,
      },
      saveUninitialized: true,
    })
  );

  app.use('/api/auth', authRoutes);

  app.listen(PORT, async () => {
    console.log(`server started on port: ${PORT}`);
  });
})();
