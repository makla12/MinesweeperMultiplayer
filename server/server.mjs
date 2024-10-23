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
        digCounter:20 * 20 - 100,
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
        cellsAr.push([x-1, y]);
        if(y != 0) cellsAr.push([x-1, y-1]);
        if(y != colums - 1) cellsAr.push([x-1, y+1]);
    }
    if(x != rows - 1){
        cellsAr.push([x+1, y]);
        if(y != 0) cellsAr.push([x+1, y-1]);
        if(y != colums - 1) cellsAr.push([x+1, y+1]);
    }
    if(y != 0) cellsAr.push([x, y-1]);
    if(y != colums - 1) cellsAr.push([x, y+1]);
    return cellsAr;
}

const cacculateMinesAround = (board,x,y) => {
    let sum = 0;
    for(let value of cellsAround(board,x,y)){
        if(board[value[0]][value[1]].minesAround == -1) sum++;
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

const startGame = (gameIndex) => {
    const rows = games[gameIndex].rows;
    const cols = games[gameIndex].cols;
    const mines = games[gameIndex].mines;
    games[gameIndex].board = generateBoard(rows, cols, mines);
    games[gameIndex].digCounter = rows * cols - mines;
    io.to(games[gameIndex].room).emit("startGame");
}

const endGame = (gameIndex, code) => {
    io.to(games[gameIndex].room).emit("endGame", code);
}

const flagsAround = (board, x, y) => {
    const flags = cellsAround(board, x, y).filter(value => board[value[0]][value[1]].flaged);
    return flags.length;
}

const unClearedClelsAround = (board, x, y) => {
    const cells = cellsAround(board, x, y).filter(value => !board[value[0]][value[1]].cleared);
    return cells.length;
}

const flagAround = (gameIndex,flags,x,y) => {

}

const dig = (gameIndex, x, y, manual) => {
    const room = games[gameIndex].room;
    const value = games[gameIndex].board[x][y].minesAround;
    if(games[gameIndex].board[x][y].cleared){
        if(!manual){
            return 2;
        }

        if(flagsAround(games[gameIndex].board, x, y) == games[gameIndex].board[x][y].minesAround){
            for(let i of cellsAround(games[gameIndex].board,x, y)){
                dig(gameIndex, i[0], i[1], false);
            }
        }

        if(unClearedClelsAround(games[gameIndex].board, x, y) == games[gameIndex].board[x][y].minesAround){
            let flags = [];
            for(let i of cellsAround(games[gameIndex].board,x, y)){
                if(games[gameIndex].board[i[0]][i[1]].cleared){
                    continue;
                }
                if(games[gameIndex].board[i[0]][i[1]].flaged){
                    continue;
                }
                games[gameIndex].board[i[0]][i[1]].flaged = !games[gameIndex].board[i[0]][i[1]].flaged;
                flags.push([i[0], i[1]]);
            }
            io.to(room).emit("flag", flags);
        }
        return 2;
    }
    if(games[gameIndex].board[x][y].flaged){
        return 2;
    }
    if(value == -1){
        return 1;
    }
    games[gameIndex].board[x][y].cleared = true;
    games[gameIndex].digCounter -= 1;
    io.to(room).emit("dig", x, y, value);
    if(value == 0){
        for(let i of cellsAround(games[gameIndex].board,x, y)){
            dig(gameIndex, i[0], i[1], false);
        }
    }
    return 0;
}

const flag = (gameIndex, x, y, manual) => {
    const room = games[gameIndex].room;
    if(games[gameIndex].board[x][y].cleared){
        return 2;
    }
    if(!manual && games[gameIndex].board[x][y].flaged){
        return 1;
    }
    games[gameIndex].board[x][y].flaged = !games[gameIndex].board[x][y].flaged;
    io.to(room).emit("flag", [[x, y]]);
    return 0;
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
            board:[],
            digCounter:0
        });
        socket.data.host = true;
        socket.join(roomId);
        socket.emit("gameCreated", roomId, cols, rows, mines);
    });

    socket.on("join",(roomId) => {
        const index = getIndexFromRoom(roomId);
        if(index == -1) return 0;
        if(games[index].players == games[index].maxPlayers) return 0;
        games[index].players++;
        io.to(roomId).emit("playerJoined");
        socket.join(roomId);
        socket.emit("gameJoined", roomId, games[index].players, games[index].cols, games[index].rows, games[index].mines);
    });

    socket.on("startGame",(roomId)=>{
        const gameIndex = getIndexFromRoom(roomId);
        startGame(gameIndex);
    });

    socket.on("dig", (roomId, x, y)=>{
        const gameIndex = getIndexFromRoom(roomId);
        dig(gameIndex, x, y, true);
    });

    socket.on("flag", (roomId, x, y)=>{
        const gameIndex = getIndexFromRoom(roomId);
        flag(gameIndex, x, y, true);
    });
});
