import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Map, Search, Filter, Bus, Clock, MapPin, Navigation, Route } from 'lucide-react';
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
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div className="flex items-center space-x-3">
                <img src="/iiuc.png" alt="IIUC" className="h-8 w-8" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Route Maps</h1>
                  <p className="text-sm text-gray-600">Interactive bus route visualization</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  viewMode === 'map'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Map View</span>
              </button>
              
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bus className="h-4 w-4" />
                <span>List View</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search routes, areas, or times..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="All">All Areas</option>
                {routeAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
              
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
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
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="All">All Schedules</option>
                <option value="Regular">Regular</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredSchedules.length}</span> of {busSchedules.length} routes
            </p>
            
            {(searchTerm || direction !== 'All' || scheduleType !== 'All' || routeFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDirection('All');
                  setScheduleType('All');
                  setRouteFilter('All');
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {viewMode === 'map' ? (
          <RouteVisualization schedules={filteredSchedules} />
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3">
                  <Bus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">All Bus Schedules</h2>
                  <p className="text-gray-600">Complete list of IIUC bus routes and timings</p>
                </div>
              </div>
            </div>
            
            {filteredSchedules.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSchedules.map((schedule) => (
                  <BusCard key={schedule.id} schedule={schedule} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                <Route className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No routes found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search criteria or filters</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDirection('All');
                    setScheduleType('All');
                    setRouteFilter('All');
                  }}
                  className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
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