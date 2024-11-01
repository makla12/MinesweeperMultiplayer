import { useSignal } from "@preact/signals-react";
import { useState, useEffect } from "react";

export function GameNav(props){
    const mines = useSignal(0);
    const [time, setTime] = useState(0);
    const [stopTime, setStopTime] = useState(false);
    const startTime = () => {
        setTime(0);
        setStopTime(false);
    }

    const formatTime = (x) => {
        let sec = x % 60;
        let min = Math.floor((x / 60) % 60);
        let h = Math.floor(x / 3600);
        return `${h != 0 ? h + "h" : ""} ${min != 0 ? min + "m" : ""} ${sec}s`;
    }

    useEffect(()=>{
        const handleEndGame = ()=>{
            setStopTime(true);
        }
        props.socket.on("startGame",startTime);
        props.socket.on("endGame",handleEndGame);

        return () => {
            props.socket.off("startGame",startTime);
            props.socket.off("endGame",handleEndGame);
        }
    },[])

    useEffect(()=>{
        const handleChangeMines = (flags)=>{
            let flagChange = 0;
            for(let i = 0; i < flags.length; i++){
                if(props.board[flags[i][0]][flags[i][1]].value.cleared){
                    continue;
                }
                if(props.board[flags[i][0]][flags[i][1]].value.flaged){
                    flagChange--;
                }
                else{
                    flagChange++;
                }
            }
            mines.value -= flagChange;
        }
        props.socket.on("flag", handleChangeMines)

        return ()=>{
            props.socket.off("flag", handleChangeMines)
        }
    },[props.board])

    useEffect(()=>{
        if(!stopTime){
            setTimeout(()=>{
                setTime(time+1);
            },1000);
        }
    },[time])

    useEffect(()=>{
        mines.value = props.minesStart;
    },[props.minesStart, props.gameReset])

    return(
        <div className="fixed top-0 left-0 w-screen h-20 bg-black text-white flex justify-evenly items-center text-xl z-20 select-none">
            <div></div>
            <div>{mines}</div>
            <div>{formatTime(time)}</div>
        </div>
    )
}