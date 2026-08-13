"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";

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
    <div ref={menuRef} className="menu-popover">
      <button
        onClick={()=>
          setOpen(!open)
        }
        className="site-action-button language-button"
        aria-expanded={open}
      >
        <Languages size={17} />
        {
          label[
          locale as keyof typeof label
          ] || "EN"
        }

        <ChevronDown size={14} />
      </button>

      {open && (

      <div className="site-dropdown language-dropdown">

      <LangLink
      href={getLocalePath("my")}
      label="မြန်မာ"
      active={locale === "my"}
      />

      <LangLink
      href={getLocalePath("zh")}
      label="中文"
      active={locale === "zh"}
      />

      <LangLink
      href={getLocalePath("en")}
      label="English"
      active={locale === "en"}
      />

      </div>

      )}
    </div>
  );
}

function LangLink({
  href,
  label
  ,active
}:{
  href:string
  label:string
  active:boolean
}){

return(

<Link href={href} className="dropdown-link language-option">
{label}{active && <Check size={15} />}

</Link>

)

}
