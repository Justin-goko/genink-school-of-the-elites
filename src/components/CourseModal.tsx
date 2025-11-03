import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, CheckCircle2 } from "lucide-react";

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    title: string;
    description: string;
    duration: string;
    isPremium: boolean;
    price?: string;
    image: string;
    rating: number;
    overview: string;
    whatYouLearn: string[];
    prerequisites: string[];
  } | null;
}

const CourseModal = ({ isOpen, onClose, course }: CourseModalProps) => {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.isPremium && (
              <Badge className="absolute top-4 right-4 bg-premium text-premium-foreground border-0">
                Premium
              </Badge>
            )}
          </div>
          
          <DialogTitle className="text-2xl">{course.title}</DialogTitle>
          <DialogDescription className="text-base">
            {course.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-premium text-premium" />
                <span className="font-bold">{course.rating}</span>
              </div>
            </div>
            {course.isPremium && course.price && (
              <div className="text-3xl font-bold text-premium">{course.price}</div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Course Overview</h3>
            <p className="text-muted-foreground">{course.overview}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
            <ul className="space-y-2">
              {course.whatYouLearn.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
            <ul className="space-y-2">
              {course.prerequisites.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              className={course.isPremium ? "flex-1 bg-premium hover:bg-premium/90 text-premium-foreground" : "flex-1 bg-accent hover:bg-accent/90"}
              size="lg"
            >
              Enroll Now
            </Button>
            <Button variant="outline" size="lg" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseModal;
