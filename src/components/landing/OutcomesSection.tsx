import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quote, Clock, TrendingDown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OutcomesSection = () => {
  const navigate = useNavigate();
  
  const outcomes = [
    {
      icon: Clock,
      metric: "15 hours",
      label: "Saved per Project",
      description: "Less rework, faster execution"
    },
    {
      icon: TrendingDown,
      metric: "40%",
      label: "Fewer Surprises",
      description: "Reduced material costs and delays"
    }
  ];

  return (
    <section className="section-spacing bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Real Results
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {outcomes.map((outcome, index) => {
            const Icon = outcome.icon;
            return (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-shadow">
                <Icon className="h-12 w-12 text-accent mx-auto mb-4" />
                <div className="text-4xl font-bold text-foreground mb-2">
                  {outcome.metric}
                </div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  {outcome.label}
                </div>
                <p className="text-muted-foreground">
                  {outcome.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Customer Quote */}
        <Card className="max-w-3xl mx-auto p-8 bg-muted/50 border-l-4 border-accent">
          <Quote className="h-8 w-8 text-accent mb-4" />
          <p className="text-lg text-foreground mb-4 italic">
            "I've done three bathroom renovations now using Project Partner. The first one took me 6 weeks and cost $500 more than expected. The third one? Done in 10 days, under budget, and I knew exactly what to expect every step of the way."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-accent-foreground font-bold">
              JM
            </div>
            <div>
              <div className="font-semibold text-foreground">Jake Martinez</div>
              <div className="text-sm text-muted-foreground">Weekend Renovator</div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => navigate('/auth?mode=signup')}
          >
            See a Sample Workflow
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
