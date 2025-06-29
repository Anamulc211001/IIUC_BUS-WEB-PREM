import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Bus, Clock, Users, Route, X, Maximize2, Minimize2, Layers, Satellite, Map as MapIcon, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { BusSchedule } from '../types/BusSchedule';

interface RouteMapProps {
  schedule?: BusSchedule;
  schedules?: BusSchedule[];
  isFullscreen?: boolean;
  onClose?: () => void;
}

// Define route coordinates for IIUC bus routes (more accurate coordinates)
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
  ],
  
  // Additional routes
  'Kotowali': [
    { lat: 22.3356, lng: 91.8317 }, // Kotowali
    { lat: 22.3412, lng: 91.8234 }, // Kadamtali
    { lat: 22.3567, lng: 91.8456 }, // Dewan Hat
    { lat: 22.3789, lng: 91.8678 }, // Alanker
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ],
  
  'Lucky Plaza': [
    { lat: 22.3255, lng: 91.8317 }, // Lucky Plaza (Agrabad area)
    { lat: 22.3298, lng: 91.8245 }, // Boropool
    { lat: 22.3456, lng: 91.8123 }, // Noyabazar
    { lat: 22.3789, lng: 91.8034 }, // AK Khan
    { lat: 22.4569, lng: 91.9859 }  // IIUC
  ]
};

// IIUC location
const IIUC_LOCATION = { lat: 22.4569, lng: 91.9859 };

// Fallback static map component
const StaticRouteMap: React.FC<RouteMapProps> = ({ schedule, schedules = [] }) => {
  const routesToShow = schedule ? [schedule] : schedules;
  
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-lg border border-white/50">
        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <MapIcon className="h-8 w-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3">Route Information</h3>
        
        {schedule ? (
          <div className="space-y-3 text-left">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">{schedule.time}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span className="text-sm">{schedule.startingPoint}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Navigation className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{schedule.endPoint}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-600 leading-relaxed">{schedule.route}</p>
            </div>
            {schedule.gender && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                schedule.gender === 'Female' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {schedule.gender} Only
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600 mb-4">
              {routesToShow.length} bus routes available
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-pink-50 rounded-lg p-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full mx-auto mb-1"></div>
                <div className="text-pink-700 font-medium">Female</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                <div className="text-blue-700 font-medium">Male</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div>
                <div className="text-orange-700 font-medium">Friday</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                <div className="text-green-700 font-medium">Regular</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center space-x-2 text-yellow-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Interactive Map Unavailable</span>
          </div>
          <p className="text-xs text-yellow-600 mt-1">
            Google Maps couldn't load. Showing route information instead.
          </p>
        </div>
      </div>
    </div>
  );
};

const RouteMap: React.FC<RouteMapProps> = ({ 
  schedule, 
  schedules = [], 
  isFullscreen = false, 
  onClose 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [routePolylines, setRoutePolylines] = useState<google.maps.Polyline[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [trafficLayer, setTrafficLayer] = useState<google.maps.TrafficLayer | null>(null);

  // Check if Google Maps API key is configured
  const hasApiKey = () => {
    // In production, you would check for a real API key
    // For now, we'll simulate this check
    return false; // Set to true when you have a valid API key
  };

  // Load Google Maps API with better error handling
  useEffect(() => {
    if (!hasApiKey()) {
      setLoadError(true);
      return;
    }

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoaded(true);
        setLoadError(false);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setLoadError(true);
        setIsLoaded(false);
      };
      
      document.head.appendChild(script);

      // Cleanup function
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    const cleanup = loadGoogleMaps();
    return cleanup;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || loadError) return;

    try {
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
        },
        gestureHandling: 'cooperative' // Better mobile experience
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

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      setLoadError(true);
    }

    return () => {
      // Cleanup markers and polylines
      markers.forEach(marker => marker.setMap(null));
      routePolylines.forEach(polyline => polyline.setMap(null));
      if (trafficLayer) {
        trafficLayer.setMap(null);
      }
    };
  }, [isLoaded, mapType, loadError]);

  // Draw routes based on schedule or schedules
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || loadError) return;

    // Clear existing polylines and markers (except IIUC)
    routePolylines.forEach(polyline => polyline.setMap(null));
    markers.slice(1).forEach(marker => marker.setMap(null)); // Keep IIUC marker
    setRoutePolylines([]);

    const newPolylines: google.maps.Polyline[] = [];
    const newMarkers: google.maps.Marker[] = [markers[0]]; // Keep IIUC marker
    const routesToDraw = schedule ? [schedule] : schedules;

    routesToDraw.forEach((busSchedule, index) => {
      const routeKey = getRouteKey(busSchedule.startingPoint);
      const coordinates = routeCoordinates[routeKey];

      if (coordinates) {
        try {
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

          newMarkers.push(startMarker);
        } catch (error) {
          console.error('Error creating route polyline:', error);
        }
      }
    });

    setRoutePolylines(newPolylines);
    setMarkers(newMarkers);

    // Fit map to show all routes
    if (newPolylines.length > 0 && mapInstanceRef.current) {
      try {
        const bounds = new google.maps.LatLngBounds();
        routesToDraw.forEach(busSchedule => {
          const routeKey = getRouteKey(busSchedule.startingPoint);
          const coordinates = routeCoordinates[routeKey];
          if (coordinates) {
            coordinates.forEach(coord => bounds.extend(coord));
          }
        });
        mapInstanceRef.current.fitBounds(bounds);
      } catch (error) {
        console.error('Error fitting map bounds:', error);
      }
    }
  }, [schedule, schedules, isLoaded, loadError]);

  const getRouteKey = (startingPoint: string): string => {
    const point = startingPoint.toLowerCase();
    if (point.includes('bot') || point.includes('bahaddarhat')) return 'BOT';
    if (point.includes('agrabad') || point.includes('lucky plaza')) return 'Agrabad';
    if (point.includes('chatteswari')) return 'Chatteswari';
    if (point.includes('baroyarhat')) return 'Baroyarhat';
    if (point.includes('hathazari')) return 'Hathazari';
    if (point.includes('cuet')) return 'CUET';
    if (point.includes('kotowali')) return 'Kotowali';
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
    console.log('Selected route:', busSchedule);
  };

  const toggleMapType = () => {
    const newMapType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newMapType);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(newMapType);
    }
  };

  const toggleTraffic = () => {
    if (!mapInstanceRef.current) return;
    
    setShowTraffic(prev => {
      const newShowTraffic = !prev;
      
      if (newShowTraffic) {
        if (!trafficLayer) {
          const newTrafficLayer = new google.maps.TrafficLayer();
          newTrafficLayer.setMap(mapInstanceRef.current);
          setTrafficLayer(newTrafficLayer);
        } else {
          trafficLayer.setMap(mapInstanceRef.current);
        }
      } else {
        if (trafficLayer) {
          trafficLayer.setMap(null);
        }
      }
      
      return newShowTraffic;
    });
  };

  // Show fallback map if there's an error or API key is missing
  if (loadError || !hasApiKey()) {
    return <StaticRouteMap schedule={schedule} schedules={schedules} />;
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-96'} bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Wifi className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-medium">Loading Interactive Map...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing bus routes visualization</p>
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Connecting to Google Maps</span>
          </div>
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