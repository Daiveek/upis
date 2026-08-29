"use client";

import { useState } from "react";

type Recognition = { start: () => void; stop: () => void; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void };

export function VoiceButton({ onTranscript }: { onTranscript: (value: string) => void }) {
  const [listening, setListening] = useState(false);
  const startListening = () => {
    const RecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionConstructor) { onTranscript("Voice input is not available in this browser. You can type your request below."); return; }
    const recognition: Recognition = new RecognitionConstructor();
    recognition.onresult = (event) => onTranscript(event.results[0][0].transcript);
    recognition.onend = () => setListening(false);
    setListening(true);
    recognition.start();
  };
  return <button onClick={startListening} aria-label="Speak your request" className={`grid h-11 w-11 place-items-center rounded-full transition ${listening ? "bg-saffron text-white" : "bg-[#e5eee7] text-moss hover:bg-[#d3e1d6]"}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/></svg></button>;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  }
}
