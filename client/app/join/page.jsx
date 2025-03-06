"use client";
import { Manager } from "socket.io-client";
import { useState, useEffect} from "react";
import JoinSite from "@/components/sites/JoinSite";

export default function Page() {
	const [socket, 	setSocket] = useState(undefined);

	useEffect(()=>{
		const manager = new Manager(window.location.hostname + ":8080");
		setSocket(manager.socket("/"));
	},[]);

	return (
	<>
		{socket != undefined ? <JoinSite socket={socket} /> :<div className="w-screen h-screen flex items-center justify-center">Loading...</div>}
	</>
	);
}
