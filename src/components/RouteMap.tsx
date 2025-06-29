import React, { useState } from 'react';
import { MapPin, Navigation, Bus, Clock, Users, Route, X, Maximize2, Minimize2, Layers, Satellite, Map as MapIcon, AlertCircle, Wifi, WifiOff, Globe } from 'lucide-react';
import { BusSchedule } from '../types/BusSchedule';
import OpenStreetMap from './OpenStreetMap';

interface RouteMapProps {
  schedule?: BusSchedule;
  schedules?: BusSchedule[];
  isFullscreen?: boolean;
  onClose?: () => void;
}

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
        
        <div className="mt-6 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 text-green-700">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">Free OpenStreetMap</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Using free and open-source mapping technology
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
  const [mapProvider, setMapProvider] = useState<'openstreetmap' | 'static'>('openstreetmap');

  // Always use OpenStreetMap as it's free and doesn't require API keys
  return (
    <div className="relative">
      {/* Map Provider Toggle */}
      <div className="absolute top-4 right-4 z-[1001] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setMapProvider('openstreetmap')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              mapProvider === 'openstreetmap' 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="OpenStreetMap (Free)"
          >
            <Globe className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setMapProvider('static')}
            className={`p-2 rounded-lg transition-all duration-200 ${
              mapProvider === 'static' 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Static Information"
          >
            <MapIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {mapProvider === 'openstreetmap' ? (
        <OpenStreetMap 
          schedule={schedule}
          schedules={schedules}
          isFullscreen={isFullscreen}
          onClose={onClose}
        />
      ) : (
        <StaticRouteMap 
          schedule={schedule}
          schedules={schedules}
          isFullscreen={isFullscreen}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export default RouteMap;