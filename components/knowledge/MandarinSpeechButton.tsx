"use client";
import { useState } from "react";
import { Volume2 } from "lucide-react";
export default function MandarinSpeechButton({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.82;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-cn")) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ||
      null;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }
  return (
    <button
      type="button"
      className={`mandarin-speech-button ${speaking ? "speaking" : ""}`}
      onClick={speak}
      aria-label={label}
      title={label}
    >
      <Volume2 size={15} />
    </button>
  );
}
