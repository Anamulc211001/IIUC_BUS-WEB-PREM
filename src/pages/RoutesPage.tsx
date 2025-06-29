import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map, Search, Filter, Bus, Clock, MapPin, Navigation, Route, Globe, Star, CheckCircle } from 'lucide-react';
import { busSchedules } from '../data/busSchedules';
import { useSearch } from '../hooks/useSearch';
import RouteVisualization from '../components/RouteVisualization';
import BusCard from '../components/BusCard';

const RoutesPage: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    direction,
    setDirection,
    scheduleType,
    setScheduleType,
    routeFilter,
    setRouteFilter,
    routeAreas,
    filteredSchedules,
    resetAllFilters,
  } = useSearch(busSchedules);

  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm sm:text-base">Back to Home</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <img src="/iiuc.png" alt="IIUC" className="h-6 w-6 sm:h-8 sm:w-8" />
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Route Maps</h1>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center space-x-1">
                    <Globe className="h-3 w-3 text-green-500" />
                    <span>Free OpenStreetMap</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  viewMode === 'map'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">Map View</span>
                <span className="sm:hidden">Map</span>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bus className="h-4 w-4" />
                <span className="hidden sm:inline">List View</span>
                <span className="sm:hidden">List</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4">
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search routes, areas, or times..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
              />
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-base"
              >
                <option value="All">All Areas</option>
                {routeAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-base"
              >
                <option value="All">All Directions</option>
                <option value="CityToIIUC">City → IIUC</option>
                <option value="IIUCToCity">IIUC → City</option>
                <option value="ToUniversity">To University</option>
                <option value="FromUniversity">From University</option>
              </select>
              
              <select
                value={scheduleType}
                onChange={(e) => setScheduleType(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-base"
              >
                <option value="All">All Schedules</option>
                <option value="Regular">Regular</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <p className="text-gray-600 text-sm">
              Showing <span className="font-semibold text-blue-600">{filteredSchedules.length}</span> of {busSchedules.length} routes
            </p>
            
            {(searchTerm || direction !== 'All' || scheduleType !== 'All' || routeFilter !== 'All') && (
              <button
                onClick={resetAllFilters}
                className="text-red-600 hover:text-red-700 font-medium text-sm self-start sm:self-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Free Maps Benefits */}
        {viewMode === 'map' && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="bg-green-500 rounded-full p-2 flex-shrink-0">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-2 flex items-center space-x-2">
                  <span>🎉 Free Interactive Maps - No Setup Required!</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs">No API keys needed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs">Completely free to use</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs">Interactive zoom & pan</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs">Multiple map layers</span>
                  </div>
                </div>
                <p className="text-xs text-green-600 font-medium">
                  🌍 Powered by OpenStreetMap - the free, editable map of the world
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'map' ? (
          <RouteVisualization schedules={filteredSchedules} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-3">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">All Bus Schedules</h2>
                  <p className="text-gray-600 text-sm sm:text-base">Complete list of IIUC bus routes and timings</p>
                </div>
              </div>
            </div>
            
            {filteredSchedules.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredSchedules.map((schedule) => (
                  <BusCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
                <Route className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-600 mb-2">No routes found</h3>
                <p className="text-gray-500 mb-6 text-sm sm:text-base">Try adjusting your search criteria or filters</p>
                <button
                  onClick={resetAllFilters}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  Show All Routes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutesPage;