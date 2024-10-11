"use client";
import Image from "next/image";

import { Game } from "@/components/game";
import { Create } from "@/components/create";

export default function Home() {
  	return (
    	<>
			{/* <Create /> */}
			<Game />
    	</>
  	);
}
