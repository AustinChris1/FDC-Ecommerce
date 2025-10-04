import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CalendarDays, MapPin, Smartphone, Tablet, Monitor, Users, Globe } from 'lucide-react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';

// Professional and vibrant palette adjusted for a lighter background
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#A855F7', '#EC4899', '#34D399'];

export default function ActivityDashboard() {
  const [visitorsPerDay, setVisitorsPerDay] = useState([]);
  const [topCountries, setTopCountries] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [mostActiveHours, setMostActiveHours] = useState([]);
  const [totalUniqueIPs, setTotalUniqueIPs] = useState(0);
  const [topCities, setTopCities] = useState([]);
  const [topDevices, setTopDevices] = useState([]);
  const [topPlatforms, setTopPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch('/api/analytics/dashboard')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        return res.json();
      })
      .then(data => {
        // Set all fetched data to their respective states
        setVisitorsPerDay(data.visitors_per_day || []);
        setTopCountries(data.top_locations || []);
        setTotalVisits(data.total_visits || 0);
        setMostActiveHours(data.most_active_hours || []);
        setTotalUniqueIPs(data.total_unique_ips || 0);
        setTopCities(data.top_cities || []);
        setTopDevices(data.top_devices || []);
        setTopPlatforms(data.top_platforms || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching analytics data:", err);
        toast.error("Failed to load dashboard data. Please try again.");
        setError(true);
        setLoading(false);
      });
  }, []);

  const getDeviceIcon = (deviceString) => {
    const lowerCaseDevice = deviceString.toLowerCase();
    if (lowerCaseDevice.includes('iphone') || lowerCaseDevice.includes('android') || lowerCaseDevice.includes('mobile phone')) {
      return <Smartphone size={16} className="inline-block mr-2 text-purple-600" />;
    }
    if (lowerCaseDevice.includes('ipad') || lowerCaseDevice.includes('tablet')) {
      return <Tablet size={16} className="inline-block mr-2 text-cyan-600" />;
    }
    if (lowerCaseDevice.includes('macintosh') || lowerCaseDevice.includes('windows') || lowerCaseDevice.includes('linux') || lowerCaseDevice.includes('desktop') || lowerCaseDevice.includes('chromebook')) {
      return <Monitor size={16} className="inline-block mr-2 text-green-600" />;
    }
    if (lowerCaseDevice.includes('robot') || lowerCaseDevice.includes('crawler')) {
      return <Users size={16} className="inline-block mr-2 text-gray-500" />;
    }
    return <Users size={16} className="inline-block mr-2 text-gray-500" />;
  };

  // Custom Tooltip for Recharts (adjusted for light theme compatibility)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-200 text-gray-800 text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex justify-between items-center">
              <span className="mr-2" style={{ color: entry.color || COLORS[index % COLORS.length] }}>{entry.name || 'Value'}:</span>
              <span className="font-bold">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading spinner and error messages for initial data fetch
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center text-gray-600">
          <svg className="animate-spin h-16 w-16 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-red-600 text-2xl font-semibold text-center">
          <p className="mb-4">Failed to load dashboard data.</p>
          <p>Please check your network connection and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6 sm:p-8 lg:p-10 font-sans">
      <Helmet>
        <title>Activity Dashboard - First Digit Analytics</title>
        <meta name="description" content="View website activity, visitor statistics, locations, devices, and platforms." />
      </Helmet>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 sm:mb-10 text-gray-900">
        📊 Website Activity Dashboard
      </h1>

      {/* Overview Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {/* Total Visits Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-1">Total Visits</h2>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalVisits.toLocaleString()}</p>
        </div>

        {/* Total Unique IPs Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-1">Unique Visitors (IPs)</h2>
          <p className="text-4xl font-bold text-gray-900 mt-2">{totalUniqueIPs.toLocaleString()}</p>
        </div>

        {/* Top Countries Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-3">Top Countries</h2>
          <ul className="space-y-2">
            {topCountries.length > 0 ? topCountries.map((loc, index) => (
              <li key={`country-${index}`} className="flex items-center justify-between text-base text-gray-700 p-2 bg-gray-50 rounded-md">
                <span className="flex items-center">
                  <MapPin size={16} className="inline-block mr-2 text-indigo-500" />
                  {loc.location}
                </span>
                <span className="font-semibold text-gray-800">{loc.count.toLocaleString()}</span>
              </li>
            )) : (
              <li className="text-sm text-gray-500 text-center py-2">No country data available.</li>
            )}
          </ul>
        </div>

        {/* Top Cities Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-3">Top Cities</h2>
          <ul className="space-y-2">
            {topCities.length > 0 ? topCities.map((city, index) => (
              <li key={`city-${index}`} className="flex items-center justify-between text-base text-gray-700 p-2 bg-gray-50 rounded-md">
                <span className="flex items-center">
                  <Globe size={16} className="inline-block mr-2 text-blue-500" />
                  {city.city}
                </span>
                <span className="font-semibold text-gray-800">{city.count.toLocaleString()}</span>
              </li>
            )) : (
              <li className="text-sm text-gray-500 text-center py-2">No city data available.</li>
            )}
          </ul>
        </div>

        {/* Most Active Hours Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-3">Most Active Hours</h2>
          <ul className="space-y-2">
            {mostActiveHours.length > 0 ? mostActiveHours.map((h, index) => (
              <li key={`hour-${index}`} className="flex justify-between items-center text-base text-gray-700 p-2 bg-gray-50 rounded-md">
                <span className="flex items-center">
                  <CalendarDays size={16} className="inline-block mr-2 text-green-500" />
                  {String(h.hour).padStart(2, '0')}:00 - {String(h.hour + 1).padStart(2, '0')}:00
                </span>
                <span className="font-semibold text-gray-800">{h.count.toLocaleString()} visits</span>
              </li>
            )) : (
              <li className="text-sm text-gray-500 text-center py-2">No active hour data available.</li>
            )}
          </ul>
        </div>

        {/* Top Devices (Raw User-Agent) Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-3">Top Raw Devices</h2>
          <ul className="space-y-2">
            {topDevices.length > 0 ? topDevices.map((device, index) => (
              <li key={`raw-device-${index}`} className="flex items-center justify-between text-base text-gray-700 p-2 bg-gray-50 rounded-md truncate">
                <span className="flex items-center">
                  {getDeviceIcon(device.device)}
                  <span className="truncate">{device.device}</span>
                </span>
                <span className="font-semibold text-gray-800 ml-2 flex-shrink-0">{device.count.toLocaleString()}</span>
              </li>
            )) : (
              <li className="text-sm text-gray-500 text-center py-2">No raw device data available.</li>
            )}
          </ul>
        </div>

        {/* Top Platforms (Parsed Name/Model) Card */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-base text-gray-600 font-medium mb-3">Top Platforms</h2>
          <ul className="space-y-2">
            {topPlatforms.length > 0 ? topPlatforms.map((platform, index) => (
              <li key={`platform-${index}`} className="flex items-center justify-between text-base text-gray-700 p-2 bg-gray-50 rounded-md">
                <span className="flex items-center">
                  {getDeviceIcon(platform.platform)}
                  {platform.platform}
                </span>
                <span className="font-semibold text-gray-800">{platform.count.toLocaleString()}</span>
              </li>
            )) : (
              <li className="text-sm text-gray-500 text-center py-2">No platform data available.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visitors Over Time Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Visitors Over the Last 7 Days</h2>
          {visitorsPerDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitorsPerDay} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis dataKey="date" tickLine={false} axisLine={{ stroke: '#E5E7EB' }} style={{ fill: '#6B7280', fontSize: '12px' }} />
                <YAxis tickLine={false} axisLine={{ stroke: '#E5E7EB' }} style={{ fill: '#6B7280', fontSize: '12px' }} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg py-10">No visitor data for this period to display.</div>
          )}
        </div>

        {/* Top Visitor Countries Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Top Visitor Countries</h2>
          {topCountries.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topCountries}
                  dataKey="count"
                  nameKey="location"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8" // A fallback fill, but cells override
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  labelStyle={{ fill: '#333', fontSize: '12px' }} // Set label color for light background
                >
                  {topCountries.map((entry, index) => (
                    <Cell key={`country-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg py-10">No country data for pie chart to display.</div>
          )}
        </div>

        {/* Top Platforms Pie Chart (NEW CHART) */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] transform">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Top Visitor Platforms</h2>
          {topPlatforms.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topPlatforms}
                  dataKey="count"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                  labelStyle={{ fill: '#333', fontSize: '12px' }}
                >
                  {topPlatforms.map((entry, index) => (
                    <Cell key={`platform-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-lg py-10">No platform data for pie chart to display.</div>
          )}
        </div>
      </div>
    </div>
  );
}
