import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Map, Navigation, Bus, Clock, AlertCircle, Settings } from 'lucide-react';
import { BusSchedule } from '../types/BusSchedule';
import RouteMap from './RouteMap';

interface RouteMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule?: BusSchedule;
  schedules?: BusSchedule[];
  title?: string;
}

const RouteMapModal: React.FC<RouteMapModalProps> = ({
  isOpen,
  onClose,
  schedule,
  schedules = [],
  title
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  if (!isOpen) return null;

  const displayTitle = title || (schedule ? `${schedule.startingPoint} → ${schedule.endPoint}` : 'Bus Routes Map');

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-slide-up">
        {/* Backdrop */}
        <div 
          className="absolute inset-0" 
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <div className={`relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full max-w-none max-h-none rounded-none sm:rounded-2xl' 
            : 'w-full max-w-5xl h-[90vh] max-h-[700px]'
        }`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                <Map className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold truncate">{displayTitle}</h3>
                <p className="text-blue-100 text-sm">
                  {schedule ? 'Interactive Route Visualization' : `${schedules.length} Routes Available`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowSetupHelp(!showSetupHelp)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Setup Help"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close Map"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Setup Help Panel */}
          {showSetupHelp && (
            <div className="bg-yellow-50 border-b border-yellow-200 p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-2">Google Maps Setup Required</p>
                  <div className="space-y-1 text-xs">
                    <p>1. Get a Google Maps API key from <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
                    <p>2. Enable Maps JavaScript API, Places API, and Geometry API</p>
                    <p>3. Replace "YOUR_GOOGLE_MAPS_API_KEY" in RouteMap.tsx with your actual key</p>
                    <p>4. Update the hasApiKey() function to return true</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Info Bar (if single schedule) */}
          {schedule && (
            <div className="bg-gray-50 border-b border-gray-200 p-3 sm:p-4 flex-shrink-0">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold text-gray-900">{schedule.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bus className="h-4 w-4 text-green-500" />
                  <span className="text-gray-700">{schedule.scheduleType} Schedule</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Navigation className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-700">{schedule.direction.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
                {schedule.gender && (
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                    schedule.gender === 'Female' 
                      ? 'bg-pink-100 text-pink-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {schedule.gender} Only
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 relative min-h-0">
            <RouteMap 
              schedule={schedule}
              schedules={schedules}
              isFullscreen={isFullscreen}
              onClose={isFullscreen ? onClose : undefined}
            />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 sm:p-4 flex items-center justify-between text-sm text-gray-600 flex-shrink-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <span className="flex items-center space-x-1">
                <span>🗺️</span>
                <span className="hidden sm:inline">Interactive Maps</span>
                <span className="sm:hidden">Maps</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span className="hidden sm:inline">Route Visualization</span>
                <span className="sm:hidden">Routes</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">Powered by</span>
              <span className="font-semibold text-blue-600">IIUC Transport</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RouteMapModal;