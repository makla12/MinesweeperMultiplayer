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
        minesCount:100,
        digCount:20 * 20 - 100,
        maxPlayers:5,
        players:1,
        gameStarted:false,
        board:[]
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

const cellsAround = (board,x,y) => {
    const rows = board.length;
    const colums = board[0].length
    let cellsAr = [];
    if(x != 0){
        cellsAr.push(board[x-1][y]);
        if(y != 0) cellsAr.push(board[x-1][y-1]);
        if(y != colums - 1) cellsAr.push(board[x-1][y+1]);
    }
    if(x != rows - 1){
        cellsAr.push(board[x+1][y]);
        if(y != 0) cellsAr.push(board[x+1][y-1]);
        if(y != colums - 1) cellsAr.push(board[x+1][y+1]);
    }
    if(y != 0) cellsAr.push(board[x][y-1]);
    if(y != colums - 1) cellsAr.push(board[x][y+1]);
    return cellsAr;
}

const cacculateMinesAround = (board,x,y) => {
    let sum = 0;
    for(let i of cellsAround(board,x,y)){
        if(i.minesAround == -1) sum++;
    }
    return sum;
}

const generateBoard = (rows,cols,mines) => {
    let minesPos = new Set();
    let random;
    for(let i = 0;i < mines;){
        random = Math.floor(Math.random() * rows * cols);
        if(!minesPos.has(random)){
            minesPos.add(random);
            i++;
        }
    }
    let board = [];
    for(let i = 0;i < rows;i++){
        board.push([]);
        for(let j = 0;j < cols; j++){
            board[i].push({ cleared:false, flaged:false,minesAround:(minesPos.has(cols * i + j) ? -1 : 0) });
        }
    }

    for(let i = 0;i < rows;i++){
        for(let j = 0;j < cols; j++){
            if(board[i][j].minesAround != -1){
                board[i][j].minesAround = cacculateMinesAround(board, i, j);
            }
        }
    }
    return board;
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
            if(!games[index].gameStarted) games[index].players--;
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
            players:1,
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
        if(games[index].players == games[index].maxPlayers) return 0;
        games[index].players++;
        io.to(roomId).emit("playerJoined");
        socket.join(roomId);
        socket.emit("gameJoined", roomId, games[index].players);
    });

    socket.on("startGame",(roomId)=>{
        let board = [];
        io.to(roomId).emit("startGame", board);
    });
});
