import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Clock, 
  Compass,
  Play,
  Square,
  Fuel,
  CreditCard,
  UtensilsCrossed,
  Bed,
  Cross,
  ShoppingBag,
  Camera,
  Car
} from 'lucide-react';
import { MapPresenter, MapViewInterface } from '../presenters/MapPresenter';
import { LocationData, PlaceData, RouteData, LandmarkCategory } from '../models/MapModel';
import Map from './Map';

const MapApp = () => {
  const [presenter] = useState(() => new MapPresenter());
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [places, setPlaces] = useState<PlaceData[]>([]);
  const [landmarks, setLandmarks] = useState<PlaceData[]>([]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trafficInfo, setTrafficInfo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const [mapboxKey, setMapboxKey] = useState<string>('');

  // Implement the View interface
  const viewInterface: MapViewInterface = {
    showLocation: (location: LocationData) => {
      setCurrentLocation(location);
    },
    showPlaces: (placesData: PlaceData[]) => {
      setPlaces(placesData);
    },
    showLandmarks: (landmarksData: PlaceData[]) => {
      setLandmarks(landmarksData);
    },
    showRoute: (routeData: RouteData) => {
      setRoute(routeData);
    },
    showLoading: (loading: boolean) => {
      setIsLoading(loading);
    },
    showError: (message: string) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    },
    updateTrafficInfo: (info: string) => {
      setTrafficInfo(info);
    },
    updateLiveLocation: (location: LocationData) => {
      setCurrentLocation(location);
    },
    showNavigationStarted: () => {
      setIsNavigating(true);
    },
    showNavigationStopped: () => {
      setIsNavigating(false);
      setRoute(null);
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
    presenter.startNavigation(place.location);
  };

  const handleStopNavigation = () => {
    presenter.stopNavigation();
  };

  const handleLandmarkCategory = (category: LandmarkCategory) => {
    presenter.handleLandmarkSearch(category);
  };

  const landmarkCategories = [
    { id: 'gas_station' as LandmarkCategory, name: 'Gas', icon: Fuel, color: 'bg-orange-500' },
    { id: 'atm' as LandmarkCategory, name: 'ATM', icon: CreditCard, color: 'bg-green-500' },
    { id: 'restaurant' as LandmarkCategory, name: 'Food', icon: UtensilsCrossed, color: 'bg-red-500' },
    { id: 'hotel' as LandmarkCategory, name: 'Hotels', icon: Bed, color: 'bg-blue-500' },
    { id: 'hospital' as LandmarkCategory, name: 'Medical', icon: Cross, color: 'bg-red-600' },
    { id: 'shopping' as LandmarkCategory, name: 'Shopping', icon: ShoppingBag, color: 'bg-purple-500' },
    { id: 'tourist_attraction' as LandmarkCategory, name: 'Attractions', icon: Camera, color: 'bg-pink-500' },
    { id: 'parking' as LandmarkCategory, name: 'Parking', icon: Car, color: 'bg-gray-500' }
  ];

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">GeoGuide</h1>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading} size="sm">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            {isNavigating ? (
              <Button onClick={handleStopNavigation} variant="destructive" size="sm">
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            ) : (
              <Button disabled size="sm" variant="outline">
                <Play className="w-4 h-4 mr-1" />
                Navigate
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r flex flex-col overflow-hidden">
          {/* Current Location */}
          {currentLocation && (
            <Card className="m-4 mb-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-semibold">Current Location</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {currentLocation.address || `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}
                </p>
                <div className="flex gap-2 text-xs">
                  {currentLocation.speed !== undefined && (
                    <Badge variant="outline">
                      {currentLocation.speed.toFixed(0)} km/h
                    </Badge>
                  )}
                  {currentLocation.heading !== undefined && (
                    <Badge variant="outline">
                      {currentLocation.heading.toFixed(0)}°
                    </Badge>
                  )}
                  {trafficInfo && (
                    <Badge variant="secondary">
                      {trafficInfo}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Landmark Categories */}
          <div className="p-4 pt-2">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Nearby
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {landmarkCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleLandmarkCategory(category.id)}
                    className="flex items-center gap-2 justify-start"
                  >
                    <div className={`w-4 h-4 rounded-full ${category.color} flex items-center justify-center`}>
                      <Icon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs">{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Route Information */}
          {route && (
            <div className="p-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Active Route</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-medium">{route.distance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{route.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Badge 
                    variant={route.trafficLevel === 'heavy' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {route.trafficLevel} traffic
                  </Badge>
                  
                  {/* Turn-by-turn directions */}
                  {route.steps && route.steps.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium mb-2">Next steps:</p>
                      <div className="space-y-1">
                        {route.steps.slice(0, 3).map((step, index) => (
                          <div key={index} className="text-xs text-muted-foreground">
                            <span className="font-medium">{step.instruction}</span>
                            <span className="ml-2">({step.distance})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            {/* Search Results */}
            {places.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Search Results</h3>
                <div className="space-y-2">
                  {places.map((place) => (
                    <Card key={place.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{place.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {place.category.replace('_', ' ')}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleGetDirections(place)}
                            disabled={isLoading}
                          >
                            <Navigation className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {place.rating && (
                            <Badge variant="secondary">
                              ⭐ {place.rating.toFixed(1)}
                            </Badge>
                          )}
                          {place.price && (
                            <Badge variant="outline">
                              {place.price}
                            </Badge>
                          )}
                          <Badge variant={place.isOpen ? 'default' : 'destructive'}>
                            {place.isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                        {place.hours && (
                          <p className="text-xs text-muted-foreground mt-1">{place.hours}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Landmarks */}
            {landmarks.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Nearby Landmarks</h3>
                <div className="space-y-2">
                  {landmarks.map((landmark) => (
                    <Card key={landmark.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">{landmark.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {landmark.category.replace('_', ' ')}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleGetDirections(landmark)}
                            disabled={isLoading}
                          >
                            <Navigation className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {landmark.rating && (
                            <Badge variant="secondary">
                              ⭐ {landmark.rating.toFixed(1)}
                            </Badge>
                          )}
                          <Badge variant={landmark.isOpen ? 'default' : 'destructive'}>
                            {landmark.isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        </div>
                        {landmark.amenities && landmark.amenities.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {landmark.amenities.join(' • ')}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <Map 
            location={currentLocation || undefined}
            places={places}
            landmarks={landmarks}
            route={route || undefined}
            onApiKeyChange={setMapboxKey}
            apiKey={mapboxKey}
          />
          
          {/* Error Toast */}
          {error && (
            <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-lg z-10">
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapApp;