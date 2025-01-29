import { createServer } from 'http';
import SocketIOServer from './socketIO.mjs';

const httpServer = createServer();
httpServer.listen(8080);

const corsOptions = {origin:"*", methods: ["GET", "POST"]}

const socketIOServer = new SocketIOServer(httpServer, corsOptions);
