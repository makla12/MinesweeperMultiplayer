export default function EndScrean({win, handleGameReset}){
    
    return(
        <div className="w-screen h-screen fixed top-0 left-0 flex justify-center items-center backdrop-blur-sm z-30">
            <div className="p-10 bg-black rounded-xl flex flex-col justify-evenly items-center gap-10">
                <div className="text-3xl font-bold">{win ? "YOU WIN" : "YOU LOSE"}</div>
                <div className="flex gap-10">
                    <a href="/" className="p-5
						bg-blue-700 rounded-2xl 
						flex justify-center items-center 
						text-2xl transition-all duration-500 
						hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]"
                    >
                        Main menu
                    </a>

                    <div onClick={handleGameReset} className="p-5
						bg-blue-700 rounded-2xl 
						flex justify-center items-center 
						text-2xl transition-all duration-500 
						hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]"
                    >
                        Play again
                    </div>
                </div>
            </div>
        </div>
    )    
}