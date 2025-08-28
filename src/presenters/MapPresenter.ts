// PRESENTER LAYER - Coordinates between Model and View
// Contains: Business logic, data formatting, state management

import { MapModel, LocationData, PlaceData, RouteData, LandmarkCategory } from '../models/MapModel';

export interface MapViewInterface {
  showLocation(location: LocationData): void;
  showPlaces(places: PlaceData[]): void;
  showRoute(route: RouteData): void;
  showLoading(isLoading: boolean): void;
  showError(message: string): void;
  updateTrafficInfo(info: string): void;
  showLandmarks(landmarks: PlaceData[]): void;
  updateLiveLocation(location: LocationData): void;
  showNavigationStarted(): void;
  showNavigationStopped(): void;
}

export class MapPresenter {
  private model: MapModel;
  private view: MapViewInterface | null = null;
  private currentLocation: LocationData | null = null;
  private isNavigating: boolean = false;
  private currentRoute: RouteData | null = null;

  constructor() {
    this.model = new MapModel();
  }

  // Attach the view to this presenter
  attachView(view: MapViewInterface) {
    this.view = view;
  }

  // Initialize the map with user's current location
  async initializeMap() {
    if (!this.view) return;

    try {
      this.view.showLoading(true);
      
      // Get current location from model
      const location = await this.model.getCurrentLocation();
      this.currentLocation = location;
      
      // Tell view to display the location
      this.view.showLocation(location);
      
      // Get and display traffic info
      const trafficInfo = await this.model.getTrafficData(location);
      this.view.updateTrafficInfo(trafficInfo);
      
      this.view.showLoading(false);
    } catch (error) {
      this.view.showError('Failed to load location');
      this.view.showLoading(false);
    }
  }

  // Handle search request from view
  async handleSearch(query: string) {
    if (!this.view || !this.currentLocation) return;

    try {
      this.view.showLoading(true);
      
      // Ask model to search for places
      const places = await this.model.searchPlaces(query, this.currentLocation);
      
      // Format and send results to view
      this.view.showPlaces(places);
      this.view.showLoading(false);
    } catch (error) {
      this.view.showError('Search failed');
      this.view.showLoading(false);
    }
  }

  // Handle route request from view
  async handleGetDirections(destination: LocationData) {
    if (!this.view || !this.currentLocation) return;

    try {
      this.view.showLoading(true);
      
      // Ask model to calculate route
      const route = await this.model.getRoute(this.currentLocation, destination);
      
      // Send route data to view
      this.view.showRoute(route);
      this.view.showLoading(false);
    } catch (error) {
      this.view.showError('Failed to get directions');
      this.view.showLoading(false);
    }
  }

  // Update location when user moves (GPS updates)
  async handleLocationUpdate(newLocation: LocationData) {
    this.currentLocation = newLocation;
    
    if (this.view) {
      this.view.showLocation(newLocation);
      
      // Update traffic info for new location
      try {
        const trafficInfo = await this.model.getTrafficData(newLocation);
        this.view.updateTrafficInfo(trafficInfo);
      } catch (error) {
        console.error('Failed to update traffic info');
      }
    }
  }

  // Format places data for display
  private formatPlacesForDisplay(places: PlaceData[]): PlaceData[] {
    return places.map(place => ({
      ...place,
      name: place.name.length > 25 ? place.name.substring(0, 25) + '...' : place.name
    }));
  }

  // Start live location tracking
  startLiveTracking() {
    this.model.startLiveTracking((location) => {
      this.currentLocation = location;
      if (this.view) {
        this.view.updateLiveLocation(location);
      }
    });
  }

  // Stop live location tracking
  stopLiveTracking() {
    this.model.stopLiveTracking();
  }

  // Get landmarks by category
  async handleLandmarkSearch(category: LandmarkCategory) {
    if (!this.view || !this.currentLocation) return;

    try {
      this.view.showLoading(true);
      const landmarks = await this.model.getLandmarksByCategory(category, this.currentLocation);
      this.view.showLandmarks(landmarks);
      this.view.showLoading(false);
    } catch (error) {
      this.view.showError('Failed to load landmarks');
      this.view.showLoading(false);
    }
  }

  // Start navigation
  async startNavigation(destination: LocationData) {
    if (!this.view || !this.currentLocation) return;

    try {
      this.view.showLoading(true);
      const route = await this.model.getRoute(this.currentLocation, destination);
      this.currentRoute = route;
      this.isNavigating = true;
      
      this.view.showRoute(route);
      this.view.showNavigationStarted();
      this.startLiveTracking();
      this.view.showLoading(false);
    } catch (error) {
      this.view.showError('Failed to start navigation');
      this.view.showLoading(false);
    }
  }

  // Stop navigation
  stopNavigation() {
    this.isNavigating = false;
    this.currentRoute = null;
    this.stopLiveTracking();
    
    if (this.view) {
      this.view.showNavigationStopped();
    }
  }

  // Get current navigation status
  getNavigationStatus() {
    return {
      isNavigating: this.isNavigating,
      route: this.currentRoute
    };
  }

  // Calculate display bounds for route
  private calculateDisplayBounds(route: RouteData) {
    return {
      north: Math.max(route.start.lat, route.end.lat) + 0.01,
      south: Math.min(route.start.lat, route.end.lat) - 0.01,
      east: Math.max(route.start.lng, route.end.lng) + 0.01,
      west: Math.min(route.start.lng, route.end.lng) - 0.01
    };
  }
}