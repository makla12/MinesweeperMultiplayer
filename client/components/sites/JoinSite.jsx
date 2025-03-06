"use client";
import { useState, useEffect} from "react";
import JoinGame from "@/components/JoinGame";
import WaitingRoom from "@/components/WaitingRoom";
import Game from "@/components/Game";

export default function JoinSite(props) {
    const [gameStart, setGameStart] = useState(0);
    const [roomId, setRoomId] = useState(0);
    const [playerCount, setPlayerCount] = useState(1);
    const [gameReset, setGameReset] = useState(false);
    const [rows, setRows] = useState(20);
    const [cols, setCols] = useState(20);
    const [mines, setMines] = useState(100);
    
    const socket = props.socket;
    socket.on("gameJoined",(roomId, playerCount, cols, rows, mines)=>{
        setGameStart(1);
        setCols(cols);
        setRows(rows);
        setMines(mines);
        setRoomId(roomId);
        setPlayerCount(playerCount);
    });

    socket.on("playerJoined",()=>{
        setPlayerCount(playerCount+1);
    });

    socket.on("playerDisconnected",()=>{
        setPlayerCount(playerCount-1);
    });
    
    socket.on("startGame",()=>{
        setGameStart(2);
        setGameReset(!gameReset);
    });

    socket.on("hostLeft",()=>{
        setGameStart(0);
    });

    return (
    <>
        {gameStart == 0 ? 
        <JoinGame socket={props.socket} />
        : 
        (gameStart == 1 ? 
        <WaitingRoom  socket={props.socket} roomId={roomId} playerCount={playerCount} host={false} />
        : 
        <Game socket={props.socket} gameReset={gameReset} roomId={roomId} rows={rows} cols={cols} mines={mines} />) }
    </>
    );
}
