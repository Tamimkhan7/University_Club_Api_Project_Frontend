import { useCallback, useRef, useState } from "react";

// Matches the backend's SendVoiceMessageDto.DurationSeconds range (1-600s) -
// recording auto-stops once it hits this so we never produce a clip the
// backend would reject.
const MAX_DURATION_SECONDS = 600;

const MIME_CANDIDATES = [
  { mimeType: "audio/webm;codecs=opus", extension: "webm" },
  { mimeType: "audio/webm", extension: "webm" },
  { mimeType: "audio/mp4", extension: "m4a" },
  { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
  { mimeType: "audio/ogg", extension: "ogg" },
];

function pickSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") return null;
  for (const candidate of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(candidate.mimeType)) return candidate;
  }
  return { mimeType: "", extension: "webm" }; // let the browser choose a default
}

// Records short voice-message clips via the browser's MediaRecorder API.
//
// onAutoStop(blob, extension) fires only if the MAX_DURATION_SECONDS cap is
// hit before the caller calls stopRecording() themselves - it lets the
// caller (e.g. send the clip that was just force-stopped) without losing it.
export default function useVoiceRecorder({ onAutoStop } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(null);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const extensionRef = useRef("webm");
  const secondsRef = useRef(0);
  const resolveStopRef = useRef(null);
  const onAutoStopRef = useRef(onAutoStop);
  onAutoStopRef.current = onAutoStop;

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording isn't supported in this browser.");
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const picked = pickSupportedMimeType();
      extensionRef.current = picked?.extension || "webm";
      const recorder = picked?.mimeType
        ? new MediaRecorder(stream, { mimeType: picked.mimeType })
        : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        cleanupStream();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        const resolve = resolveStopRef.current;
        resolveStopRef.current = null;
        if (resolve) {
          resolve(blob);
        } else if (blob.size > 0) {
          // Stopped by the MAX_DURATION_SECONDS cap, not by the caller.
          onAutoStopRef.current?.(blob, extensionRef.current);
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      secondsRef.current = 0;
      setSeconds(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        secondsRef.current += 1;
        setSeconds(secondsRef.current);
        if (secondsRef.current >= MAX_DURATION_SECONDS) {
          clearTimer();
          setIsRecording(false);
          recorderRef.current?.stop();
        }
      }, 1000);

      return true;
    } catch (err) {
      cleanupStream();
      setError(
        err?.name === "NotAllowedError"
          ? "Microphone access was denied."
          : "Couldn't access the microphone."
      );
      return false;
    }
  }, []);

  // Stops recording and resolves with { blob, durationSeconds, extension },
  // or null if nothing was recording.
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }
      clearTimer();
      setIsRecording(false);
      const durationSeconds = secondsRef.current;
      resolveStopRef.current = (blob) => {
        resolve({ blob, durationSeconds, extension: extensionRef.current });
      };
      recorder.stop();
    });
  }, []);

  // Stops and discards the current recording (e.g. the user cancels).
  const cancelRecording = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    resolveStopRef.current = null;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => cleanupStream();
      recorder.stop();
    } else {
      cleanupStream();
    }
    chunksRef.current = [];
    secondsRef.current = 0;
    setIsRecording(false);
    setSeconds(0);
  }, []);

  return { isRecording, seconds, error, startRecording, stopRecording, cancelRecording };
}