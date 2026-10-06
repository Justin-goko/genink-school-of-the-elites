import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LightGuide from "./LightGuide";
import TutorPanel from "./TutorPanel";
import "./lightGuide.css";
import type { TutorContext } from "./LightGuideProvider";

interface Props {
  context: TutorContext | null;
}

export default function TutorButton({ context }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [context?.session_id, context?.unit_id]);
  useEffect(() => {
    document.body.classList.toggle("light-guide-open", open && Boolean(context));
    return () => document.body.classList.remove("light-guide-open");
  }, [open, context]);
  if (!context) return null;
  return (
    <>
      {!open && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open Light Guide tutor"
          className="light-guide-launcher fixed z-40 h-16 w-16 rounded-full p-0 transition-transform hover:scale-110 hover:bg-transparent focus-visible:ring-premium"
        >
          <LightGuide size={64} />
          <span className="sr-only">Ask the Light Guide</span>
        </Button>
      )}
      <TutorPanel open={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}