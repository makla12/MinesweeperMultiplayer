import { useState, useEffect, useRef } from "react";
import { useSignal } from "@preact/signals-react";

export default function GameNav({socket, minesStart, gameReset, board}){
    const mines = useSignal(0);
    const time = useRef(0);
    const stopTime = useRef(false);
    const [timeState, setTimeState] = useState(0);

    const formatTime = (x) => {
        let sec = x % 60;
        let min = Math.floor((x / 60) % 60);
        let h = Math.floor(x / 3600);
        return `${h != 0 ? h + "h" : ""} ${min != 0 ? min + "m" : ""} ${sec}s`;
    }

    useEffect(()=>{
        const handleEndGame = ()=>{
            stopTime.current = true;
        }
        socket.on("endGame",handleEndGame);

        return () => {
            socket.off("endGame",handleEndGame);
        }
    },[])

    useEffect(()=>{
        const handleChangeMines = (flags)=>{
            let flagChange = 0;
            for(let i = 0; i < flags.length; i++){
                if(board[flags[i][0]][flags[i][1]].value.cleared){
                    continue;
                }
                if(board[flags[i][0]][flags[i][1]].value.flaged){
                    flagChange--;
                }
                else{
                    flagChange++;
                }
            }
            mines.value -= flagChange;
        }
        socket.on("flag", handleChangeMines)

        return ()=>{
            socket.off("flag", handleChangeMines)
        }
    },[board])

    useEffect(()=>{
        const inter = setInterval(()=>{
            if(stopTime.current) return;

            time.current++;
            setTimeState(time.current);
        },1000);

        return () => {
            clearInterval(inter);
        }
    },[]);

    useEffect(()=>{
        mines.value = minesStart;
        time.current = 0;
        stopTime.current = false;
    },[minesStart, gameReset]);

    return(
        <div className="fixed top-0 left-0 w-screen h-20 bg-black text-white flex justify-evenly items-center text-xl z-20 select-none">
            <div></div>
            <div>{mines}</div>
            <div>{formatTime(timeState)}</div>
        </div>
    )
}