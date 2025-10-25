import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Calculator, HelpCircle, Home, Calendar, Wrench, ShoppingCart, Users, FileText, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { useState } from 'react';

export const FeaturesSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const coreFeatures = [
    {
      icon: FileText,
      title: "Process Library & Templates",
      description: "Curated, categorized workflows from top videos and expert content",
      badge: "Repeatable Workflows",
      color: "bg-primary"
    },
    {
      icon: Calculator,
      title: "Materials Rollup & Scaling",
      description: "Dynamic bills of materials that scale to unit count and site specifics",
      badge: "Cost Control",
      color: "bg-accent"
    },
    {
      icon: Calendar,
      title: "Time Estimates & Scheduling",
      description: "Realistic durations, buffer logic, and calendar coordination",
      badge: "Stay On Track",
      color: "bg-green-600"
    }
  ];

  const additionalFeatures = [
    { icon: Target, label: "Layered Instructions" },
    { icon: Wrench, label: "Tool Library & Lists" },
    { icon: TrendingUp, label: "Risk Management" },
    { icon: Users, label: "Mobile-First Execution" },
    { icon: HelpCircle, label: "Scenario Planning" },
    { icon: ShoppingCart, label: "Checkout-Ready Lists" },
    { icon: FileText, label: "Evidence Logs" },
    { icon: Home, label: "Safety Checks" }
  ];

  return (
    <section className="section-spacing bg-muted/30" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Core Product Promise
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Convert scattered videos and advice into a living, auditable workflow you can assign, track, and finish
          </p>
        </div>

        {/* 3 Core Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 text-center hover:shadow-xl transition-all duration-300 hover-lift bg-card border-border">
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                  <Icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl mb-3 text-foreground">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base mb-4 text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  {feature.badge}
                </Badge>
              </Card>
            );
          })}
        </div>

        {/* Expandable Additional Features */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="max-w-4xl mx-auto">
          <div className="text-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2 hover:bg-muted">
                <span>{isExpanded ? 'Hide' : 'See All 11 Features'}</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {additionalFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center p-4 rounded-lg bg-card/50 hover:bg-card transition-colors border border-border"
                  >
                    <Icon className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-center text-foreground">
                      {feature.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};
