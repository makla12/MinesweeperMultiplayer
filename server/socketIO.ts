import { Cell, Board, Game, CorsOptions } from './types';
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

class SocketIOServer {
    private generateRoomId() : number {
        let random;
        let randomFound = true;
        while(randomFound){
            randomFound = false;
            random = Math.floor(Math.random() * 9999);
            for(let i = 0;i < this.games.length;i++){
                if(this.games[i].room == random.toString()){
                    randomFound = true;
                    break;
                }
            }
        }
        return random ? random : 0;
    }

    private getIndexFromRoom(roomId:string) : number {
        let index = -1;
        for(let i = 0;i < this.games.length;i++){
            if(this.games[i].room == roomId){
                index = i;
                break;
            }
        }
        return index;
    }

    private cellsAround(board:Board, x:number, y:number) : number[][] {
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

    private calculateMinesAround(board:Board, x:number, y:number) : number {
        let sum = 0;
        for(let value of this.cellsAround(board,x,y)){
            if(board[value[0]][value[1]].minesAround == -1) sum++;
        }
        return sum;
    }

    private generateBoard(rows:number, cols:number, mines:number, x:number, y:number) : Board {
        let minesPos:Set<number> = new Set();
        let random:number;
        for(let _ = 0;_ < mines;){
            random = Math.floor(Math.random() * rows * cols);

            if(random == cols * x + y || random == cols * (x + 1) + y || random == cols * (x - 1) + y || random == cols * x + y + 1 || random == cols * (x + 1) + y + 1 || random == cols * (x - 1) + y + 1 || random == cols * x + y - 1 || random == cols * (x + 1) + y - 1 || random == cols * (x - 1) + y - 1)
                continue;

            if(!minesPos.has(random)){
                minesPos.add(random);
                _++;
            }
        }
        let board:Board = [];
        for(let i = 0;i < rows;i++){
            board.push([]);
            for(let j = 0;j < cols; j++){
                board[i].push({ cleared:false, flaged:false,minesAround:(minesPos.has(cols * i + j) ? -1 : 0) });
            }
        }

        for(let i = 0;i < rows;i++){
            for(let j = 0;j < cols; j++){
                if(board[i][j].minesAround != -1){
                    board[i][j].minesAround = this.calculateMinesAround(board, i, j);
                }
            }
        }
        return board;
    }

    private startGame(gameIndex:number) : void {
        const rows = this.games[gameIndex].rows;
        const cols = this.games[gameIndex].cols;
        const mines = this.games[gameIndex].mines;
        this.games[gameIndex].board = [];
        this.games[gameIndex].digCounter = rows * cols - mines;
        this.games[gameIndex].gameEnd = false;
        this.socketIOServer.to(this.games[gameIndex].room).emit("startGame");
    }

    private flagsAround(board:Board, x:number, y:number) : number {
        const flags = this.cellsAround(board, x, y).filter(value => board[value[0]][value[1]].flaged);
        return flags.length;
    }

    private unClearedCellsAround(board:Board, x:number, y:number) : number {
        const cells = this.cellsAround(board, x, y).filter(value => !board[value[0]][value[1]].cleared);
        return cells.length;
    }

    private cellsToClear(gameIndex:number, x:number, y:number) : number[][] {
        let cells:number[][] = [];
        const board = this.games[gameIndex].board;
        const value = this.games[gameIndex].board[x][y].minesAround;
        if(board[x][y].cleared || board[x][y].flaged){
            return [];
        }
        this.games[gameIndex].board[x][y].cleared = true;
        this.games[gameIndex].digCounter -= 1;
        if(value == -1){
            this.games[gameIndex].gameEnd = true;
            this.socketIOServer.to(this.games[gameIndex].room).emit("endGame",false);
            return [];
        }
        cells.push([x, y, value]);
        if(value == 0){
            for(let i of this.cellsAround(board,x, y)){
                cells = cells.concat(this.cellsToClear(gameIndex, i[0], i[1]));
            }
        }
        return cells;        
    }

    private dig(gameIndex:number, x:number, y:number) : void {
        if(this.games[gameIndex].board.length == 0){
            const rows = this.games[gameIndex].rows;
            const cols = this.games[gameIndex].cols;
            const mines = this.games[gameIndex].mines;
            this.games[gameIndex].board = this.generateBoard(rows, cols, mines, x, y);
        }

        if(this.games[gameIndex].gameEnd || this.games[gameIndex].board[x][y].flaged) return;
        const room = this.games[gameIndex].room;
        if(this.games[gameIndex].board[x][y].cleared){
            if(this.flagsAround(this.games[gameIndex].board, x, y) == this.games[gameIndex].board[x][y].minesAround){
                let cells:number[][] = [];
                for(let i of this.cellsAround(this.games[gameIndex].board,x, y)){
                    cells = cells.concat(this.cellsToClear(gameIndex, i[0], i[1]));
                }
                if(cells.length > 0){
                    this.socketIOServer.to(room).emit("dig", cells);
                    if(this.games[gameIndex].digCounter == 0){
                        this.games[gameIndex].gameEnd = true;
                        this.socketIOServer.to(room).emit("endGame", true);
                    }
                }
            }

            if(this.unClearedCellsAround(this.games[gameIndex].board, x, y) == this.games[gameIndex].board[x][y].minesAround){
                let flags = [];
                for(let i of this.cellsAround(this.games[gameIndex].board,x, y)){
                    if(this.games[gameIndex].board[i[0]][i[1]].cleared){
                        continue;
                    }
                    if(this.games[gameIndex].board[i[0]][i[1]].flaged){
                        continue;
                    }
                    this.games[gameIndex].board[i[0]][i[1]].flaged = !this.games[gameIndex].board[i[0]][i[1]].flaged;
                    flags.push([i[0], i[1]]);
                }
                this.socketIOServer.to(room).emit("flag", flags);
            }
            return;
        }
        
        let cells = this.cellsToClear(gameIndex, x, y);
        this.socketIOServer.to(room).emit("dig", cells);
        if(this.games[gameIndex].digCounter == 0){
            this.socketIOServer.to(room).emit("endGame", true);
        }
    }

    private flag(gameIndex:number, x:number, y:number, manual:boolean) : void {
        const room = this.games[gameIndex].room;
        if(this.games[gameIndex].board[x][y].cleared){
            return;
        }
        if(!manual && this.games[gameIndex].board[x][y].flaged){
            return;
        }
        this.games[gameIndex].board[x][y].flaged = !this.games[gameIndex].board[x][y].flaged;
        this.socketIOServer.to(room).emit("flag", [[x, y]]);
        return;
    }

    private games:Game[] = [];
    public socketIOServer:Server;

    constructor(httpServer:HttpServer, corsOptions:CorsOptions) {
        this.socketIOServer = new Server(httpServer, {cors:corsOptions});

        this.socketIOServer.on("connect", (socket) => {
            socket.data.host = false;

            socket.on("disconnecting",() => {
                if(socket.rooms.size == 1){
                    return;
                }
                if(socket.data.host){
                    const roomId = Array.from(socket.rooms)[1];
                    const index = this.getIndexFromRoom(roomId);
                    if(index == -1) return;
                    this.socketIOServer.to(roomId).emit("hostLeft");
                    this.socketIOServer.in(roomId).socketsLeave(roomId);
                    this.games.splice(index,1);
                }
                else{
                    const roomId = Array.from(socket.rooms)[1];
                    const index = this.getIndexFromRoom(roomId);
                    if(index == -1) return;
                    if(!this.games[index].gameStarted) this.games[index].players--;
                    this.socketIOServer.to(roomId).emit("playerDisconnected");
                }
            });

            socket.on("create",(cols:number, rows:number, mines:number) => {
                if(cols * rows < mines) return;
                let roomId = this.generateRoomId().toString();
                this.games.push({
                    room:roomId,
                    rows:rows,
                    cols:cols,
                    mines:mines,
                    maxPlayers:5,
                    players:1,
                    gameStarted:false,
                    board:[],
                    digCounter:0,
                    gameEnd:false,
                });
                socket.data.host = true;
                socket.join(roomId);
                socket.emit("gameCreated", roomId, cols, rows, mines);
            });

            socket.on("join",(roomId:string) => {
                const index = this.getIndexFromRoom(roomId);
                if(index == -1) return;
                if(this.games[index].players == this.games[index].maxPlayers) return;
                this.games[index].players++;
                this.socketIOServer.to(roomId).emit("playerJoined");
                socket.join(roomId);
                socket.emit("gameJoined", roomId, this.games[index].players, this.games[index].cols, this.games[index].rows, this.games[index].mines);
            });

            socket.on("startGame",(roomId) => {
                const gameIndex = this.getIndexFromRoom(roomId);
                this.startGame(gameIndex);
            });

            socket.on("dig", (roomId, x, y) => {
                const gameIndex = this.getIndexFromRoom(roomId);
                this.dig(gameIndex, x, y);
            });

            socket.on("flag", (roomId, x, y) => {
                const gameIndex = this.getIndexFromRoom(roomId);
                this.flag(gameIndex, x, y, true);
            });
        });
    }
}

export default SocketIOServer;