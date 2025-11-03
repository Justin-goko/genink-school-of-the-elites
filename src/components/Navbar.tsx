import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import genlinkLogo from "@/assets/genlink-logo.png";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={genlinkLogo} alt="Genlink Hub" className="h-12 w-auto" />
            <span className="text-xl font-bold text-foreground">Genlink Hub</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#courses" className="text-foreground/80 hover:text-accent transition-colors">
              Courses
            </a>
            <a href="#why-us" className="text-foreground/80 hover:text-accent transition-colors">
              Why Us
            </a>
            <a href="#newsletter" className="text-foreground/80 hover:text-accent transition-colors">
              Newsletter
            </a>
            <Button variant="default" className="bg-accent hover:bg-accent/90">
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 pb-4">
            <a href="#courses" className="text-foreground/80 hover:text-accent transition-colors">
              Courses
            </a>
            <a href="#why-us" className="text-foreground/80 hover:text-accent transition-colors">
              Why Us
            </a>
            <a href="#newsletter" className="text-foreground/80 hover:text-accent transition-colors">
              Newsletter
            </a>
            <Button variant="default" className="bg-accent hover:bg-accent/90 w-full">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
