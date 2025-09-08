import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, ExternalLink, Search, Filter, Star } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface AccessCenter {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  distance: number;
  cost: number; // 1-5 scale
  quality: number; // 1-5 scale
  options: number; // 1-5 scale (scope of tools/options available)
  internetRating: number; // 1-5 scale
  hasGeneralTools: boolean;
  hasHeavyEquipment: boolean;
  isLibrary: boolean;
  isMakerspace: boolean;
  isRentalApp: boolean;
  isRentalCenter: boolean;
  isRetailer: boolean;
  type: 'rental_center' | 'retailer' | 'library' | 'makerspace' | 'rental_app';
}

interface ToolRentalFinderProps {
  className?: string;
}

export function ToolRentalFinder({ className }: ToolRentalFinderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState('20');
  const [generalTools, setGeneralTools] = useState(true);
  const [heavyEquipment, setHeavyEquipment] = useState(false);
  const [libraries, setLibraries] = useState(true);
  const [makerspaces, setMakerspaces] = useState(true);
  const [rentalApps, setRentalApps] = useState(true);
  const [rentalCenters, setRentalCenters] = useState(true);
  const [retailers, setRetailers] = useState(true);
  const [accessCenters, setAccessCenters] = useState<AccessCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      performSearch();
    } else if (debouncedSearchQuery.length === 0) {
      setAccessCenters([]);
      setHasSearched(false);
    }
  }, [debouncedSearchQuery, radius, generalTools, heavyEquipment, libraries, makerspaces, rentalApps, rentalCenters, retailers]);

  const performSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      // Create mock results with enhanced rating system for demo
      const mockResults: AccessCenter[] = [
        {
          id: 'home-depot-1',
          name: 'Home Depot Tool Rental',
          address: '123 Main St',
          city: debouncedSearchQuery.split(',')[0] || debouncedSearchQuery,
          state: debouncedSearchQuery.split(',')[1]?.trim() || 'MA',
          phone: '(617) 555-0123',
          website: 'https://homedepot.com/toolrental',
          distance: 2.3,
          cost: 3,
          quality: 4,
          options: 4,
          internetRating: 4,
          hasGeneralTools: true,
          hasHeavyEquipment: true,
          isLibrary: false,
          isMakerspace: false,
          isRentalApp: false,
          isRentalCenter: true,
          isRetailer: true,
          type: 'rental_center'
        },
        {
          id: 'lowes-1',
          name: 'Lowe\'s Tool Rental',
          address: '456 Oak Ave',
          city: debouncedSearchQuery.split(',')[0] || debouncedSearchQuery,
          state: debouncedSearchQuery.split(',')[1]?.trim() || 'MA',
          phone: '(617) 555-0456',
          website: 'https://lowes.com/toolrental',
          distance: 3.1,
          cost: 3,
          quality: 4,
          options: 4,
          internetRating: 4,
          hasGeneralTools: true,
          hasHeavyEquipment: true,
          isLibrary: false,
          isMakerspace: false,
          isRentalApp: false,
          isRentalCenter: true,
          isRetailer: true,
          type: 'retailer'
        },
        {
          id: 'united-rentals-1',
          name: 'United Rentals',
          address: '789 Industrial Blvd',
          city: debouncedSearchQuery.split(',')[0] || debouncedSearchQuery,
          state: debouncedSearchQuery.split(',')[1]?.trim() || 'MA',
          phone: '(617) 555-0789',
          website: 'https://unitedrentals.com',
          distance: 4.5,
          cost: 4,
          quality: 5,
          options: 5,
          internetRating: 4,
          hasGeneralTools: true,
          hasHeavyEquipment: true,
          isLibrary: false,
          isMakerspace: false,
          isRentalApp: false,
          isRentalCenter: true,
          isRetailer: false,
          type: 'rental_center'
        },
        {
          id: 'library-1',
          name: 'Public Library Tool Library',
          address: '100 Library St',
          city: debouncedSearchQuery.split(',')[0] || debouncedSearchQuery,
          state: debouncedSearchQuery.split(',')[1]?.trim() || 'MA',
          phone: '(617) 555-0100',
          website: 'https://library.org/tools',
          distance: 1.5,
          cost: 1,
          quality: 3,
          options: 3,
          internetRating: 4,
          hasGeneralTools: true,
          hasHeavyEquipment: false,
          isLibrary: true,
          isMakerspace: false,
          isRentalApp: false,
          isRentalCenter: false,
          isRetailer: false,
          type: 'library'
        },
        {
          id: 'makerspace-1',
          name: 'Community Makerspace',
          address: '200 Workshop Way',
          city: debouncedSearchQuery.split(',')[0] || debouncedSearchQuery,
          state: debouncedSearchQuery.split(',')[1]?.trim() || 'MA',
          phone: '(617) 555-0200',
          website: 'https://makerspace.com',
          distance: 6.2,
          cost: 2,
          quality: 4,
          options: 4,
          internetRating: 4,
          hasGeneralTools: true,
          hasHeavyEquipment: false,
          isLibrary: false,
          isMakerspace: true,
          isRentalApp: false,
          isRentalCenter: false,
          isRetailer: false,
          type: 'makerspace'
        }
      ];

      // Filter results based on selected criteria
      const filteredResults = mockResults.filter(center => {
        const withinRadius = center.distance <= parseInt(radius);
        const matchesToolType = (generalTools && center.hasGeneralTools) || 
                               (heavyEquipment && center.hasHeavyEquipment);
        const matchesAccessType = (rentalCenters && center.isRentalCenter) ||
                                 (retailers && center.isRetailer) ||
                                 (libraries && center.isLibrary) ||
                                 (makerspaces && center.isMakerspace) ||
                                 (rentalApps && center.isRentalApp);
        
        return withinRadius && matchesToolType && matchesAccessType;
      }).sort((a, b) => a.distance - b.distance);

      setAccessCenters(filteredResults);
    } catch (error) {
      console.error('Error performing search:', error);
      setAccessCenters([]);
    }
    
    setLoading(false);
  };

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rental_center': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'retailer': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'library': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'makerspace': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'rental_app': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rental_center': return 'Rental Center';
      case 'retailer': return 'Retailer';
      case 'library': return 'Library';
      case 'makerspace': return 'Makerspace';
      case 'rental_app': return 'Rental App';
      default: return 'Tool Access';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tool Access Finder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Location (City, State or ZIP Code)
            </label>
            <Input
              placeholder="e.g., Boston, MA, 02101, or Home Depot"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Distance Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Filter className="h-4 w-4 inline mr-1" />
                Distance
              </label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="15">15 miles</SelectItem>
                  <SelectItem value="20">20 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tool Type Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tool Types</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="general-tools"
                    checked={generalTools}
                    onCheckedChange={(checked) => setGeneralTools(checked === true)}
                  />
                  <label htmlFor="general-tools" className="text-sm">
                    General Tools
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="heavy-equipment"
                    checked={heavyEquipment}
                    onCheckedChange={(checked) => setHeavyEquipment(checked === true)}
                  />
                  <label htmlFor="heavy-equipment" className="text-sm">
                    Heavy Equipment
                  </label>
                </div>
              </div>
            </div>

            {/* Tool Access Type Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tool Access Type</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rental-centers"
                    checked={rentalCenters}
                    onCheckedChange={(checked) => setRentalCenters(checked === true)}
                  />
                  <label htmlFor="rental-centers" className="text-sm">
                    Rental Centers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="retailers"
                    checked={retailers}
                    onCheckedChange={(checked) => setRetailers(checked === true)}
                  />
                  <label htmlFor="retailers" className="text-sm">
                    Retailers
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="libraries"
                    checked={libraries}
                    onCheckedChange={(checked) => setLibraries(checked === true)}
                  />
                  <label htmlFor="libraries" className="text-sm">
                    Libraries
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="makerspaces"
                    checked={makerspaces}
                    onCheckedChange={(checked) => setMakerspaces(checked === true)}
                  />
                  <label htmlFor="makerspaces" className="text-sm">
                    Makerspaces
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rental-apps"
                    checked={rentalApps}
                    onCheckedChange={(checked) => setRentalApps(checked === true)}
                  />
                  <label htmlFor="rental-apps" className="text-sm">
                    Rental Apps
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-muted-foreground">Searching for tool access locations...</p>
          </div>
        )}

        {!loading && hasSearched && accessCenters.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tool access locations found</h3>
              <p className="text-muted-foreground">
                Try expanding your search radius or adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}

        {!loading && accessCenters.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Found {accessCenters.length} tool access location{accessCenters.length !== 1 ? 's' : ''}
              </h3>
              <Badge variant="outline" className="text-xs">
                Within {radius} miles
              </Badge>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {accessCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{center.name}</h4>
                          <Badge className={`text-xs ${getTypeColor(center.type)}`}>
                            {getTypeLabel(center.type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{center.address}, {center.city}, {center.state}</span>
                          <Badge variant="secondary" className="ml-2">
                            {center.distance.toFixed(1)} mi
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Rating Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Cost</div>
                        <div className="flex justify-center">
                          {getStarRating(center.cost)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Quality</div>
                        <div className="flex justify-center">
                          {getStarRating(center.quality)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Options/Scope</div>
                        <div className="flex justify-center">
                          {getStarRating(center.options)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Internet Rating</div>
                        <div className="flex justify-center">
                          {getStarRating(center.internetRating)}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {center.phone && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`tel:${center.phone}`} className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Call
                          </a>
                        </Button>
                      )}
                      {center.website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={center.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Visit Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!hasSearched && !loading && (
          <Card>
            <CardContent className="py-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Find Tool Access Locations</h3>
              <p className="text-muted-foreground">
                Enter a location to search for rental centers, retailers, libraries, makerspaces, and rental apps near you.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}