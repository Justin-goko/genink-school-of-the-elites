import { useState } from "react";
import LightGuide from "./LightGuide";
import TutorPanel from "./TutorPanel";
import "./lightGuide.css";

interface Props {
  context: {
    unit_id?: string;
    session_id?: string;
    pillar_name?: string;
    unit_title?: string;
    session_title?: string;
  };
}

export default function TutorButton({ context }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open Light Guide tutor"
          className="fixed bottom-6 right-6 z-30 rounded-full transition-transform hover:scale-110 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
        >
          <LightGuide size={64} />
          <span className="sr-only">Ask the Light Guide</span>
        </button>
      )}
      <TutorPanel open={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}