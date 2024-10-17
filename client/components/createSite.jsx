import { useState, useEffect} from "react";

import { Create } from "./create";
import { WaitingRoom } from "./waitingRoom";
import { Game } from "./game";

export default function CreateSite(props) {
	const [gameStart,setGameStart] = useState(0);
    const [roomId,setRoomId] = useState(0);
    const [playerCount,setPlayerCount] = useState(1);
    const [rows,setRows] = useState(20);
    const [cols,setCols] = useState(20);
    const [mines,setMines] = useState(100);
    const socket = props.socket;

    socket.on("gameCreated",(roomId, cols, rows, mines)=>{
        setGameStart(1);
        setCols(cols);
        setRows(rows);
        setMines(mines);
        setRoomId(roomId);
    });

    socket.on("playerJoined",()=>{
        setPlayerCount(playerCount+1);
    });

    socket.on("playerDisconnected",()=>{
        setPlayerCount(playerCount-1);
    });
    
    socket.on("startGame",(board)=>{
        setGameStart(2);
    });

  	return (
    	<>
			{gameStart == 0 ? 
            <Create socket={props.socket} /> 
            : 
            (gameStart == 1 ? 
            <WaitingRoom  socket={props.socket} roomId={roomId} playerCount={playerCount} host={true} /> 
            : 
            <Game socket={props.socket} roomId={roomId} rows={rows} cols={cols} />) }
    	</>
  	);
}
