import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, PlayCircle } from 'lucide-react';
interface HeroSectionProps {
  onOpenDemo?: () => void;
}
export const HeroSection = ({
  onOpenDemo
}: HeroSectionProps) => {
  const navigate = useNavigate();
  return <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Floating animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 animate-float">
          <div className="w-16 h-16 bg-primary rounded-lg rotate-12" />
        </div>
        <div className="absolute bottom-32 right-20 animate-float-delayed">
          <div className="w-20 h-20 bg-accent rounded-lg -rotate-12" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-float">
          <div className="w-12 h-12 bg-primary rounded-full" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Copy */}
          <div className="text-center lg:text-left space-y-6">
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Make Your DIY Project Actually Finish
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              <strong className="text-foreground">Predictable, repeatable, and built for humans.</strong> Aggregate expert videos, step-by-step process content, tools, materials, and risk planning into a single, playable project workflow.
            </p>

            <p className="text-base text-muted-foreground italic border-l-4 border-accent pl-4 my-6">
              "I want to run a DIY project and I want it to be successful."
            </p>

            {/* Benefit Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <Badge className="bg-card border-2 border-primary text-primary px-4 py-2 text-sm font-semibold">
                Predictable
              </Badge>
              <Badge className="bg-card border-2 border-primary text-primary px-4 py-2 text-sm font-semibold">
                Playable
              </Badge>
              <Badge className="bg-card border-2 border-primary text-primary px-4 py-2 text-sm font-semibold">
                Auditable
              </Badge>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" onClick={() => navigate('/auth?mode=signup')}>
                Start a Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button variant="outline" size="xl" className="border-2 hover:bg-muted" onClick={onOpenDemo}>
                <PlayCircle className="mr-2 h-5 w-5" />
                Request a Demo
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
            </p>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border hover-lift">
              <img src="/lovable-uploads/dd8a6549-c627-436d-954c-e8c38a53fbee.png" alt="Project Partner Workflow Interface" className="w-full h-auto" />
            </div>

            {/* Floating success metrics */}
            <div className="absolute -top-4 -right-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg animate-float hidden md:block">
              <div className="text-2xl font-bold text-accent">15 hrs</div>
              <div className="text-xs text-muted-foreground">Time Saved</div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg animate-float-delayed hidden md:block">
              <div className="text-2xl font-bold text-primary">94%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};