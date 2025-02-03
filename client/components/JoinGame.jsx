export default function JoinGame(props){
    const socket = props.socket;
    const join = () => {
        socket.emit("join",Number(document.getElementById("roomCode").value));
    }
    return(
        <>
            <div className="min-w-fit w-screen h-screen flex flex-col justify-center items-center gap-10">
                <div className="text-5xl">Join game</div>

                <div>
                    <div className="text-3xl text-center">Code:</div>
                    <input id="roomCode" min="1" type="number" className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg shadow-blue-500 active:shadow-lg" />
                </div>
                
                <button onClick={join} className="
                    mt-20
                    w-96 h-24 
                    bg-blue-700 rounded-2xl 
                    flex justify-center items-center 
                    text-2xl transition-all duration-500 
                    hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]"
				>Join game</button>
            </div>
        </>
    );
}