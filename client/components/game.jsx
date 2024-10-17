import { useState, useEffect } from "react";
import Image from "next/image";
import flagImg from "@/public/flag.png"

export function Game(props){    
    const [board, setBoard] = useState([]);
    const [change, setChange] = useState(false);

    const dig = (x, y, value) => {
        console.log(value);
        if(board[x][y].flaged || board[x][y].cleared){
            return 0;
        }
        let newBoard = Array.from(board);
        newBoard[x][y].minesAround = value;
        newBoard[x][y].cleared = true;
        setBoard(newBoard);
        setChange(!change); 
    }

    const flag = (x,y) => {
        if(board[x][y].cleared){
            return 0;
        }
        let newBoard = Array.from(board);
        newBoard[x][y].flaged = !newBoard[x][y].flaged;
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
        console.log(props.rows,props.cols);
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
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col">
                {board.map((value1,index1)=>(
                    <div key={index1} className="flex">
                        {value1.map((value2,index2)=>(
                            <div key={`${index1} ${index2}`} onClick={()=>{ props.socket.emit("dig", props.roomId, index1, index2) }} 
                                onContextMenu={(e)=>{e.preventDefault(); props.socket.emit("flag", props.roomId, index1, index2) }}
                                className="w-10 h-10 border-[#3a4650] border-[1px] flex items-center justify-center hover:cursor-default"
                            >
                                <div className={
                                    `flex items-center justify-center z-10 
                                    transition-transform bg-blue-500 w-full h-full 
                                    ${(!value2.cleared && !value2.flaged) ? "hover:bg-blue-900" : ""} 
                                    ${value2.cleared ? "duration-700 scale-0" : (value2.flaged ? "duration-150 scale-[0.8] bg-gray-500" : "scale-100")}`}
                                >
                                    {value2.flaged ? 
                                        <div className="w-[80%] h-[80%]">
                                            <Image src={flagImg} alt="Flag"/>
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