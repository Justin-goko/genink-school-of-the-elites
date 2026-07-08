import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, LogIn, LogOut, User, Award, ArrowRight, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole, useAchievementCount } from "@/hooks/useUserRole";
import NavbarXPCounter from "@/components/xp/NavbarXPCounter";
import genlinkLogo from "@/assets/genlink-logo.png";

const StickyNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { tier, roleLabel } = useUserRole();
  const { data: badgeCount = 0 } = useAchievementCount();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Context-aware primary nav links
  const navLinks: Array<{ name: string; href: string }> =
    tier === "team"
      ? [
          { name: "My Journey", href: "/journey" },
          { name: "Operations Dashboard", href: "/dashboard" },
        ]
      : tier === "student"
        ? [
            { name: "My Journey", href: "/journey" },
            { name: "Community", href: "/events" },
            { name: "Resources", href: "/resources" },
          ]
        : [
            { name: "About", href: "/#why-us" },
            { name: "How It Works", href: "/#features" },
            { name: "Pillars Preview", href: "/#courses" },
          ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  const renderRightSide = () => {
    // Layer 3 — team / admin
    if (tier === "team") {
      return (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-1 text-xs font-semibold text-[#C9A84C]">
            <ShieldCheck className="w-3.5 h-3.5" />
            {roleLabel}
          </span>
          <button
            onClick={handleSignOut}
            title={`${user?.email} — Sign out`}
            className="h-9 w-9 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-semibold flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
          >
            {initials}
          </button>
        </>
      );
    }

    // Layer 2 — authenticated student
    if (tier === "student") {
      return (
        <>
          <NavbarXPCounter />
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              background: "rgba(201,168,76,0.12)",
              color: "#C9A84C",
              border: "1px solid rgba(201,168,76,0.35)",
            }}
            aria-label={`${badgeCount} badges earned`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="tabular-nums">{badgeCount}</span>
          </span>
          <button
            onClick={handleSignOut}
            title={`${user?.email} — Sign out`}
            className="h-9 w-9 rounded-full bg-primary-foreground/15 text-primary-foreground text-xs font-semibold flex items-center justify-center hover:bg-primary-foreground/25 transition-colors"
          >
            {initials}
          </button>
        </>
      );
    }

    // Layer 1 — public visitor
    return (
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
          onClick={() => navigate("/pathway-intelligence")}
          className="group bg-[#C9A84C] text-[#0F1B33] hover:bg-[#C9A84C]/90 font-semibold"
        >
          Start Your Assessment
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </>
    );
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

            <div className="hidden md:flex items-center gap-3">{renderRightSide()}</div>

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
            {tier === "guest" ? (
              <>
                <Button
                  onClick={() => { navigate("/auth"); setIsMobileMenuOpen(false); }}
                  variant="outline"
                  className="w-full border-primary-foreground/30 text-primary-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                <Button
                  onClick={() => { navigate("/pathway-intelligence"); setIsMobileMenuOpen(false); }}
                  className="w-full bg-[#C9A84C] text-[#0F1B33] hover:bg-[#C9A84C]/90 font-semibold"
                >
                  Start Your Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-between pt-2 border-t border-primary-foreground/10">
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <User className="w-4 h-4" />
                  <span className="max-w-[160px] truncate">{user?.email}</span>
                  {tier === "team" && (
                    <span className="ml-2 text-xs text-[#C9A84C]">{roleLabel}</span>
                  )}
                </div>
                <Button onClick={handleSignOut} variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground">
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-16 md:h-20" />
    </>
  );
};

export default StickyNav;
