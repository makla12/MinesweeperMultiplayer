export default function WaitingRoom(props){
    const socket = props.socket;

    return(
        <div className="min-w-fit w-screen h-screen flex flex-col justify-center items-center gap-32">
            <div className="text-4xl">Number of players: {props.playerCount}</div>
            <div className="flex justify-center items-center gap-5">
                <div className="text-4xl">Room id: {props.roomId}</div>
                <button onClick={() =>{navigator.clipboard.writeText(props.roomId)} } className="
                    bg-blue-700 text-white 
                    transition-colors duration-300
                    rounded-lg p-2 text-xl hover:bg-blue-900"
                >Copy</button>
            </div>

            {props.host ? 
            <button onClick={()=>{socket.emit("startGame",props.roomId)}} className="
                w-96 h-24 
                bg-blue-700 rounded-2xl 
                flex justify-center items-center 
                text-2xl transition-all duration-500 
                hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]"
            >Start game</button>
            :  
            <div className="text-xl">Waiting for host to start game</div>}

        </div>
    );
}