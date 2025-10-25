import { AlertCircle, Video, DollarSign, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const ProblemSection = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "One-off chaos beats craft",
      description: "DIY instruction today is scattered videos, guesswork, and surprise costs."
    },
    {
      icon: Video,
      title: "Videos alone don't equal success",
      description: "They teach moments, not full project control, scheduling, or risk planning."
    },
    {
      icon: Clock,
      title: "Teams and landlords lose time and money",
      description: "When projects depend on memory, messy notes, or inconsistent approaches."
    }
  ];

  return (
    <section className="section-spacing bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Why Projects Fail
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            <strong className="text-foreground">Why an MES for DIY:</strong> predefined, versioned processes turn one-off attempts into repeatable projects that succeed more often, faster, and cheaper.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground">
                  {problem.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
