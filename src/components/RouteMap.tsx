import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Bus, Clock, Users, Route, X, Maximize2, Minimize2, Layers, Satellite, Map as MapIcon } from 'lucide-react';
import { BusSchedule } from '../types/BusSchedule';

interface RouteMapProps {
  schedule?: BusSchedule;
  schedules?: BusSchedule[];
  isFullscreen?: boolean;
  onClose?: () => void;
}

// Define route coordinates for IIUC bus routes
const routeCoordinates: Record<string, google.maps.LatLngLiteral[]> = {
  // BOT to IIUC route
  'BOT': [
    { lat: 22.3569, lng: 91.7832 }, // BOT (Bahaddarhat)
    { lat: 22.3612, lng: 91.7891 }, // Muradpur
    { lat: 22.3698, lng: 91.7945 }, // 2 no gate
    { lat: 22.3756, lng: 91.8012 }, // Baizid Link Road
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ],
  
  // Agrabad to IIUC route
  'Agrabad': [
    { lat: 22.3255, lng: 91.8317 }, // Agrabad
    { lat: 22.3298, lng: 91.8245 }, // Boropool
    { lat: 22.3456, lng: 91.8123 }, // Noyabazar
    { lat: 22.3789, lng: 91.8034 }, // AK Khan
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ],
  
  // Chatteswari to IIUC route
  'Chatteswari': [
    { lat: 22.3445, lng: 91.7823 }, // Chatteswari Road
    { lat: 22.3512, lng: 91.7934 }, // GEC
    { lat: 22.3698, lng: 91.7945 }, // 2 no gate
    { lat: 22.3756, lng: 91.8012 }, // Baizid Link Road
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ],
  
  // Baroyarhat to IIUC route
  'Baroyarhat': [
    { lat: 22.2845, lng: 91.8234 }, // Baroyarhat
    { lat: 22.3123, lng: 91.8456 }, // Mirsharai
    { lat: 22.3456, lng: 91.8789 }, // Borodargahat
    { lat: 22.3789, lng: 91.9123 }, // Sitakunda
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ],
  
  // Hathazari to IIUC route
  'Hathazari': [
    { lat: 22.2567, lng: 91.8123 }, // Hathazari College
    { lat: 22.2789, lng: 91.8234 }, // Borodighirpar
    { lat: 22.3456, lng: 91.8345 }, // Baizid Link Road
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ],
  
  // CUET to IIUC route
  'CUET': [
    { lat: 22.4623, lng: 91.9697 }, // CUET Gate
    { lat: 22.4589, lng: 91.9756 }, // Kuwaish
    { lat: 22.4567, lng: 91.9823 }, // Oxygen
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ]
};

// IIUC location
const IIUC_LOCATION = { lat: 22.4569, lng: 91.9859 };

const RouteMap: React.FC<RouteMapProps> = ({ 
  schedule, 
  schedules = [], 
  isFullscreen = false, 
  onClose 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routePolylines, setRoutePolylines] = useState<google.maps.Polyline[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        // Fallback to OpenStreetMap or show error message
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: IIUC_LOCATION,
      zoom: 11,
      mapTypeId: mapType,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'simplified' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_BOTTOM
      }
    });

    mapInstanceRef.current = map;

    // Add IIUC marker
    const iiucMarker = new google.maps.Marker({
      position: IIUC_LOCATION,
      map: map,
      title: 'International Islamic University Chittagong (IIUC)',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#1e40af" stroke="#ffffff" stroke-width="3"/>
            <circle cx="20" cy="20" r="12" fill="#3b82f6"/>
            <text x="20" y="25" text-anchor="middle" fill="white" font-size="10" font-weight="bold">IIUC</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      }
    });

    setMarkers([iiucMarker]);

    return () => {
      // Cleanup markers and polylines
      markers.forEach(marker => marker.setMap(null));
      routePolylines.forEach(polyline => polyline.setMap(null));
    };
  }, [isLoaded, mapType]);

  // Draw routes based on schedule or schedules
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // Clear existing polylines
    routePolylines.forEach(polyline => polyline.setMap(null));
    setRoutePolylines([]);

    const newPolylines: google.maps.Polyline[] = [];
    const routesToDraw = schedule ? [schedule] : schedules;

    routesToDraw.forEach((busSchedule, index) => {
      const routeKey = getRouteKey(busSchedule.startingPoint);
      const coordinates = routeCoordinates[routeKey];

      if (coordinates) {
        const polyline = new google.maps.Polyline({
          path: coordinates,
          geodesic: true,
          strokeColor: getRouteColor(busSchedule, index),
          strokeOpacity: 1.0,
          strokeWeight: 4,
          map: mapInstanceRef.current
        });

        // Add click listener to polyline
        polyline.addListener('click', () => {
          setSelectedRoute(busSchedule.id);
          showRouteInfo(busSchedule);
        });

        newPolylines.push(polyline);

        // Add starting point marker
        const startMarker = new google.maps.Marker({
          position: coordinates[0],
          map: mapInstanceRef.current,
          title: `${busSchedule.startingPoint} - ${busSchedule.time}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="12" fill="${getRouteColor(busSchedule, index)}" stroke="#ffffff" stroke-width="2"/>
                <circle cx="15" cy="15" r="6" fill="#ffffff"/>
                <text x="15" y="18" text-anchor="middle" fill="${getRouteColor(busSchedule, index)}" font-size="8" font-weight="bold">BUS</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(30, 30),
            anchor: new google.maps.Point(15, 15)
          }
        });

        // Add info window to marker
        const infoWindow = new google.maps.InfoWindow({
          content: createInfoWindowContent(busSchedule)
        });

        startMarker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, startMarker);
        });

        newPolylines.push(polyline);
      }
    });

    setRoutePolylines(newPolylines);

    // Fit map to show all routes
    if (newPolylines.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      routesToDraw.forEach(busSchedule => {
        const routeKey = getRouteKey(busSchedule.startingPoint);
        const coordinates = routeCoordinates[routeKey];
        if (coordinates) {
          coordinates.forEach(coord => bounds.extend(coord));
        }
      });
      mapInstanceRef.current?.fitBounds(bounds);
    }
  }, [schedule, schedules, isLoaded]);

  const getRouteKey = (startingPoint: string): string => {
    const point = startingPoint.toLowerCase();
    if (point.includes('bot') || point.includes('bahaddarhat')) return 'BOT';
    if (point.includes('agrabad')) return 'Agrabad';
    if (point.includes('chatteswari')) return 'Chatteswari';
    if (point.includes('baroyarhat')) return 'Baroyarhat';
    if (point.includes('hathazari')) return 'Hathazari';
    if (point.includes('cuet')) return 'CUET';
    return 'BOT'; // Default fallback
  };

  const getRouteColor = (busSchedule: BusSchedule, index: number): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    
    if (busSchedule.gender === 'Female') return '#ec4899'; // Pink for female
    if (busSchedule.gender === 'Male') return '#3b82f6'; // Blue for male
    if (busSchedule.scheduleType === 'Friday') return '#f59e0b'; // Orange for Friday
    
    return colors[index % colors.length];
  };

  const createInfoWindowContent = (busSchedule: BusSchedule): string => {
    return `
      <div style="padding: 12px; min-width: 250px; font-family: system-ui;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="width: 12px; height: 12px; background: ${getRouteColor(busSchedule, 0)}; border-radius: 50%; margin-right: 8px;"></div>
          <h3 style="margin: 0; font-size: 16px; font-weight: bold; color: #1f2937;">${busSchedule.time}</h3>
        </div>
        <p style="margin: 4px 0; color: #4b5563; font-size: 14px;">
          <strong>Route:</strong> ${busSchedule.startingPoint} → ${busSchedule.endPoint}
        </p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">${busSchedule.route}</p>
        ${busSchedule.gender ? `<span style="background: ${busSchedule.gender === 'Female' ? '#fce7f3' : '#dbeafe'}; color: ${busSchedule.gender === 'Female' ? '#be185d' : '#1d4ed8'}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">${busSchedule.gender}</span>` : ''}
        ${busSchedule.scheduleType ? `<span style="background: ${busSchedule.scheduleType === 'Friday' ? '#fef3c7' : '#e0e7ff'}; color: ${busSchedule.scheduleType === 'Friday' ? '#92400e' : '#3730a3'}; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500; margin-left: 4px;">${busSchedule.scheduleType}</span>` : ''}
      </div>
    `;
  };

  const showRouteInfo = (busSchedule: BusSchedule) => {
    // You can implement a custom info panel here
    console.log('Selected route:', busSchedule);
  };

  const toggleMapType = () => {
    setMapType(prev => prev === 'roadmap' ? 'satellite' : 'roadmap');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(mapType === 'roadmap' ? 'satellite' : 'roadmap');
    }
  };

  const toggleTraffic = () => {
    if (!mapInstanceRef.current) return;
    
    setShowTraffic(prev => {
      const newShowTraffic = !prev;
      const trafficLayer = new google.maps.TrafficLayer();
      
      if (newShowTraffic) {
        trafficLayer.setMap(mapInstanceRef.current);
      } else {
        trafficLayer.setMap(null);
      }
      
      return newShowTraffic;
    });
  };

  if (!isLoaded) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-96'} bg-gray-100 rounded-2xl flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Interactive Map...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing bus routes visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'relative w-full h-96'} rounded-2xl overflow-hidden shadow-xl border border-gray-200`}>
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2">
          <div className="flex space-x-2">
            <button
              onClick={toggleMapType}
              className={`p-2 rounded-lg transition-all duration-200 ${
                mapType === 'satellite' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={mapType === 'roadmap' ? 'Switch to Satellite' : 'Switch to Map'}
            >
              {mapType === 'roadmap' ? <Satellite className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
            </button>
            
            <button
              onClick={toggleTraffic}
              className={`p-2 rounded-lg transition-all duration-200 ${
                showTraffic 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Traffic"
            >
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Close Button (for fullscreen) */}
      {isFullscreen && onClose && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-3 text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Route className="h-4 w-4 text-blue-500" />
          <span>Route Legend</span>
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span className="text-gray-700">Female Routes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Male Routes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Friday Special</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-gray-700">IIUC Campus</span>
          </div>
        </div>
      </div>

      {/* Route Info Panel */}
      {schedule && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{schedule.time}</h3>
              <p className="text-sm text-gray-600">{schedule.scheduleType} Schedule</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">{schedule.startingPoint}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-blue-500" />
              <span className="text-gray-700">{schedule.endPoint}</span>
            </div>
            {schedule.gender && (
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-gray-700">{schedule.gender} Only</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default RouteMap;