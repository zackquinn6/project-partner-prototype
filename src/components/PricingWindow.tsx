import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ResponsiveDialog } from '@/components/ResponsiveDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Phone, MessageCircle } from 'lucide-react';

interface PricingWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PricingWindow = ({ open, onOpenChange }: PricingWindowProps) => {
  const freeFeatures = [
    "Project management dashboard",
    "Home maintenance tracking",
    "Step-by-step instructions",
    "Basic project tracking",
    "Continuous improvement tips",
    "Tool and material lists",
    "Project completion certificates",
    "Basic workflow guidance",
    "Community access",
    "Mobile-friendly interface"
  ];

  const expertPlans = [
    {
      name: "Planning",
      price: "$99",
      duration: "40min",
      description: "Get your project off to the right start with expert planning guidance",
      popular: false,
      features: [
        "40-minute video consultation",
        "Project scope assessment",
        "Material and tool recommendations",
        "Timeline and budget planning",
        "Risk identification",
        "Personalized project roadmap"
      ]
    },
    {
      name: "Troubleshooting",
      price: "$79",
      duration: "20min",
      description: "Quick expert help when you hit a roadblock",
      popular: true,
      features: [
        "20-minute video consultation",
        "Problem diagnosis",
        "Solution recommendations",
        "Alternative approaches",
        "Next steps guidance",
        "Follow-up resources"
      ]
    },
    {
      name: "Whole-Project Partner",
      price: "$149",
      duration: "Full support",
      description: "Complete project coaching from start to finish",
      popular: false,
      features: [
        "Personal project coach",
        "Unlimited video consultations",
        "Weekly progress check-ins",
        "Quality assurance reviews",
        "Real-time problem solving",
        "Post-project follow-up"
      ]
    }
  ];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      size="content-large"
      title="Get the right level of support"
      description="Free apps let you run projects easier than ever before - and we offer an expert human video chat service for a confident, comprehensive project experience."
    >
        {/* Free Apps Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Free Apps</CardTitle>
            <CardDescription>
              Everything you need to successfully complete your DIY projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-4 h-4 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6" variant="outline">
              Get Started Free
            </Button>
          </CardContent>
        </Card>

        {/* Expert Calls Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-center mb-2">Expert Video Calls</h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Connect with experienced DIY professionals via video chat
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {expertPlans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">{plan.duration}</div>
                </div>
                <CardDescription className="mt-3">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 text-primary mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Book {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            All expert calls are conducted via secure video chat with verified DIY professionals.
          </p>
        </div>
    </ResponsiveDialog>
  );
};