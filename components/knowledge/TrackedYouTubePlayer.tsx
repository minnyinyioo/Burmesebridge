"use client";
import Script from "next/script";
import { useCallback,useEffect,useRef,useState } from "react";
import { supabase } from "@/lib/supabase";
type Player={destroy():void;getCurrentTime():number;seekTo(seconds:number,allow:boolean):void};
type YTWindow=Window&{YT?:{Player:new(element:HTMLElement,config:Record<string,unknown>)=>Player}};
export default function TrackedYouTubePlayer({youtubeId,title,lessonId,userId,initialPosition=0}:{youtubeId:string;title:string;lessonId:number|null;userId:string|null;initialPosition?:number}){
 const host=useRef<HTMLDivElement>(null);const player=useRef<Player|null>(null);const timer=useRef<ReturnType<typeof setInterval>|null>(null);const[ready,setReady]=useState(false);
 const save=useCallback(async(delta:number)=>{if(!player.current||!lessonId||!userId)return;await supabase.rpc("save_lesson_watch_progress",{p_lesson_id:lessonId,p_position_seconds:Math.max(0,Math.floor(player.current.getCurrentTime()||0)),p_watch_delta:delta})},[lessonId,userId]);
 useEffect(()=>{const api=(window as YTWindow).YT;if(!ready||!host.current||!api)return;player.current?.destroy();player.current=new api.Player(host.current,{videoId:youtubeId,playerVars:{rel:0,playsinline:1},events:{onReady:()=>{if(initialPosition>5)player.current?.seekTo(initialPosition,true)},onStateChange:(event:{data:number})=>{if(event.data===1&&!timer.current)timer.current=setInterval(()=>void save(15),15000);if(event.data!==1&&timer.current){clearInterval(timer.current);timer.current=null;void save(0)}}}});return()=>{if(timer.current){clearInterval(timer.current);timer.current=null}void save(0);player.current?.destroy();player.current=null}},[initialPosition,ready,save,youtubeId]);
 return <><Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" onLoad={()=>setReady(true)} onReady={()=>setReady(true)}/><div ref={host} title={title} aria-label={title}/></>;
}
