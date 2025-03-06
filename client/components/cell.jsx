import { useSignals } from "@preact/signals-react/runtime";
import Image from "next/image";
import flagImg from "@/public/flag.png"

export default function Cell({handleDig, handleFlag, sig}){
    useSignals();
    return(
        <div onClick={ handleDig } 
            onContextMenu={ handleFlag }
            className="w-10 h-10 border-[#3a4650] border-[1px] flex items-center justify-center select-none hover:cursor-default"
        >
            <div className={
                `flex items-center justify-center z-10 
                transition-transform bg-blue-500 w-full h-full 
                ${(!sig.value.cleared && !sig.value.flaged) ? "hover:bg-blue-900" : ""} 
                ${sig.value.cleared ? "duration-700 scale-0" : (sig.value.flaged ? "duration-150 scale-[0.8] bg-gray-500" : "scale-100")}`}
            >
                {sig.value.flaged ? 
                    <div className="w-[80%] h-[80%]">
                        <Image src={flagImg} alt="Flag" draggable={false} />
                    </div> 
                : ""}
            </div>
            <div className="absolute z-0 text-2xl">{sig.value.minesAround == 0 ? "" : sig.value.minesAround}</div>
        </div>
    )
}