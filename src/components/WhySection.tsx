import { Card, CardContent } from "@/components/ui/card";
import { Brain, DollarSign, Code2, TrendingUp } from "lucide-react";

const WhySection = () => {
  const benefits = [
    {
      icon: Brain,
      title: "Spiritual Empowerment",
      description: "Transform your mindset with spiritual wealth principles that lay the foundation for lasting success.",
    },
    {
      icon: DollarSign,
      title: "Financial Mastery",
      description: "Master practical financial literacy and wealth-building strategies for generational prosperity.",
    },
    {
      icon: Code2,
      title: "Tech Skills",
      description: "Gain cutting-edge ICT skills that open doors to unlimited opportunities in the digital economy.",
    },
    {
      icon: TrendingUp,
      title: "Income Generation",
      description: "Learn proven methods to create multiple streams of online income and achieve financial freedom.",
    },
  ];

  return (
    <section id="why-us" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Why Choose Genlink Hub?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A unique blend of spiritual renewal, tech mastery, and practical wealth generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50"
            >
              <CardContent className="pt-6 space-y-4">
                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <benefit.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <blockquote className="text-xl md:text-2xl italic text-foreground/80 max-w-3xl mx-auto">
            "The mind is everything. What you think, you become. Combine spiritual wisdom with practical skills, and you unlock generational wealth."
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default WhySection;
