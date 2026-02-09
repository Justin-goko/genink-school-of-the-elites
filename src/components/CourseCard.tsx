import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, Play, BookOpen, Brain } from "lucide-react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  price?: string;
  image: string;
  rating: number;
  subcategory?: string;
  responsibleUse?: string[];
  onLearnMore: () => void;
}

const CourseCard = ({
  id,
  title,
  description,
  duration,
  isPremium,
  price,
  image,
  rating,
  subcategory,
  responsibleUse,
  onLearnMore,
}: CourseCardProps) => {
  const hasResponsibleUse = responsibleUse && responsibleUse.length > 0;
  return (
    <Card 
      className={`group overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        isPremium ? "border-premium/50 shadow-[0_0_20px_rgba(255,215,0,0.1)]" : "shadow-lg"
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 flex gap-2">
          {subcategory && (
            <Badge className="bg-secondary/90 text-secondary-foreground border-0 shadow-lg text-xs">
              {subcategory}
            </Badge>
          )}
        </div>
        {isPremium && (
          <Badge className="absolute top-3 right-3 bg-premium text-premium-foreground border-0 shadow-lg">
            Premium
          </Badge>
        )}
        {/* Free modules and responsible use badges */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
            <BookOpen className="w-3 h-3" />
            <span>4 Free Modules</span>
          </div>
          {hasResponsibleUse && (
            <div className="flex items-center gap-1 bg-accent/80 backdrop-blur-sm text-accent-foreground px-2 py-1 rounded-full text-xs">
              <Brain className="w-3 h-3" />
              <span>Ethical Use</span>
            </div>
          )}
        </div>
      </div>
      
      <CardHeader>
        <CardTitle className="text-xl line-clamp-2 group-hover:text-accent transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-premium text-premium" />
            <span className="font-medium">{rating}</span>
          </div>
        </div>
        
        {isPremium && price && (
          <div className="text-2xl font-bold text-premium">{price}</div>
        )}
      </CardContent>
      
      <CardFooter className="gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onLearnMore}
        >
          Learn More
        </Button>
        <Button 
          asChild
          className={isPremium ? "flex-1 bg-premium hover:bg-premium/90 text-premium-foreground" : "flex-1 bg-accent hover:bg-accent/90"}
        >
          <Link to={`/learn/${id}`}>
            <Play className="w-4 h-4 mr-1" />
            Start Free
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
