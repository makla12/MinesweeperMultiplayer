import { useState, useEffect } from "react";
import Image from "next/image";
import flagImg from "@/public/flag.png"
import { GameNav } from "./gameNav";

export function Game(props){    
    const [board, setBoard] = useState([]);
    const [change, setChange] = useState(false);
    const [mines, setMines] = useState(0);
    useEffect(()=>{
        setMines(props.mines);
    },[props.mines])

    const dig = (x, y, value) => {
        if(board[x][y].flaged || board[x][y].cleared){
            return 0;
        }
        let newBoard = Array.from(board);
        newBoard[x][y].minesAround = value;
        newBoard[x][y].cleared = true;
        setBoard(newBoard);
        setChange(!change); 
    }

    const flag = (flags) => {
        console.log(flags);
        let newBoard = Array.from(board);
        let flagChange = 0;
        for(let i = 0; i < flags.length; i++){
            if(board[flags[i][0]][flags[i][1]].cleared){
                continue;
            }
            if(newBoard[flags[i][0]][flags[i][1]].flaged){
                flagChange--;
            }
            else{
                flagChange++;
            }
            newBoard[flags[i][0]][flags[i][1]].flaged = !newBoard[flags[i][0]][flags[i][1]].flaged;
        }
        setMines(mines - flagChange);
        setBoard(newBoard);
        setChange(!change); 
    }
    
    useEffect(()=>{
        let newBoard = [];
        for(let i = 0;i < props.rows;i++){
            newBoard.push([]);
            for(let j = 0;j < props.cols; j++){
                newBoard[i].push({cleared:false, flaged:false,minesAround:0})
            }
        }
        setBoard(newBoard);
        setChange(!change);
    },[props.cols,props.rows]);
        
    useEffect(()=>{
        props.socket.on("dig",dig);
        props.socket.on("flag",flag);

        return ()=>{
            props.socket.off("dig",dig);
            props.socket.off("flag",flag);
        }
    },[change])
    
    return(
        <>
        <GameNav mines={mines} socket={props.socket} />
        <div className="min-w-screen min-h-screen w-fit h-fit flex justify-center items-center p-24 mx-auto">
            <div className="flex flex-col">
                {board.map((value1,index1)=>(
                    <div key={index1} className="flex">
                        {value1.map((value2,index2)=>(
                            <div key={`${index1} ${index2}`} onClick={()=>{ props.socket.emit("dig", props.roomId, index1, index2) }} 
                                onContextMenu={(e)=>{e.preventDefault(); props.socket.emit("flag", props.roomId, index1, index2) }}
                                className="w-10 h-10 border-[#3a4650] border-[1px] flex items-center justify-center select-none hover:cursor-default"
                            >
                                <div className={
                                    `flex items-center justify-center z-10 
                                    transition-transform bg-blue-500 w-full h-full 
                                    ${(!value2.cleared && !value2.flaged) ? "hover:bg-blue-900" : ""} 
                                    ${value2.cleared ? "duration-700 scale-0" : (value2.flaged ? "duration-150 scale-[0.8] bg-gray-500" : "scale-100")}`}
                                >
                                    {value2.flaged ? 
                                        <div className="w-[80%] h-[80%]">
                                            <Image src={flagImg} alt="Flag" draggable={false} />
                                        </div> 
                                    : ""}
                                </div>
                                <div className="absolute z-0 text-2xl">{value2.minesAround == 0 ? "" : value2.minesAround}</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div> 
        </>
    )
}