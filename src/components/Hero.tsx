import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/80">
        <img
          src={heroBanner}
          alt="Empowerment Journey"
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30">
            <Sparkles className="w-4 h-4 text-accent-foreground" />
            <span className="text-sm text-accent-foreground font-medium">Linking Generations</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
            Renew the Mind, <span className="text-accent">Empower</span> the Generation
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Transform your life through a revolutionary blend of <strong>spiritual renewal</strong>, 
            <strong> financial wisdom</strong>, and <strong>cutting-edge digital skills</strong>. 
            Build generational wealth that transcends money.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a href="#courses">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground group hover-scale">
                Explore Courses
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/events">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover-scale">
                Join Live Events
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
