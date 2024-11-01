import { useState, useEffect } from "react";
import { GameNav } from "./gameNav";
import { EndScrean } from "./endScrean";
import { signal } from "@preact/signals-react";
import { Cell } from "./cell";

export function Game(props){    
    const [board, setBoard] = useState([]);
    const [change, setChange] = useState(false);
    const [gameState, setGameState] = useState(0);
    const [gameWin, setGameWin] = useState(false);

    const handleGameReset = () => {
        setGameState(0);
        setGameWin(false);
        props.socket.emit("startGame",props.roomId);
    }

    const dig = (digs) => {
        for(let i = 0; i< digs.length; i++){
            if(board[digs[i][0]][digs[i][1]].value.flaged || board[digs[i][0]][digs[i][1]].value.cleared){
                return 0;
            }
            const sig = board[digs[i][0]][digs[i][1]];
            sig.value = {...sig.value, minesAround:digs[i][2]};
            sig.value = {...sig.value, cleared:true};
        }
    }

    const flag = (flags) => {
        for(let i = 0; i < flags.length; i++){
            const sig = board[flags[i][0]][flags[i][1]];
            sig.value = {...sig.value, flaged:!sig.value.flaged};
        }
    }
    
    useEffect(()=>{
        const handleGameEnd = (value) => {
            setGameState(1);
            setGameWin(value);
        }
        props.socket.on("endGame", handleGameEnd);
    },[]);

    useEffect(()=>{
        setGameState(0);
        let newBoard = [];
        for(let i = 0;i < props.rows;i++){
            newBoard.push([]);
            for(let j = 0;j < props.cols; j++){
                newBoard[i].push(signal({cleared:false, flaged:false,minesAround:0}))
            }
        }
        setBoard(newBoard);
        setChange(!change);
    },[props.cols,props.rows,props.gameReset]);

    useEffect(()=>{
        props.socket.on("dig",dig);
        props.socket.on("flag",flag);

        return () => {
            props.socket.off("dig",dig);
            props.socket.off("flag",flag);
        }
    },[change])

    return(
        <>
        
        <GameNav socket={props.socket} minesStart={props.mines} gameReset={props.gameReset} board={board} />
        <div className="min-w-screen min-h-screen w-fit h-fit flex justify-center items-center p-24 mx-auto touch-manipulation">
            <div className="flex flex-col">
                {board.map((row,index1)=>(
                    <div key={index1} className="flex">
                        {row.map((sig,index2)=>(
                            <Cell key={`${index1} ${index2}`} 
                                handleDig={()=>{ props.socket.emit("dig", props.roomId, index1, index2) }} 
                                handleFlag={(e)=>{ e.preventDefault(); props.socket.emit("flag", props.roomId, index1, index2) }} 
                                sig={sig} 
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div> 
        {gameState == 1 ? <EndScrean win={gameWin} handleGameReset={handleGameReset} /> : ""}
        </>
    )
}