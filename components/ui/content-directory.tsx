import type { ReactNode } from "react";
import { Inbox, LoaderCircle, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContentDirectory({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("content-directory", className)}>{children}</section>;
}

export function DirectoryGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("directory-grid", className)}>{children}</div>;
}

export function DirectoryState({ kind = "empty", title, description }: { kind?: "loading" | "empty" | "error"; title: string; description?: string }) {
  const Icon = kind === "loading" ? LoaderCircle : kind === "error" ? TriangleAlert : Inbox;
  return <div className={cn("directory-state", `is-${kind}`)} role={kind === "error" ? "alert" : "status"}>
    <span><Icon aria-hidden="true" className={kind === "loading" ? "spin" : undefined} /></span>
    <strong>{title}</strong>{description && <p>{description}</p>}
  </div>;
}
