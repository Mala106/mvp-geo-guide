// MODEL LAYER - Responsible for data fetching and business logic
// Contains: API calls, data processing, storage logic

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteData {
  start: LocationData;
  end: LocationData;
  polyline: string;
  distance: string;
  duration: string;
  trafficLevel: 'light' | 'moderate' | 'heavy';
}

export interface PlaceData {
  id: string;
  name: string;
  category: string;
  location: LocationData;
  rating?: number;
  isOpen?: boolean;
}

// Simulated data - In real app, this would be actual API calls
export class MapModel {
  private apiKey: string | null = null;

  constructor() {
    // In real app, this would be environment variable
    this.apiKey = 'demo-key';
  }

  // Simulate fetching user's current location
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          lat: 12.9716,
          lng: 77.5946,
          address: 'Bangalore, Karnataka, India'
        });
      }, 500);
    });
  }

  // Simulate searching for places
  async searchPlaces(query: string, location: LocationData): Promise<PlaceData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPlaces: PlaceData[] = [
          {
            id: '1',
            name: `${query} Central`,
            category: 'Restaurant',
            location: { lat: location.lat + 0.01, lng: location.lng + 0.01 },
            rating: 4.5,
            isOpen: true
          },
          {
            id: '2',
            name: `Best ${query} Place`,
            category: 'Restaurant',
            location: { lat: location.lat - 0.01, lng: location.lng + 0.01 },
            rating: 4.2,
            isOpen: false
          },
          {
            id: '3',
            name: `${query} Express`,
            category: 'Restaurant',
            location: { lat: location.lat + 0.01, lng: location.lng - 0.01 },
            rating: 4.8,
            isOpen: true
          }
        ];
        resolve(mockPlaces);
      }, 800);
    });
  }

  // Simulate getting route between two points
  async getRoute(start: LocationData, end: LocationData): Promise<RouteData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const route: RouteData = {
          start,
          end,
          polyline: 'mock_polyline_data',
          distance: '12.5 km',
          duration: '25 min',
          trafficLevel: Math.random() > 0.5 ? 'moderate' : 'light'
        };
        resolve(route);
      }, 1000);
    });
  }

  // Simulate getting live traffic data
  async getTrafficData(location: LocationData): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const trafficLevels = ['Light traffic', 'Moderate traffic', 'Heavy traffic'];
        const randomTraffic = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
        resolve(randomTraffic);
      }, 600);
    });
  }

  // Simulate getting map tile data
  async getMapTiles(bounds: any): Promise<string[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['tile1.png', 'tile2.png', 'tile3.png']);
      }, 300);
    });
  }
}