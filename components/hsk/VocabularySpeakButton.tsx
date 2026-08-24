"use client";

import { Volume2 } from "lucide-react";

export default function VocabularySpeakButton({ text, label }: { text: string; label: string }) {
  function speak() {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.78;
    window.speechSynthesis.speak(utterance);
  }
  return <button type="button" onClick={speak} aria-label={`${label}: ${text}`}><Volume2 size={17}/></button>;
}
