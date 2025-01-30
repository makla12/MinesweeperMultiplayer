type Cell = {
    cleared:boolean,
    flaged:boolean,
    minesAround:number,
}

type Board = Cell[][]

type Game = {
    room:string,
    rows:number,
    cols:number,
    mines:number,
    maxPlayers:number,
    players:number,
    gameStarted:boolean,
    board:Board,
    digCounter:number,
    gameEnd:boolean,
}

type CorsOptions = {
    origin:string,
    methods:string[],
}

export { Cell, Board, Game, CorsOptions }