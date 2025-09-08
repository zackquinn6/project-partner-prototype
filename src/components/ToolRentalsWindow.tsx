import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, MapPin, Calendar, Wrench } from 'lucide-react';
import { ToolRentalFinder } from './ToolRentalFinder';

interface ToolRentalsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ToolRentalsWindow = ({ isOpen, onClose }: ToolRentalsWindowProps) => {
  const handleVisitToolio = () => {
    window.open('https://toolio.us', '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Tool Access & Rentals
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="finder" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="finder">Tool Access Finder</TabsTrigger>
            <TabsTrigger value="toolio">Toolio (Boston, MA)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="finder" className="mt-6 max-h-[70vh] overflow-y-auto">
            <ToolRentalFinder />
          </TabsContent>
          
          <TabsContent value="toolio" className="mt-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* Integration Highlight */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <Badge variant="default" className="mb-2">
                      Perfect Integration
                    </Badge>
                    <h3 className="text-xl font-semibold text-primary">
                      Toolio is perfectly integrated with Project Partner
                    </h3>
                    <p className="text-muted-foreground">
                      Seamlessly rent tools based on your specific project requirements
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Hero Section */}
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">Project-Based Tool Rentals</CardTitle>
                  <CardDescription className="text-lg">
                    Get the right tools for your project without the commitment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Currently Available in Boston, MA</span>
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      How It Works
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Browse professional-grade tools for your specific project</li>
                      <li>• Rent by the day, week, or project duration</li>
                      <li>• Local pickup and delivery available</li>
                      <li>• All tools maintained to professional standards</li>
                    </ul>
                  </div>

                  <div className="text-center space-y-3">
                    <Badge variant="secondary" className="text-sm">
                      Powered by Toolio
                    </Badge>
                    
                    <Button 
                      onClick={handleVisitToolio}
                      className="w-full"
                      size="lg"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Toolio.us
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      Seamless tool rentals for your DIY projects
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Professional Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      Access to high-quality tools you'd typically find at construction sites
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Project-Focused</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">
                      Rent exactly what you need for your specific project timeline
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};