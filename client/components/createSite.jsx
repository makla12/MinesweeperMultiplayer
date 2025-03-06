import { useState, useEffect} from "react";

import { Create } from "./create";
import { WaitingRoom } from "./waitingRoom";
import { Game } from "./game";

export default function CreateSite(props) {
	const [gameStart,setGameStart] = useState(0);
    const [roomId,setRoomId] = useState(0);
    const [playerCount,setPlayerCount] = useState(1);
    const [gameReset, setGameReset] = useState(false);
    const [rows,setRows] = useState(0);
    const [cols,setCols] = useState(0);
    const [mines,setMines] = useState(0);
    const socket = props.socket;

    useEffect(()=>{
        socket.on("gameCreated",(roomId, cols, rows, mines)=>{
            setGameStart(1);
            setCols(cols);
            setRows(rows);
            setMines(mines);
            setRoomId(roomId);
        });

        socket.on("hostLeft",()=>{
            setGameStart(0);
        });

        return ()=>{
            socket.off("gameCreated")
            socket.off("hostLeft")
        }
    }, [])
    
    useEffect(()=>{
        socket.on("playerJoined",()=>{
            setPlayerCount(playerCount+1);
        });
    
        socket.on("playerDisconnected",()=>{
            setPlayerCount(playerCount-1);
        });

        return ()=>{
            socket.off("playerJoined")
            socket.off("playerDisconnected")
        }
    },[playerCount])
    
    useEffect(()=>{
        socket.on("startGame",()=>{
            setGameStart(2);
            setGameReset(!gameReset);
        });

        return () => {
            socket.off("startGame");
        }
    },[gameReset])
    

    

  	return (
    	<>
			{gameStart == 0 ? 
            <Create socket={props.socket} /> 
            : 
            (gameStart == 1 ? 
            <WaitingRoom  socket={props.socket} roomId={roomId} playerCount={playerCount} host={true} /> 
            : 
            <Game socket={props.socket} gameReset={gameReset} roomId={roomId} rows={rows} cols={cols} mines={mines} />) }
    	</>
  	);
}
