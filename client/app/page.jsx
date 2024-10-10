import Image from "next/image";

export default function Home() {
  	return (
    	<>
      		<div className="flex flex-col w-screen h-screen justify-center items-center gap-64">
				<div className="w-1/2 h-36 bg-blue-700 rounded-2xl flex justify-center items-center text-4xl font-bold">Mineseweeper multiplayer</div>

				<div className="flex flex-col gap-32">
					<div className="w-96 h-24 bg-blue-700 rounded-2xl flex justify-center items-center text-2xl transition-all duration-500 hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]">Create game</div>
					<div className="w-96 h-24 bg-blue-700 rounded-2xl flex justify-center items-center text-2xl transition-all duration-500 hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]">Join game</div>
				</div>

			</div>
    	</>
  	);
}
