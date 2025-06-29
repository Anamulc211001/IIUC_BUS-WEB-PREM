import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, BusScheduleDB, Feedback, Complaint } from '../lib/supabase';
import { 
  Bus, User, MessageSquare, Send, Clock, MapPin, Route, Calendar, LogOut, Loader2, 
  Star, Navigation, AlertTriangle, CheckCircle, FileText, Plus, Filter, Eye, Search,
  ArrowRight, TrendingUp, BarChart3, X, Zap, Sparkles
} from 'lucide-react';
import BusCard from '../components/BusCard';
import { BusSchedule } from '../types/BusSchedule';

const StudentDashboard: React.FC = () => {
  const { userProfile, signOut } = useAuth();
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [feedback, setFeedback] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedules' | 'complaints'>('schedules');
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'today' | 'friday'>('all');
  const [complaintForm, setComplaintForm] = useState({
    title: '',
    description: '',
    category: 'other' as Complaint['category'],
    priority: 'medium' as Complaint['priority'],
    bus_route: '',
    incident_time: ''
  });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Auto-close modals after 5 seconds
  useEffect(() => {
    if (showTrackingModal) {
      const timer = setTimeout(() => {
        setShowTrackingModal(false);
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [showTrackingModal]);

  useEffect(() => {
    if (showRouteInfo) {
      const timer = setTimeout(() => {
        setShowRouteInfo(false);
      }, 8000); // Auto-close after 8 seconds (longer for route info)

      return () => clearTimeout(timer);
    }
  }, [showRouteInfo]);

  useEffect(() => {
    fetchData();
  }, [userProfile]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch schedules based on student's gender
      let query = supabase.from('bus_schedules').select('*');
      
      if (userProfile?.gender) {
        query = query.or(`gender.eq.${userProfile.gender},gender.is.null`);
      }
      
      const { data: schedulesData, error: schedulesError } = await query.order('time', { ascending: true });

      if (schedulesError) {
        console.error('Error fetching schedules:', schedulesError);
      } else {
        const convertedSchedules: BusSchedule[] = schedulesData.map(schedule => ({
          id: schedule.id,
          time: schedule.time,
          startingPoint: schedule.starting_point,
          route: schedule.route,
          endPoint: schedule.end_point,
          direction: schedule.direction as any,
          gender: schedule.gender as any,
          busType: schedule.bus_type,
          remarks: schedule.remarks,
          description: schedule.description,
          scheduleType: schedule.schedule_type as any,
        }));
        
        setSchedules(convertedSchedules);
      }

      // Fetch user's complaints
      if (userProfile) {
        const { data: complaintsData, error: complaintsError } = await supabase
          .from('complaints')
          .select('*')
          .eq('user_id', userProfile.id)
          .order('created_at', { ascending: false });

        if (complaintsError) {
          console.error('Error fetching complaints:', complaintsError);
        } else {
          setComplaints(complaintsData || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim() || !userProfile) return;

    setSubmittingFeedback(true);
    
    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          {
            user_id: userProfile.id,
            message: feedback.trim(),
          },
        ]);

      if (error) {
        console.error('Error submitting feedback:', error);
      } else {
        setFeedback('');
        setFeedbackSuccess(true);
        setTimeout(() => setFeedbackSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.title.trim() || !complaintForm.description.trim() || !userProfile) return;

    setSubmittingComplaint(true);
    
    try {
      const { error } = await supabase
        .from('complaints')
        .insert([
          {
            user_id: userProfile.id,
            title: complaintForm.title.trim(),
            description: complaintForm.description.trim(),
            category: complaintForm.category,
            priority: complaintForm.priority,
            bus_route: complaintForm.bus_route.trim() || null,
            incident_time: complaintForm.incident_time.trim() || null,
          },
        ]);

      if (error) {
        console.error('Error submitting complaint:', error);
      } else {
        setComplaintForm({
          title: '',
          description: '',
          category: 'other',
          priority: 'medium',
          bus_route: '',
          incident_time: ''
        });
        setShowComplaintForm(false);
        setComplaintSuccess(true);
        setTimeout(() => setComplaintSuccess(false), 3000);
        fetchData(); // Refresh complaints
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Filter schedules based on current filter
  const getFilteredSchedules = () => {
    switch (scheduleFilter) {
      case 'today':
        const currentHour = new Date().getHours();
        return schedules.filter(s => {
          const scheduleHour = parseInt(s.time.split(':')[0]);
          return scheduleHour >= currentHour;
        });
      case 'friday':
        return schedules.filter(s => s.scheduleType === 'Friday');
      default:
        return schedules;
    }
  };

  // Get morning schedules for quick stats
  const morningSchedules = schedules.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 6 && hour <= 9;
  });

  const fridaySchedules = schedules.filter(s => s.scheduleType === 'Friday');
  const returnSchedules = schedules.filter(s => 
    s.direction === 'IIUCToCity' || s.direction === 'FromUniversity'
  );

  // Quick Action Handlers
  const handleViewTodaySchedule = () => {
    setScheduleFilter('today');
    setActiveTab('schedules');
  };

  const handleViewFridaySpecial = () => {
    setScheduleFilter('friday');
    setActiveTab('schedules');
  };

  const handleFileComplaint = () => {
    setShowComplaintForm(true);
  };

  const handleTrackBus = () => {
    setShowTrackingModal(true);
  };

  const handleViewComplaints = () => {
    setActiveTab('complaints');
  };

  const handleViewRouteInfo = () => {
    setShowRouteInfo(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'delay': return Clock;
      case 'safety': return AlertTriangle;
      case 'driver_behavior': return User;
      case 'bus_condition': return Bus;
      case 'route_issue': return Route;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img src="/iiuc.png" alt="IIUC" className="h-10 w-10" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
                  <p className="text-sm text-gray-600">IIUC Bus Schedule System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{userProfile?.name}</p>
                <p className="text-sm text-gray-600">{userProfile?.university_id}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Welcome, {userProfile?.name}!</h2>
                  <p className="text-blue-100">
                    {userProfile?.gender} Student • {userProfile?.university_id}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Bus className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-lg font-bold">{schedules.length}</div>
                  <div className="text-xs text-blue-100">Available Buses</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-lg font-bold">{morningSchedules.length}</div>
                  <div className="text-xs text-blue-100">Morning Routes</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-lg font-bold">{fridaySchedules.length}</div>
                  <div className="text-xs text-blue-100">Friday Special</div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <Navigation className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-lg font-bold">{returnSchedules.length}</div>
                  <div className="text-xs text-blue-100">Return Routes</div>
                </div>
              </div>
            </div>

            {/* Success Messages */}
            {complaintSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 font-medium">Complaint submitted successfully! We'll review it and get back to you soon.</p>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'schedules'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Bus className="h-5 w-5" />
                  <span>Bus Schedules</span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {getFilteredSchedules().length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('complaints')}
                  className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'complaints'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>My Complaints</span>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {complaints.length}
                  </span>
                </button>
              </div>

              <div className="p-6">
                {/* Bus Schedules Tab */}
                {activeTab === 'schedules' && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                      <div className="flex items-center space-x-3">
                        <Bus className="h-6 w-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          Your Bus Schedules ({userProfile?.gender})
                        </h3>
                      </div>
                      
                      {/* Schedule Filter */}
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                          value={scheduleFilter}
                          onChange={(e) => setScheduleFilter(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="all">All Schedules</option>
                          <option value="today">Today's Remaining</option>
                          <option value="friday">Friday Special</option>
                        </select>
                      </div>
                    </div>
                    
                    {getFilteredSchedules().length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {getFilteredSchedules().map((schedule) => (
                          <BusCard key={schedule.id} schedule={schedule} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No schedules available</h4>
                        <p className="text-gray-500">
                          {scheduleFilter === 'today' 
                            ? 'No more buses scheduled for today.' 
                            : scheduleFilter === 'friday'
                            ? 'No Friday special schedules available.'
                            : `Bus schedules for ${userProfile?.gender} students will appear here.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Complaints Tab */}
                {activeTab === 'complaints' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                        <h3 className="text-xl font-bold text-gray-900">My Complaints</h3>
                      </div>
                      <button
                        onClick={() => setShowComplaintForm(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                        <span>File Complaint</span>
                      </button>
                    </div>

                    {/* Complaints List */}
                    {complaints.length > 0 ? (
                      <div className="space-y-4">
                        {complaints.map((complaint) => {
                          const CategoryIcon = getCategoryIcon(complaint.category);
                          return (
                            <div key={complaint.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start space-x-3">
                                  <div className="bg-white rounded-lg p-2">
                                    <CategoryIcon className="h-5 w-5 text-gray-600" />
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-gray-900">{complaint.title}</h5>
                                    <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                                    {complaint.bus_route && (
                                      <p className="text-xs text-gray-500 mt-1">Route: {complaint.bus_route}</p>
                                    )}
                                    {complaint.incident_time && (
                                      <p className="text-xs text-gray-500">Time: {complaint.incident_time}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(complaint.status)}`}>
                                    {complaint.status.replace('_', ' ').toUpperCase()}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                                    {complaint.priority.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              
                              {complaint.admin_response && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                                  <p className="text-sm font-medium text-blue-800 mb-1">Admin Response:</p>
                                  <p className="text-sm text-blue-700">{complaint.admin_response}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                                <span className="text-xs text-gray-500">
                                  Filed: {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                                {complaint.resolved_at && (
                                  <span className="text-xs text-green-600 font-medium">
                                    Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No complaints filed</h4>
                        <p className="text-gray-500 mb-4">You haven't filed any complaints yet.</p>
                        <button
                          onClick={() => setShowComplaintForm(true)}
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>File Your First Complaint</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Enhanced Quick Actions - Fully Responsive and Working */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Quick Actions</span>
              </h3>
              
              {/* Mobile-First Grid Layout */}
              <div className="grid grid-cols-1 gap-3">
                
                {/* View Today's Schedule - WORKING */}
                <button 
                  onClick={handleViewTodaySchedule}
                  className="group w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 rounded-xl transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 rounded-lg p-2 group-hover:scale-110 transition-transform">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm sm:text-base">View Today's Schedule</span>
                      <p className="text-xs text-blue-600 mt-0.5">Check current bus timings</p>
                    </div>
                  </div>
                  <div className="text-blue-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Friday Special - WORKING */}
                <button 
                  onClick={handleViewFridaySpecial}
                  className="group w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 rounded-xl transition-all duration-200 border border-purple-200 hover:border-purple-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500 rounded-lg p-2 group-hover:scale-110 transition-transform">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm sm:text-base">Friday Special</span>
                      <p className="text-xs text-purple-600 mt-0.5">AC buses & special timings</p>
                    </div>
                  </div>
                  <div className="text-purple-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* File Complaint - WORKING */}
                <button 
                  onClick={handleFileComplaint}
                  className="group w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-500 rounded-lg p-2 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm sm:text-base">File Complaint</span>
                      <p className="text-xs text-red-600 mt-0.5">Report issues or concerns</p>
                    </div>
                  </div>
                  <div className="text-red-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Track My Bus - WORKING */}
                <button 
                  onClick={handleTrackBus}
                  className="group w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 rounded-xl transition-all duration-200 border border-emerald-200 hover:border-emerald-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 rounded-lg p-2 group-hover:scale-110 transition-transform">
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm sm:text-base">Track My Bus</span>
                      <p className="text-xs text-emerald-600 mt-0.5">Real-time bus location</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* My Complaints - WORKING */}
                <button 
                  onClick={handleViewComplaints}
                  className="group w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 rounded-xl transition-all duration-200 border border-orange-200 hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 rounded-lg p-2 group-hover:scale-110 transition-transform">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm sm:text-base">My Complaints</span>
                      <p className="text-xs text-orange-600 mt-0.5">{complaints.length} active complaints</p>
                    </div>
                  </div>
                  <div className="text-orange-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* Route Information - WORKING */}
                <button 
                  onClick={handleViewRouteInfo}
                  className="group w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 rounded-xl transition-all duration-200 border border-indigo-200 hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-500 rounded-lg p-2 group-hover:scale-110 transition-transform">
                      <Route className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-sm sm:text-base">Route Information</span>
                      <p className="text-xs text-indigo-600 mt-0.5">Detailed route maps</p>
                    </div>
                  </div>
                  <div className="text-indigo-500 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {/* Quick Stats at Bottom */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-900">{morningSchedules.length}</div>
                    <div className="text-xs text-gray-600">Morning Buses</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-900">{returnSchedules.length}</div>
                    <div className="text-xs text-gray-600">Return Buses</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">Profile Information</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-gray-900">{userProfile?.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">University ID</label>
                  <p className="text-gray-900">{userProfile?.university_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{userProfile?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Mobile</label>
                  <p className="text-gray-900">{userProfile?.mobile}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Gender</label>
                  <p className="text-gray-900">{userProfile?.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-gray-900 capitalize">{userProfile?.role}</p>
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h3 className="font-bold text-gray-900">Send Feedback</h3>
              </div>
              
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts about the bus service, suggest improvements, or report issues..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 resize-none"
                  rows={4}
                  required
                />
                
                {feedbackSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
                    ✓ Feedback submitted successfully! Thank you for your input.
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={submittingFeedback || !feedback.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submittingFeedback ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      
      {/* Complaint Form Modal */}
      {showComplaintForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">File a Complaint</h4>
                <button
                  onClick={() => setShowComplaintForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Complaint Title *
                  </label>
                  <input
                    type="text"
                    value={complaintForm.title}
                    onChange={(e) => setComplaintForm({...complaintForm, title: e.target.value})}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={complaintForm.category}
                    onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                    required
                  >
                    <option value="delay">Bus Delay</option>
                    <option value="safety">Safety Concern</option>
                    <option value="driver_behavior">Driver Behavior</option>
                    <option value="bus_condition">Bus Condition</option>
                    <option value="route_issue">Route Issue</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={complaintForm.priority}
                    onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bus Route (Optional)
                  </label>
                  <input
                    type="text"
                    value={complaintForm.bus_route}
                    onChange={(e) => setComplaintForm({...complaintForm, bus_route: e.target.value})}
                    placeholder="e.g., BOT to IIUC, 7:00 AM"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Incident Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={complaintForm.incident_time}
                    onChange={(e) => setComplaintForm({...complaintForm, incident_time: e.target.value})}
                    placeholder="e.g., Today 7:30 AM, Yesterday evening"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                    placeholder="Please provide detailed information about the issue..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowComplaintForm(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComplaint}
                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {submittingComplaint ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Complaint</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bus Tracking Coming Soon Modal - Auto-Close Fixed */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowTrackingModal(false)}
          />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">Track My Bus</h4>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <Navigation className="h-12 w-12 text-emerald-600 animate-pulse" />
                </div>
                <h5 className="text-lg font-semibold text-gray-900 mb-2">Real-time Tracking</h5>
                <p className="text-gray-600 mb-6">
                  Bus tracking feature is coming soon! You'll be able to see live locations of all IIUC buses.
                </p>
                
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h6 className="font-semibold text-blue-900 mb-2 flex items-center justify-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Coming Features</span>
                  </h6>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Live bus locations on map</li>
                    <li>• Estimated arrival times</li>
                    <li>• Route progress tracking</li>
                    <li>• Push notifications</li>
                    <li>• Delay alerts</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setShowTrackingModal(false)}
                    className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
                  >
                    Got it!
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    This message will close automatically in a few seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Route Information Modal - Auto-Close Fixed */}
      {showRouteInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowRouteInfo(false)}
          />
          
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">Route Information</h4>
                <button
                  onClick={() => setShowRouteInfo(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-4">
                  <h5 className="font-semibold text-indigo-900 mb-3 flex items-center space-x-2">
                    <Route className="h-5 w-5" />
                    <span>Major Routes</span>
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-900 mb-2">BOT Route</h6>
                      <p className="text-sm text-gray-600">BOT → Muradpur → 2 No Gate → Baizid Link → IIUC</p>
                      <span className="text-xs text-blue-600 font-medium">~25 minutes</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-900 mb-2">Agrabad Route</h6>
                      <p className="text-sm text-gray-600">Agrabad → Boropool → AK Khan → IIUC</p>
                      <span className="text-xs text-blue-600 font-medium">~30 minutes</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-900 mb-2">Chatteswari Route</h6>
                      <p className="text-sm text-gray-600">Chatteswari → GEC → Khulshi → AK Khan → IIUC</p>
                      <span className="text-xs text-blue-600 font-medium">~35 minutes</span>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <h6 className="font-medium text-gray-900 mb-2">Baroyarhat Route</h6>
                      <p className="text-sm text-gray-600">Baroyarhat → Mirshorai → Sitakunda → IIUC</p>
                      <span className="text-xs text-blue-600 font-medium">~45 minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <h5 className="font-semibold text-green-900 mb-3">Service Information</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Regular Days:</span>
                      <p className="text-gray-600">Saturday - Wednesday</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Service Hours:</span>
                      <p className="text-gray-600">6:40 AM - 4:35 PM</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Friday Special:</span>
                      <p className="text-gray-600">7:30 AM - 6:30 PM</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Total Routes:</span>
                      <p className="text-gray-600">15+ Major Routes</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    This message will close automatically in a few seconds
                  </p>
                  <button
                    onClick={() => setShowRouteInfo(false)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;