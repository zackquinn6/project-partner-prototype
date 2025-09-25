import React, { useState } from 'react';
import { ScrollableDialog } from '@/components/ScrollableDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageCircle, 
  Video, 
  Phone, 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  HeadphonesIcon,
  Zap,
  Shield
} from 'lucide-react';

interface ExpertHelpWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExpertHelpWindow({ open, onOpenChange }: ExpertHelpWindowProps) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const helpServices = [
    {
      id: 'live-chat',
      title: 'Live Expert Chat',
      description: 'Get instant answers from our DIY experts',
      icon: MessageCircle,
      price: 'Free',
      duration: 'Instant',
      features: ['Real-time support', 'Project guidance', 'Tool recommendations'],
      available: true,
      popular: true
    },
    {
      id: 'video-call',
      title: 'Video Consultation',
      description: 'Face-to-face guidance with detailed walkthroughs',
      icon: Video,
      price: '$29',
      duration: '30 min',
      features: ['Screen sharing', 'Visual demonstrations', 'Personalized advice'],
      available: true,
      popular: false
    },
    {
      id: 'phone-support',
      title: 'Phone Support',
      description: 'Talk through your project challenges',
      icon: Phone,
      price: '$19',
      duration: '20 min',
      features: ['Voice support', 'Step-by-step guidance', 'Quick solutions'],
      available: true,
      popular: false
    },
    {
      id: 'schedule-expert',
      title: 'Schedule Expert Session',
      description: 'Book a dedicated session for complex projects',
      icon: Calendar,
      price: '$49',
      duration: '60 min',
      features: ['Detailed planning', 'Custom solutions', 'Follow-up support'],
      available: true,
      popular: false
    }
  ];

  const quickHelp = [
    {
      title: 'Project Planning Help',
      description: 'Get help organizing your project timeline and steps',
      action: () => console.log('Project Planning Help')
    },
    {
      title: 'Tool Recommendations',
      description: 'Find the right tools for your specific project',
      action: () => console.log('Tool Recommendations')
    },
    {
      title: 'Safety Guidelines', 
      description: 'Learn safety best practices for your project type',
      action: () => console.log('Safety Guidelines')
    },
    {
      title: 'Troubleshooting',
      description: 'Solve common issues and get unstuck',
      action: () => console.log('Troubleshooting')
    }
  ];

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    // Add service-specific logic here
  };

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Get Expert Help"
      description="Connect with DIY experts for personalized guidance on your projects"
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary mr-2" />
                <span className="text-2xl font-bold">500+</span>
              </div>
              <p className="text-sm text-muted-foreground">Expert Advisors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">4.9</span>
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">&lt;5min</span>
              </div>
              <p className="text-sm text-muted-foreground">Response Time</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Expert Services</TabsTrigger>
            <TabsTrigger value="quick-help">Quick Help</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {helpServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Card 
                    key={service.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedService === service.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{service.title}</h3>
                              {service.popular && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs">
                                  Most Popular
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {service.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {service.features.map((feature, index) => (
                                <div key={index} className="flex items-center text-xs text-muted-foreground">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="font-semibold text-lg">{service.price}</div>
                          <div className="text-sm text-muted-foreground">{service.duration}</div>
                          
                          <Button 
                            className="mt-3" 
                            size="sm"
                            disabled={!service.available}
                          >
                            {service.price === 'Free' ? 'Start Chat' : 'Book Now'}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="quick-help" className="space-y-4 mt-6">
            <div className="grid gap-3">
              {quickHelp.map((item, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={item.action}>
                        Get Help
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <HeadphonesIcon className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Need More Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our experts are standing by to help with any project question
                </p>
                <Button className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Connect with Expert Now
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 text-primary mr-2" />
              Why Choose Expert Help?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Verified Experts:</strong> All advisors are licensed professionals with 10+ years experience
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Quick Response:</strong> Get answers in under 5 minutes during business hours
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Satisfaction Guaranteed:</strong> 100% money-back guarantee if you're not satisfied
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Follow-up Support:</strong> Get follow-up messages to ensure your success
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollableDialog>
  );
}