"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";

/**
 * 语言菜单
 * 保持当前路径，仅替换 locale
 *
 * /my/forum
 * -> /zh/forum
 */

export default function LanguageMenu({
  locale,
}: {
  locale: string;
}) {
  const [open, setOpen] = useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const pathname =
    usePathname();

  const label = {
    my: "မြန်မာ",
    zh: "中文",
    en: "EN",
  };

  useEffect(() => {
    function close(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      close
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        close
      );
    };
  }, []);

  function getLocalePath(
    nextLocale:string
  ){

    const parts =
      pathname.split("/");

    /**
     * 第一段就是 locale
     */

    parts[1]=nextLocale;

    return parts.join("/");
  }

  return (
    <div
      ref={menuRef}
      style={{
        position:"relative"
      }}
    >
      <button
        onClick={()=>
          setOpen(!open)
        }
        style={{
          background:"transparent",
          border:"1px solid #e2e8f0",
          borderRadius:"999px",
          padding:"8px 12px",
          fontWeight:700,
          cursor:"pointer"
        }}
      >
        {
          label[
          locale as keyof typeof label
          ] || "EN"
        }

        {" "}▾
      </button>

      {open && (

      <div
      style={{
      position:"absolute",
      right:0,
      top:42,
      width:140,
      background:"white",
      borderRadius:14,
      overflow:"hidden",
      border:
      "1px solid #e2e8f0",
      zIndex:999
      }}
      >

      <LangLink
      href={getLocalePath("my")}
      label="မြန်မာ"
      />

      <LangLink
      href={getLocalePath("zh")}
      label="中文"
      />

      <LangLink
      href={getLocalePath("en")}
      label="English"
      />

      </div>

      )}
    </div>
  );
}

function LangLink({
  href,
  label
}:{
  href:string
  label:string
}){

return(

<Link
href={href}
style={{
display:"block",
padding:"12px",
fontWeight:700,
borderBottom:
"1px solid #f1f5f9"
}}
>

{label}

</Link>

)

}