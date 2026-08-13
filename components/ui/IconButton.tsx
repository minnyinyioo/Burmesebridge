import { ReactNode } from "react";

type Props={
icon:ReactNode;
label:string;
onClick?:()=>void;
active?:boolean;
danger?:boolean;
};

export default function IconButton({
icon,
label,
onClick,
active = false,
danger = false,
}:Props){

return(

<button
onClick={onClick}
className={`feed-action-button${active ? " active" : ""}${danger ? " danger" : ""}`}
aria-label={label}
title={danger ? label : undefined}
>

{icon}

<span className="feed-action-label">{label}</span>

</button>

)

}
