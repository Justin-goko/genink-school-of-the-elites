import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  price?: string;
  image: string;
  rating: number;
  onLearnMore: () => void;
}

const CourseCard = ({
  title,
  description,
  duration,
  isPremium,
  price,
  image,
  rating,
  onLearnMore,
}: CourseCardProps) => {
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
        {isPremium && (
          <Badge className="absolute top-3 right-3 bg-premium text-premium-foreground border-0 shadow-lg">
            Premium
          </Badge>
        )}
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
          className={isPremium ? "flex-1 bg-premium hover:bg-premium/90 text-premium-foreground" : "flex-1 bg-accent hover:bg-accent/90"}
        >
          Enroll Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
