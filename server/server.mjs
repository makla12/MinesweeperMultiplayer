import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';

const app = express();

const httpServer = createServer(app);
httpServer.listen(8080);

const io = new Server(httpServer,{
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

let games = [
    {
        room:444,
        rows:20,
        cols:20,
        mines:100,
        maxPlayers:5,
        players:[],
        gameStarted:false,
        board:[[]]
    },
];

const generateRoomId = () => {
    let random;
    let randomFound = true;
    while(randomFound){
        randomFound = false;
        random = Math.floor(Math.random() * 9999);
        for(let i = 0;i < games.length;i++){
            if(games[i].room == random){
                randomFound = true;
                break;
            }
        }
    }
    return random;
}
const getIndexFromRoom = (roomId) => {
    let index = -1;
    for(let i = 0;i < games.length;i++){
        if(games[i].room == roomId){
            index = i;
            break;
        }
    }
    return index;
}

io.on("connect", (socket) => {
    socket.data.host = false;
    console.log("connected");

    socket.on("disconnecting",()=>{
        console.log("dc");
        if(socket.rooms.size == 1){
            return 0;
        }
        if(socket.data.host){
            const roomId = Array.from(socket.rooms)[1];
            const index = getIndexFromRoom(roomId);
            if(index == -1) return 0;
            games.splice(index,1);
        }
        else{
            const roomId = Array.from(socket.rooms)[1];
            const index = getIndexFromRoom(roomId);
            if(index == -1) return 0;
            if(!games[index].gameStarted) games[index].players.splice(games[index].players.indexOf(socket.id),1);
            io.to(roomId).emit("playerDisconnected");
        }
    });

    socket.on("create",(cols,rows,mines)=>{
        let roomId = generateRoomId();
        games.push({
            room:roomId,
            rows:rows,
            cols:cols,
            mines:mines,
            maxPlayers:5,
            players:[socket.id],
            gameStarted:false,
            board:[[]]
        });
        socket.data.host = true;
        socket.join(roomId);
        socket.emit("gameCreated",roomId);
    });

    socket.on("join",(roomId) => {
        const index = getIndexFromRoom(roomId);
        if(index == -1) return 0;
        if(games[index].players.length == games[index].maxPlayers) return 0;
        games[index].players.push(socket.id);
        io.to(roomId).emit("playerJoined");
        socket.join(roomId);
        socket.emit("gameJoined", roomId, games[index].players.length);
    });

    socket.on("startGame",(roomId)=>{
        let board = [];
        io.to(roomId).emit("startGame", board);
    });
});
