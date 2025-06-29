import React, { useState } from 'react';
import { X, Maximize2, Minimize2, Map, Navigation, Bus, Clock, AlertCircle, Settings, Globe, Star } from 'lucide-react';
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
  const [showMapInfo, setShowMapInfo] = useState(false);

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
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="bg-white/20 rounded-full p-2 flex-shrink-0">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold truncate">{displayTitle}</h3>
                <p className="text-green-100 text-sm flex items-center space-x-2">
                  <Star className="h-3 w-3" />
                  <span>Free OpenStreetMap • No API Key Required</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowMapInfo(!showMapInfo)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Map Information"
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

          {/* Map Info Panel */}
          {showMapInfo && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">Free & Open Source Mapping</p>
                  <div className="space-y-1 text-xs">
                    <p>✅ <strong>OpenStreetMap:</strong> Free, open-source mapping data</p>
                    <p>✅ <strong>No API Keys:</strong> Works immediately without setup</p>
                    <p>✅ <strong>Interactive:</strong> Zoom, pan, and explore routes</p>
                    <p>✅ <strong>Multiple Layers:</strong> Street view and satellite imagery</p>
                    <p>✅ <strong>Real Routes:</strong> Accurate IIUC bus route visualization</p>
                  </div>
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    🌍 Powered by OpenStreetMap contributors worldwide
                  </p>
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
                <Globe className="h-3 w-3 text-green-500" />
                <span className="hidden sm:inline">Free OpenStreetMap</span>
                <span className="sm:hidden">Free Maps</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span className="hidden sm:inline">Interactive Routes</span>
                <span className="sm:hidden">Routes</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs">Powered by</span>
              <span className="font-semibold text-green-600">OpenStreetMap</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RouteMapModal;