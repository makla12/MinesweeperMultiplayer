"use client";
import { Manager } from "socket.io-client";
import { useState, useEffect} from "react";
import JoinSite from "@/components/joinSite";

export default function Home() {
	const [socket,setSocket] = useState(undefined);

	useEffect(()=>{
		const manager = new Manager("127.0.0.1:8080");
		setSocket(manager.socket("/"));
	},[]);

  	return (
    	<>
      		{socket != undefined ? <JoinSite socket={socket} /> :<div className="w-screen h-screen flex items-center justify-center">Loading...</div>}
    	</>
  	);
}
