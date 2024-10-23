import { useState, useEffect } from "react";

export function GameNav(props){
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
        if(!stopTime){
            setTimeout(()=>{
                setTime(time+1);
            },1000);
        }
    },[time])

    return(
        <div className="fixed top-0 left-0 w-screen h-20 bg-black flex justify-evenly items-center text-xl z-20 select-none">
            <div></div>
            <div>{props.mines}</div>
            <div>{formatTime(time)}</div>
        </div>
    )
}