import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
  useEffect(() => {
    document.body.classList.toggle("light-guide-open", open);
    return () => document.body.classList.remove("light-guide-open");
  }, [open]);
  return (
    <>
      {!open && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Open Light Guide tutor"
          className="fixed bottom-6 right-6 z-30 h-16 w-16 rounded-full p-0 transition-transform hover:scale-110 hover:bg-transparent focus-visible:ring-premium"
        >
          <LightGuide size={64} />
          <span className="sr-only">Ask the Light Guide</span>
        </Button>
      )}
      <TutorPanel open={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}