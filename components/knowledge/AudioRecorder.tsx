"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

export default function AudioRecorder({
  locale,
  disabled,
  onRecorded,
}: {
  locale: string;
  disabled?: boolean;
  onRecorded: (file: File) => void;
}) {
  const copy =
    locale === "zh"
      ? {
          start: "开始录音",
          stop: "停止录音",
          ready: "录音已准备，可先试听",
          denied: "无法使用麦克风，请在浏览器地址栏允许麦克风权限。",
        }
      : locale === "my"
        ? {
            start: "အသံသွင်းရန်",
            stop: "အသံသွင်းမှု ရပ်ရန်",
            ready: "အသံဖိုင်အသင့်ဖြစ်ပါပြီ။ မတင်မီ နားထောင်နိုင်သည်။",
            denied:
              "Microphone အသုံးပြုခွင့်မရပါ။ Browser address bar တွင် ခွင့်ပြုပါ။",
          }
        : {
            start: "Start recording",
            stop: "Stop recording",
            ready: "Recording ready — review it before submitting",
            denied:
              "Microphone access is unavailable. Allow it from the browser address bar.",
          };
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [recording]);
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((track) => track.stop());
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  async function start() {
    setMessage("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      const candidates = [
        "audio/webm;codecs=opus",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      const mimeType =
        candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
      const next = new MediaRecorder(
        media,
        mimeType ? { mimeType } : undefined,
      );
      chunks.current = [];
      stream.current = media;
      recorder.current = next;
      next.ondataavailable = (event) => {
        if (event.data.size) chunks.current.push(event.data);
      };
      next.onstop = () => {
        const baseType = (next.mimeType || "audio/webm").split(";")[0];
        const extension =
          baseType === "audio/mp4"
            ? "m4a"
            : baseType === "audio/ogg"
              ? "ogg"
              : "webm";
        const blob = new Blob(chunks.current, { type: baseType });
        const file = new File([blob], `recording-${Date.now()}.${extension}`, {
          type: baseType,
        });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(blob));
        setMessage(copy.ready);
        onRecorded(file);
        media.getTracks().forEach((track) => track.stop());
      };
      next.start(500);
      setSeconds(0);
      setRecording(true);
    } catch {
      setMessage(copy.denied);
    }
  }
  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
    setRecording(false);
  }

  return (
    <div className="assignment-audio-recorder">
      <button
        type="button"
        disabled={disabled}
        onClick={recording ? stop : start}
        className={recording ? "is-recording" : ""}
      >
        {recording ? <Square size={15} /> : <Mic size={16} />}
        {recording ? `${copy.stop} · ${seconds}s` : copy.start}
      </button>
      {previewUrl ? (
        <audio controls preload="metadata" src={previewUrl} />
      ) : null}
      {message ? <small>{message}</small> : null}
    </div>
  );
}
