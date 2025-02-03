import { createServer, Server } from 'http';
import SocketIOServer from './socketIO';
import { CorsOptions } from './types';

const httpServer:Server = createServer();
httpServer.listen(8080);

const corsOptions:CorsOptions = {
    origin:"*", 
    methods: ["GET", "POST"]
}

const socketIOServer = new SocketIOServer(httpServer, corsOptions);
