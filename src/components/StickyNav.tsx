import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, LogIn, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import genlinkLogo from "@/assets/genlink-logo.png";

const StickyNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Courses", href: "/courses" },
    { name: "Mind Architecture", href: "/mind-architecture" },
    { name: "Financial Intelligence", href: "/financial-intelligence" },
    { name: "Learning Paths", href: "/learning-paths" },
    { name: "Events", href: "/events" },
    { name: "Resources", href: "/resources" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-primary/95 backdrop-blur-lg shadow-lg border-b border-primary-foreground/10' 
            : 'bg-primary/70 backdrop-blur-md border-b border-primary-foreground/10'}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src={genlinkLogo} 
                alt="Genlink Hub" 
                className="h-10 w-auto transition-transform group-hover:scale-105"
              />
              <span className="font-bold text-xl hidden sm:block text-primary-foreground">
                Genlink Hub
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/auth")}
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </Button>
                  <Button 
                    className="group bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => navigate("/auth")}
                  >
                    <Sparkles className="w-4 h-4 mr-2 group-hover:animate-spin" />
                    Start Learning
                  </Button>
                </>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors text-primary-foreground hover:bg-primary-foreground/10"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div 
          className={`md:hidden absolute top-full left-0 right-0 bg-primary/95 backdrop-blur-lg border-b border-primary-foreground/10 shadow-xl transition-all duration-300 overflow-hidden
            ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Button onClick={handleSignOut} variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => { navigate("/auth"); setIsMobileMenuOpen(false); }} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Start Learning
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="h-16 md:h-20" />
    </>
  );
};

export default StickyNav;
