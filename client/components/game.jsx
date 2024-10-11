import { useState, useEffect } from "react";

export function Game(props){
    let [cols,setCols] = useState(20);
    let rows = 20;
    const [board, setBoard] = useState([]);
    
    useEffect(()=>{
        let newBoard = [];
        for(let i = 0;i < rows;i++){
            newBoard.push([]);
            for(let j = 0;j < rows; j++){
                newBoard[i].push({cleared:false,minesAround:0})
            }
        }
        setBoard(newBoard);
    },[cols,rows]);

    const clear = (x,y) => {
        let newBoard = Array.from(board);
        newBoard[x][y].cleared = true;
        setBoard(newBoard);
    }
    return(
        <>
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="flex flex-col">
                {board.map((value1,index1)=>(
                    <div key={index1} className="flex">
                        {value1.map((value2,index2)=>(
                            <div key={`${index1} ${index2}`} onClick={()=>{clear(index1,index2)}} className="w-10 h-10 border-[#3a4650] border-[1px] flex items-center justify-center hover:cursor-default">
                                <div className={`z-10 transition-transform duration-700 bg-blue-500 w-full h-full ${(!value2.cleared) ? "hover:bg-blue-900 scale-100" : "scale-0"}`}></div>
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