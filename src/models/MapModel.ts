// MODEL LAYER - Responsible for data fetching and business logic
// Contains: API calls, data processing, storage logic

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  heading?: number;
  speed?: number;
  accuracy?: number;
}

export interface RouteData {
  start: LocationData;
  end: LocationData;
  polyline: string;
  distance: string;
  duration: string;
  trafficLevel: 'light' | 'moderate' | 'heavy';
  steps: RouteStep[];
  alternativeRoutes?: RouteData[];
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
  maneuver: string;
}

export interface PlaceData {
  id: string;
  name: string;
  category: LandmarkCategory;
  location: LocationData;
  rating?: number;
  isOpen?: boolean;
  price?: string;
  phone?: string;
  hours?: string;
  description?: string;
  amenities?: string[];
}

export type LandmarkCategory = 
  | 'gas_station' 
  | 'atm' 
  | 'restaurant' 
  | 'hotel' 
  | 'hospital' 
  | 'pharmacy' 
  | 'shopping' 
  | 'tourist_attraction'
  | 'parking';

export class MapModel {
  private apiKey: string | null = null;
  private liveTrackingActive: boolean = false;
  private trackingCallback: ((location: LocationData) => void) | null = null;

  constructor() {
    this.apiKey = 'demo-key';
  }

  // Get user's current location
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          lat: 12.9716,
          lng: 77.5946,
          address: 'Bangalore, Karnataka, India',
          heading: Math.random() * 360,
          speed: Math.random() * 60,
          accuracy: 5 + Math.random() * 10
        });
      }, 500);
    });
  }

  // Start live location tracking
  startLiveTracking(callback: (location: LocationData) => void) {
    this.liveTrackingActive = true;
    this.trackingCallback = callback;
    
    // Simulate GPS updates every 3 seconds
    const updateLocation = () => {
      if (!this.liveTrackingActive) return;
      
      this.getCurrentLocation().then(location => {
        // Add slight variations to simulate movement
        const newLocation: LocationData = {
          ...location,
          lat: location.lat + (Math.random() - 0.5) * 0.001,
          lng: location.lng + (Math.random() - 0.5) * 0.001,
          heading: (location.heading || 0) + (Math.random() - 0.5) * 30,
          speed: Math.max(0, (location.speed || 0) + (Math.random() - 0.5) * 10)
        };
        
        if (this.trackingCallback) {
          this.trackingCallback(newLocation);
        }
      });
      
      if (this.liveTrackingActive) {
        setTimeout(updateLocation, 3000);
      }
    };
    
    updateLocation();
  }

  // Stop live location tracking
  stopLiveTracking() {
    this.liveTrackingActive = false;
    this.trackingCallback = null;
  }

  // Search for places
  async searchPlaces(query: string, location: LocationData): Promise<PlaceData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockPlaces: PlaceData[] = [
          {
            id: '1',
            name: `${query} Central`,
            category: 'restaurant',
            location: { lat: location.lat + 0.01, lng: location.lng + 0.01 },
            rating: 4.5,
            isOpen: true,
            price: '₹₹',
            phone: '+91 80 1234 5678',
            hours: '9:00 AM - 10:00 PM'
          },
          {
            id: '2',
            name: `Best ${query} Place`,
            category: 'restaurant',
            location: { lat: location.lat - 0.01, lng: location.lng + 0.01 },
            rating: 4.2,
            isOpen: false,
            price: '₹₹₹',
            hours: 'Closed - Opens at 11:00 AM'
          },
          {
            id: '3',
            name: `${query} Express`,
            category: 'restaurant',
            location: { lat: location.lat + 0.01, lng: location.lng - 0.01 },
            rating: 4.8,
            isOpen: true,
            price: '₹',
            phone: '+91 80 9876 5432',
            hours: '24 hours'
          }
        ];
        resolve(mockPlaces);
      }, 800);
    });
  }

  // Get landmarks by category
  async getLandmarksByCategory(category: LandmarkCategory, location: LocationData): Promise<PlaceData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const landmarks = this.generateMockLandmarks(category, location);
        resolve(landmarks);
      }, 600);
    });
  }

  private generateMockLandmarks(category: LandmarkCategory, center: LocationData): PlaceData[] {
    const categoryData = {
      gas_station: {
        names: ['Shell', 'HP Petrol Pump', 'BPCL', 'IOCL', 'Reliance Petrol'],
        amenities: ['Fuel', 'ATM', 'Car Wash', 'Air Fill']
      },
      atm: {
        names: ['SBI ATM', 'HDFC Bank ATM', 'ICICI ATM', 'Axis Bank ATM', 'Kotak ATM'],
        amenities: ['24/7', 'Cash Deposit', 'Balance Inquiry']
      },
      restaurant: {
        names: ['Coastal Kitchen', 'Spice Garden', 'Urban Bites', 'Food Court', 'Cafe Mocha'],
        amenities: ['Dine-in', 'Takeaway', 'Home Delivery', 'AC']
      },
      hotel: {
        names: ['Grand Palace', 'City Inn', 'Budget Stay', 'Luxury Suites', 'Comfort Lodge'],
        amenities: ['WiFi', 'Parking', 'Restaurant', 'Room Service']
      },
      hospital: {
        names: ['City Hospital', 'Care Medical', 'Health Plus', 'Emergency Center', 'Clinic'],
        amenities: ['Emergency', '24/7', 'Pharmacy', 'Ambulance']
      }
    };

    const data = categoryData[category] || categoryData.restaurant;
    
    return data.names.map((name, index) => ({
      id: `${category}_${index}`,
      name,
      category,
      location: {
        lat: center.lat + (Math.random() - 0.5) * 0.02,
        lng: center.lng + (Math.random() - 0.5) * 0.02
      },
      rating: 3.5 + Math.random() * 1.5,
      isOpen: Math.random() > 0.2,
      price: ['₹', '₹₹', '₹₹₹'][Math.floor(Math.random() * 3)],
      amenities: data.amenities.slice(0, 2 + Math.floor(Math.random() * 2))
    }));
  }

  // Get route between two points
  async getRoute(start: LocationData, end: LocationData): Promise<RouteData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const steps: RouteStep[] = [
          {
            instruction: 'Head northeast on MG Road',
            distance: '1.2 km',
            duration: '3 min',
            maneuver: 'straight'
          },
          {
            instruction: 'Turn right onto Brigade Road',
            distance: '2.8 km',
            duration: '7 min',
            maneuver: 'turn-right'
          },
          {
            instruction: 'Continue straight to destination',
            distance: '8.5 km',
            duration: '15 min',
            maneuver: 'straight'
          }
        ];

        const route: RouteData = {
          start,
          end,
          polyline: 'mock_polyline_data',
          distance: '12.5 km',
          duration: '25 min',
          trafficLevel: Math.random() > 0.5 ? 'moderate' : 'light',
          steps
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