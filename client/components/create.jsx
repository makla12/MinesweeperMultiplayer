import { useState, useEffect} from "react";
export function Create(props){
    const socket = props.socket;
    const [dif, setDif] = useState(1);

    const handleClick = (dif) => {
        let cols, rows, mines;
        switch(dif){
            case 0:
                cols = 20;
                rows = 20;
                mines = 25;
                break;

            case 1:
                cols = 20;
                rows = 20;
                mines = 50;
                break;

            case 2:
                cols = 20;
                rows = 20;
                mines = 100;
                break;

            case 3:
                cols = Number(document.getElementById("cols").value);
                rows = Number(document.getElementById("rows").value);
                mines = Number(document.getElementById("mines").value);
                break;
        }
        socket.emit("create",cols,rows,mines);
    }


    return(
        <>
            <div className="w-screen h-screen flex flex-col justify-center items-center gap-10">
                <div className="text-5xl">Select dificulty</div>
                <div className="flex gap-10">
                    {
                    [
                        {dif:0,name:"Easy",onclik:"setEasy"},
                        {dif:1,name:"Normal",onclik:"setNormal"},
                        {dif:2,name:"Hard",onclik:"setHard"},
                        {dif:3,name:"Custom",onclik:"showCustom"}
                    ].map((value,index)=>(
                        <button key={index} onClick={()=>{setDif(value.dif)}} className={
                            `w-64 h-20
                            transition-all duration-200 
                            border-gray-500 border-2 rounded-2xl 
                            flex justify-center items-center text-4xl 
                            hover:cursor-pointer ${dif == value.dif ? "scale-[1.15] bg-blue-700" : ""}`}
                        >{value.name}</button>
                    ))
                    }
                </div>
                {(dif == 3) ? (
                    <div className="flex flex-col gap-5">
                        <div>
                            <div className="text-3xl text-center">Colums:</div>
                            <input id="cols" min="1" type="number" className="text-black p-2 rounded-lg shadow-blue-500 active:shadow-lg" />
                        </div>
                        <div>
                            <div className="text-3xl text-center">Rows:</div>
                            <input id="rows" min="1" type="number" className="text-black p-2 rounded-lg shadow-blue-500 active:shadow-lg" />
                        </div>
                        <div>
                            <div className="text-3xl text-center">Mines:</div>
                            <input id="mines" min="1" type="number" className="text-black p-2 rounded-lg shadow-blue-500 active:shadow-lg" />
                        </div>    
                    </div>
                ) : ""}
                <button onClick={()=>{handleClick(dif)}} className="
                    mt-20
                    w-96 h-24 
                    bg-blue-700 rounded-2xl 
                    flex justify-center items-center 
                    text-2xl transition-all duration-500 
                    hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]"
				> Create game</button>
            </div>
        </>
    );
}