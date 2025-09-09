import { useEffect, useRef } from "react";

export default function ElevenlabsAudioNative({
  publicUserId,
  size = "large",
  textColorRgba = "rgba(0,0,0,1.0)",
  backgroundColorRgba = "rgba(255,255,255,1.0)",
  height = 90,
  width = "100%",
  projectId
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = "";
      // Remove any previous script
      const prevScript = document.getElementById("elevenlabs-audionative-script");
      if (prevScript) prevScript.remove();

      // Create the widget div
      const div = document.createElement("div");
      div.id = "elevenlabs-audionative-widget";
      div.setAttribute("data-height", height);
      div.setAttribute("data-width", width);
      div.setAttribute("data-frameborder", "no");
      div.setAttribute("data-scrolling", "no");
      div.setAttribute("data-publicuserid", publicUserId);
      div.setAttribute("data-playerurl", "https://elevenlabs.io/player/index.html");
      div.setAttribute("data-small", size === "small" ? "True" : "False");
      div.setAttribute("data-textcolor", textColorRgba);
      div.setAttribute("data-backgroundcolor", backgroundColorRgba);
      if (projectId) div.setAttribute("data-projectid", projectId);
      div.innerHTML = `Loading the <a href="https://elevenlabs.io/text-to-speech" target="_blank" rel="noopener">Elevenlabs Text to Speech</a> AudioNative Player...`;
      ref.current.appendChild(div);

      // Always add a fresh script
      const script = document.createElement("script");
      script.id = "elevenlabs-audionative-script";
      script.src = "https://elevenlabs.io/player/audioNativeHelper.js";
      script.type = "text/javascript";
      script.onload = () => {
        window.ElevenLabsAudioNativeHelper?.init?.();
      };
      document.body.appendChild(script);
    }
    return () => {
      if (ref.current) ref.current.innerHTML = "";
      const prevScript = document.getElementById("elevenlabs-audionative-script");
      if (prevScript) prevScript.remove();
    };
  }, [publicUserId, size, textColorRgba, backgroundColorRgba, height, width, projectId]);

  return <div ref={ref}></div>;
} 