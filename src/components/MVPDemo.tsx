import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Search, Navigation, Clock, Users, Database, Eye, Zap } from 'lucide-react';
import { MapPresenter, MapViewInterface } from '../presenters/MapPresenter';
import { LocationData, PlaceData, RouteData } from '../models/MapModel';

const MVPDemo = () => {
  const [presenter] = useState(() => new MapPresenter());
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trafficInfo, setTrafficInfo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLayer, setActiveLayer] = useState<'model' | 'presenter' | 'view'>('view');

  // Implement the View interface
  const viewInterface: MapViewInterface = {
    showLocation: (location: LocationData) => {
      setCurrentLocation(location);
    },
    showPlaces: (placesData: PlaceData[]) => {
      setPlaces(placesData);
    },
    showRoute: (routeData: RouteData) => {
      setRoute(routeData);
    },
    showLoading: (loading: boolean) => {
      setIsLoading(loading);
    },
    showError: (message: string) => {
      setError(message);
    },
    updateTrafficInfo: (info: string) => {
      setTrafficInfo(info);
    }
  };

  useEffect(() => {
    presenter.attachView(viewInterface);
    presenter.initializeMap();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      presenter.handleSearch(searchQuery);
    }
  };

  const handleGetDirections = (place: PlaceData) => {
    presenter.handleGetDirections(place.location);
  };

  const layers = [
    {
      id: 'model',
      name: 'Model',
      color: 'mvp.model',
      icon: Database,
      description: 'Data Layer - APIs, GPS, Business Logic'
    },
    {
      id: 'presenter',
      name: 'Presenter',
      color: 'mvp.presenter',
      icon: Zap,
      description: 'Coordination Layer - Formats & Routes Data'
    },
    {
      id: 'view',
      name: 'View',
      color: 'mvp.view',
      icon: Eye,
      description: 'UI Layer - What User Sees & Interacts With'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-hero text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-fadeInUp">
            <h1 className="text-5xl font-bold mb-4">MVP Architecture Demo</h1>
            <p className="text-xl mb-8 text-white/90">
              Explore Model-View-Presenter pattern with a Google Maps-style app
            </p>
            <div className="gradient-mvp p-1 rounded-full inline-block mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                <span className="text-white font-semibold">Interactive Demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Architecture Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <Card 
                key={layer.id}
                className={`transition-smooth cursor-pointer hover:shadow-elegant transform hover:-translate-y-1 ${
                  activeLayer === layer.id ? 'ring-2 ring-primary shadow-card' : ''
                }`}
                onClick={() => setActiveLayer(layer.id as any)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-${layer.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{layer.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground">{layer.description}</p>
                  <Badge variant="secondary" className="mt-3">
                    Layer {index + 1}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interactive Demo */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Map Interface (View Layer) */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-mvp-view" />
                View Layer - Map Interface
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Bar */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search for places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Location */}
              {currentLocation && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Current Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentLocation.address || `${currentLocation.lat}, ${currentLocation.lng}`}
                  </p>
                  {trafficInfo && (
                    <Badge variant="outline" className="mt-2">
                      {trafficInfo}
                    </Badge>
                  )}
                </div>
              )}

              {/* Places Results */}
              {places.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Search Results
                  </h4>
                  {places.map((place) => (
                    <div key={place.id} className="bg-muted p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{place.name}</p>
                        <p className="text-sm text-muted-foreground">{place.category}</p>
                        {place.rating && (
                          <Badge variant="secondary" className="mt-1">
                            ⭐ {place.rating}
                          </Badge>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleGetDirections(place)}
                        disabled={isLoading}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Route Information */}
              {route && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Route Information</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Distance</p>
                      <p className="font-medium">{route.distance}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{route.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={route.trafficLevel === 'heavy' ? 'destructive' : 'secondary'}
                    className="mt-2"
                  >
                    {route.trafficLevel} traffic
                  </Badge>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  <p className="mt-2 text-muted-foreground">Loading...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                  <p className="text-destructive">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Architecture Explanation */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                How MVP Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="border-l-4 border-mvp-model pl-4">
                  <h4 className="font-semibold text-mvp-model">Model Layer</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Handles all data operations: GPS location, Google Maps API calls, 
                    traffic data, and place searches. Pure business logic with no UI concerns.
                  </p>
                </div>

                <div className="border-l-4 border-mvp-presenter pl-4">
                  <h4 className="font-semibold text-mvp-presenter">Presenter Layer</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coordinates between Model and View. Formats data, handles user actions,
                    manages state, and tells the View what to display.
                  </p>
                </div>

                <div className="border-l-4 border-mvp-view pl-4">
                  <h4 className="font-semibold text-mvp-view">View Layer</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pure UI components. Displays data and captures user input. 
                    No business logic - just presentation and user interaction.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Data Flow Example:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-mvp-view rounded-full"></div>
                    <span>User types "coffee" in search</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-2 h-2 bg-mvp-presenter rounded-full"></div>
                    <span>Presenter receives search request</span>
                  </div>
                  <div className="flex items-center gap-2 ml-8">
                    <div className="w-2 h-2 bg-mvp-model rounded-full"></div>
                    <span>Model fetches coffee shops from API</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-2 h-2 bg-mvp-presenter rounded-full"></div>
                    <span>Presenter formats results for display</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-mvp-view rounded-full"></div>
                    <span>View displays formatted coffee shop list</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MVPDemo;