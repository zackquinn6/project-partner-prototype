import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Search, Building2, FileText, MapPin, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CodePermitsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserHome {
  id: string;
  address: string;
  city: string;
  state: string;
  name: string;
}

interface BuildingCodeLink {
  title: string;
  url: string;
  description: string;
  category: string;
}

export function CodePermitsWindow({ open, onOpenChange }: CodePermitsWindowProps) {
  const { user } = useAuth();
  const [selectedHome, setSelectedHome] = useState<string>("");
  const [manualCity, setManualCity] = useState("");
  const [manualState, setManualState] = useState("");
  const [manualZip, setManualZip] = useState("");
  const [userHomes, setUserHomes] = useState<UserHome[]>([]);
  const [buildingCodes, setBuildingCodes] = useState<BuildingCodeLink[]>([]);
  const [permitLinks, setPermitLinks] = useState<BuildingCodeLink[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string>("");

  // Fetch user homes on component load
  useEffect(() => {
    const fetchUserHomes = async () => {
      if (!user) return;
      
      try {
        const { data: homes, error } = await supabase
          .from('homes')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        setUserHomes(homes || []);
      } catch (error) {
        console.error('Error fetching user homes:', error);
      }
    };

    if (open && user) {
      fetchUserHomes();
    }
  }, [open, user]);

  const searchBuildingCodes = async (location: string) => {
    setIsSearching(true);
    try {
      // Mock building codes data - in a real app, this would call a search API
      const mockCodes: BuildingCodeLink[] = [
        {
          title: "International Building Code (IBC) 2021",
          url: "https://codes.iccsafe.org/content/IBC2021P1",
          description: "The International Building Code establishes minimum requirements to safeguard public health, safety and general welfare.",
          category: "International"
        },
        {
          title: "International Residential Code (IRC) 2021",
          url: "https://codes.iccsafe.org/content/IRC2021P1",
          description: "The International Residential Code provides requirements for one- and two-family dwellings.",
          category: "International"
        },
        {
          title: `${location} Building Code`,
          url: `#local-building-code-${location.replace(/\s+/g, '-').toLowerCase()}`,
          description: `Local building code requirements for ${location}. Contact your local building department for specific regulations.`,
          category: "Local"
        },
        {
          title: `${location} Electrical Code`,
          url: `#local-electrical-code-${location.replace(/\s+/g, '-').toLowerCase()}`,
          description: `Electrical code requirements for ${location}. Based on National Electrical Code (NEC) with local amendments.`,
          category: "Local"
        },
        {
          title: "National Electrical Code (NEC) 2020",
          url: "https://www.nfpa.org/codes-and-standards/all-codes-and-standards/list-of-codes-and-standards/detail?code=70",
          description: "The National Electrical Code sets the standard for electrical installation in the United States.",
          category: "National"
        }
      ];

      setBuildingCodes(mockCodes);
      setActiveLocation(location);
      toast.success(`Found building codes for ${location}`);
    } catch (error) {
      console.error('Error searching building codes:', error);
      toast.error("Failed to search building codes");
    } finally {
      setIsSearching(false);
    }
  };

  const searchPermits = async (location: string) => {
    setIsSearching(true);
    try {
      // Mock permit data - in a real app, this would call a search API
      const mockPermits: BuildingCodeLink[] = [
        {
          title: `${location} Building Permits Department`,
          url: `#permits-department-${location.replace(/\s+/g, '-').toLowerCase()}`,
          description: `Apply for building permits in ${location}. Contact your local building department for specific requirements.`,
          category: "Local Government"
        },
        {
          title: `${location} Online Permit Portal`,
          url: `#online-permits-${location.replace(/\s+/g, '-').toLowerCase()}`,
          description: `Online portal for permit applications, status tracking, and inspections in ${location}.`,
          category: "Online Services"
        },
        {
          title: "Permit Requirements Guide",
          url: "#permit-requirements-guide",
          description: "General guide to understanding when permits are required for common home improvement projects.",
          category: "Resources"
        },
        {
          title: `${location} Inspection Scheduling`,
          url: `#inspection-scheduling-${location.replace(/\s+/g, '-').toLowerCase()}`,
          description: `Schedule required inspections for your project in ${location}.`,
          category: "Inspections"
        }
      ];

      setPermitLinks(mockPermits);
      setActiveLocation(location);
      toast.success(`Found permit information for ${location}`);
    } catch (error) {
      console.error('Error searching permits:', error);
      toast.error("Failed to search permit information");
    } finally {
      setIsSearching(false);
    }
  };

  const handleHomeSelection = (homeId: string) => {
    const home = userHomes.find(h => h.id === homeId);
    if (home) {
      const location = `${home.city}, ${home.state}`;
      setSelectedHome(homeId);
      setActiveLocation(location);
    }
  };

  const handleManualSearch = (searchType: 'codes' | 'permits') => {
    if (!manualCity || !manualState) {
      toast.error("Please enter both city and state");
      return;
    }
    
    const location = `${manualCity}, ${manualState}`;
    if (searchType === 'codes') {
      searchBuildingCodes(location);
    } else {
      searchPermits(location);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Code & Permits
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="codes" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="codes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Building Codes
            </TabsTrigger>
            <TabsTrigger value="permits" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Permits
            </TabsTrigger>
          </TabsList>

          <TabsContent value="codes" className="flex-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Building Codes Search
                </CardTitle>
                <CardDescription>
                  Find relevant building codes for your location, including international, national, and local requirements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Home Selection */}
                {userHomes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select from your homes:</Label>
                    <Select value={selectedHome} onValueChange={handleHomeSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a home" />
                      </SelectTrigger>
                      <SelectContent>
                        {userHomes.map((home) => (
                          <SelectItem key={home.id} value={home.id}>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              {home.address}, {home.city}, {home.state}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Manual Location Entry */}
                <div className="space-y-2">
                  <Label>Or enter location manually:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="City"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                    />
                    <Input
                      placeholder="State"
                      value={manualState}
                      onChange={(e) => setManualState(e.target.value)}
                    />
                    <Input
                      placeholder="Zip Code (optional)"
                      value={manualZip}
                      onChange={(e) => setManualZip(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => handleManualSearch('codes')} 
                    disabled={isSearching || !manualCity || !manualState}
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Search Building Codes"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {buildingCodes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Building Codes for {activeLocation}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {buildingCodes.map((code, index) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{code.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{code.description}</p>
                                <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mt-2">
                                  {code.category}
                                </span>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={code.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="permits" className="flex-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Permits Search
                </CardTitle>
                <CardDescription>
                  Find permit requirements and application processes for your location.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Home Selection */}
                {userHomes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select from your homes:</Label>
                    <Select value={selectedHome} onValueChange={handleHomeSelection}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a home" />
                      </SelectTrigger>
                      <SelectContent>
                        {userHomes.map((home) => (
                          <SelectItem key={home.id} value={home.id}>
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4" />
                              {home.address}, {home.city}, {home.state}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Manual Location Entry */}
                <div className="space-y-2">
                  <Label>Or enter location manually:</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="City"
                      value={manualCity}
                      onChange={(e) => setManualCity(e.target.value)}
                    />
                    <Input
                      placeholder="State"
                      value={manualState}
                      onChange={(e) => setManualState(e.target.value)}
                    />
                    <Input
                      placeholder="Zip Code (optional)"
                      value={manualZip}
                      onChange={(e) => setManualZip(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => handleManualSearch('permits')} 
                    disabled={isSearching || !manualCity || !manualState}
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? "Searching..." : "Search Permit Information"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {permitLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Permit Information for {activeLocation}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {permitLinks.map((permit, index) => (
                        <Card key={index} className="border-l-4 border-l-accent">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{permit.title}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{permit.description}</p>
                                <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mt-2">
                                  {permit.category}
                                </span>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={permit.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}