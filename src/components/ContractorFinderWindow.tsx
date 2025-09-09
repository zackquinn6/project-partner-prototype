import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Users, Star, Hammer, CheckCircle } from "lucide-react";

interface ContractorFinderWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContractorFinderWindow({ open, onOpenChange }: ContractorFinderWindowProps) {
  const contractorServices = [
    {
      name: "Angi's List",
      url: "https://www.angi.com",
      icon: Star,
      description: "Find top-rated contractors in your area with verified reviews and background checks.",
      features: ["Verified Reviews", "Background Checks", "Price Comparisons", "Project Matching"],
      color: "bg-orange-600",
      textColor: "text-white"
    },
    {
      name: "Thumbtack",
      url: "https://www.thumbtack.com",
      icon: CheckCircle,
      description: "Get personalized quotes from professionals for your specific project needs.",
      features: ["Instant Quotes", "Custom Matching", "Project Photos", "Message Directly"],
      color: "bg-blue-600",
      textColor: "text-white"
    },
    {
      name: "TaskRabbit",
      url: "https://www.taskrabbit.com",
      icon: Hammer,
      description: "Hire skilled Taskers for home improvement, repairs, and handyman services.",
      features: ["Same-Day Service", "Hourly or Fixed Price", "Insurance Coverage", "Easy Booking"],
      color: "bg-green-600",
      textColor: "text-white"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contractor Finder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Connect with trusted professionals to help complete your DIY projects. 
              Compare quotes, read reviews, and find the perfect contractor for your needs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {contractorServices.map((service, index) => (
              <Card key={index} className="transition-all duration-300 hover:shadow-lg border-2 hover:border-primary/20">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <service.icon className={`h-8 w-8 ${service.textColor}`} />
                  </div>
                  <CardTitle className="text-xl">{service.name}</CardTitle>
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Key Features
                    </h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    asChild
                    variant="default"
                  >
                    <a 
                      href={service.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit {service.name}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Pro Tips for Hiring Contractors</h3>
                <div className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Always check licenses and insurance before hiring</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Get multiple quotes to compare pricing and approaches</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Read reviews and ask for recent project references</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}