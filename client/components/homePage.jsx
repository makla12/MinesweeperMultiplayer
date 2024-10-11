export function HomePage(){
	return(
		<div className="flex flex-col w-screen h-screen justify-center items-center gap-48">
			<div className="flex justify-center items-center text-8xl font-bold">Mineseweeper</div>

			<div className="flex flex-col gap-32">
				{[
					{name:"Create game", url:"/create"},
					{name:"Join game", url:"/join"}
				].map((value, index)=>(
					<a key={index} href={value.url} className="
						w-96 h-24 
						bg-blue-700 rounded-2xl 
						flex justify-center items-center 
						text-2xl transition-all duration-500 
						hover:cursor-pointer hover:bg-blue-900 hover:scale-[1.15]"
					> {value.name}</a>
				))
				}
			</div>
		</div>
	);
}