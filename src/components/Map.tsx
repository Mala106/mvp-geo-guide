import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationData, RouteData, PlaceData } from '../models/MapModel';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface MapProps {
  location?: LocationData;
  places?: PlaceData[];
  route?: RouteData;
  landmarks?: PlaceData[];
  onApiKeyChange?: (key: string) => void;
  apiKey?: string;
}

const Map: React.FC<MapProps> = ({ 
  location, 
  places = [], 
  route, 
  landmarks = [],
  onApiKeyChange,
  apiKey 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [localApiKey, setLocalApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  // Initialize map when API key is available
  useEffect(() => {
    if (!mapContainer.current || (!apiKey && !isApiKeySet)) return;

    const keyToUse = apiKey || localApiKey;
    if (!keyToUse) return;

    // Initialize map
    mapboxgl.accessToken = keyToUse;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 12,
      center: [77.5946, 12.9716], // Bangalore coordinates
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add geolocate control
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [apiKey, isApiKeySet, localApiKey]);

  // Update map center when location changes
  useEffect(() => {
    if (map.current && location) {
      map.current.setCenter([location.lng, location.lat]);
      
      // Add or update user location marker
      const markers = document.querySelectorAll('.user-location-marker');
      markers.forEach(marker => marker.remove());

      new mapboxgl.Marker({
        element: createUserLocationMarker(),
        className: 'user-location-marker'
      })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current);
    }
  }, [location]);

  // Update markers for places and landmarks
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers (except user location)
    const existingMarkers = document.querySelectorAll('.place-marker, .landmark-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add place markers
    places.forEach((place) => {
      new mapboxgl.Marker({
        element: createPlaceMarker(place),
        className: 'place-marker'
      })
        .setLngLat([place.location.lng, place.location.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${place.name}</h3>
            <p class="text-sm text-gray-600">${place.category}</p>
            ${place.rating ? `<p class="text-sm">⭐ ${place.rating}</p>` : ''}
            ${place.isOpen !== undefined ? `<p class="text-sm">${place.isOpen ? '🟢 Open' : '🔴 Closed'}</p>` : ''}
          </div>
        `))
        .addTo(map.current);
    });

    // Add landmark markers
    landmarks.forEach((landmark) => {
      new mapboxgl.Marker({
        element: createLandmarkMarker(landmark),
        className: 'landmark-marker'
      })
        .setLngLat([landmark.location.lng, landmark.location.lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold">${landmark.name}</h3>
            <p class="text-sm text-gray-600">${landmark.category.replace('_', ' ')}</p>
            ${landmark.rating ? `<p class="text-sm">⭐ ${landmark.rating}</p>` : ''}
            ${landmark.amenities ? `<p class="text-sm">📋 ${landmark.amenities.join(', ')}</p>` : ''}
          </div>
        `))
        .addTo(map.current);
    });
  }, [places, landmarks]);

  // Update route
  useEffect(() => {
    if (!map.current || !route) return;

    // Remove existing route
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    // Add route source and layer (simplified - in real app would use actual polyline)
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [
            [route.start.lng, route.start.lat],
            [route.end.lng, route.end.lat]
          ]
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 5,
        'line-opacity': 0.8
      }
    });

    // Add start and end markers
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([route.start.lng, route.start.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><strong>Start</strong></div>'))
      .addTo(map.current);

    new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([route.end.lng, route.end.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<div class="p-2"><strong>Destination</strong></div>'))
      .addTo(map.current);

    // Fit bounds to show entire route
    const bounds = new mapboxgl.LngLatBounds()
      .extend([route.start.lng, route.start.lat])
      .extend([route.end.lng, route.end.lat]);
    
    map.current.fitBounds(bounds, { padding: 50 });
  }, [route]);

  const handleApiKeySubmit = () => {
    if (localApiKey.trim()) {
      setIsApiKeySet(true);
      if (onApiKeyChange) {
        onApiKeyChange(localApiKey);
      }
    }
  };

  const createUserLocationMarker = () => {
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.style.cssText = `
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    `;
    return el;
  };

  const createPlaceMarker = (place: PlaceData) => {
    const el = document.createElement('div');
    el.className = 'place-marker';
    el.style.cssText = `
      width: 30px;
      height: 30px;
      background: #ef4444;
      border-radius: 50%;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: white;
      font-weight: bold;
    `;
    el.innerHTML = '📍';
    return el;
  };

  const createLandmarkMarker = (landmark: PlaceData) => {
    const el = document.createElement('div');
    el.className = 'landmark-marker';
    
    const categoryIcons = {
      gas_station: '⛽',
      atm: '🏧',
      restaurant: '🍽️',
      hotel: '🏨',
      hospital: '🏥',
      pharmacy: '💊',
      shopping: '🛒',
      tourist_attraction: '📸',
      parking: '🅿️'
    };
    
    el.style.cssText = `
      width: 28px;
      height: 28px;
      background: #8b5cf6;
      border-radius: 50%;
      border: 2px solid white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    `;
    el.innerHTML = categoryIcons[landmark.category] || '📍';
    return el;
  };

  if (!apiKey && !isApiKeySet) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/20">
        <div className="text-center p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-4">Mapbox API Key Required</h3>
          <p className="text-muted-foreground mb-4">
            Please enter your Mapbox public token to view the map.
            Get yours at{' '}
            <a 
              href="https://mapbox.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              mapbox.com
            </a>
          </p>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="pk.eyJ1Ijoic..."
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
            />
            <Button onClick={handleApiKeySubmit}>
              Set Key
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;