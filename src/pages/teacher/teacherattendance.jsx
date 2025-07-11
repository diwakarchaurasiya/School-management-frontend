// TeacherAttendance.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import "react-datepicker/dist/react-datepicker.css";

const TeacherAttendance = () => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [attendance, setAttendance] = useState({
    start: null,
    end: null,
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('mark'); // 'mark' or 'history'
  const [punchStatus, setPunchStatus] = useState({
    lastPunch: null,
    nextAvailableTime: null,
    remainingPunches: 2,
    todayPunches: []
  });

  // Get teacher data from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const teacherId = userData?.user?.id;
  const token = localStorage.getItem("teacher_token");
  const schools = userData?.user?.schools || [];
  const schoolId = schools[0]?.id;
  const API_BASE_URL = "https://api.jsic.in/api";

  // Function to get current location with retry
  const getCurrentLocation = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });

        const { latitude, longitude, accuracy } = position.coords;
        return { latitude, longitude, accuracy };
      } catch (error) {
        console.warn(`Location attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchPunchStatus = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/teacher-attendance/punch-status/${teacherId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data?.success) {
        // Safe access of data with default values
        const punchData = {
          lastPunch: response.data.data?.lastPunch || null,
          nextAvailableTime: response.data.data?.nextAvailableTime || null,
          remainingPunches: response.data.data?.remainingPunches || 2,
          todayPunches: response.data.data?.todayPunches || []
        };

        setPunchStatus(punchData);
        
        // Safely update attendance state using optional chaining
        const todayPunches = punchData.todayPunches;
        setAttendance({
          start: todayPunches?.find(p => p?.type === 'IN')?.time || null,
          end: todayPunches?.find(p => p?.type === 'OUT')?.time || null
        });
      } else {
        throw new Error('Failed to fetch punch status');
      }
    } catch (error) {
      console.error('Error fetching punch status:', error);
      toast.error('Failed to fetch punch status');
      // Set default values on error
      setPunchStatus({
        lastPunch: null,
        nextAvailableTime: null,
        remainingPunches: 2,
        todayPunches: []
      });
      setAttendance({ start: null, end: null });
    }
  };

  useEffect(() => {
    if (teacherId && token) {
      fetchPunchStatus();
    }
  }, [teacherId, token]);

  const markAttendance = async (type) => {
    if (!teacherId || !token || !schoolId) {
      toast.error("Authentication required");
      return;
    }

    setLoading(true);

    try {
      const locationData = await getCurrentLocation();
      
      if (!locationData) {
        throw new Error('Unable to get location');
      }

      const response = await axios.post(
        `${API_BASE_URL}/teacher-attendance/mark`,
        {
          teacherId,
          schoolId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          type,
          accuracy: locationData.accuracy,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        await fetchPunchStatus(); // Refresh punch status after marking attendance
        toast.success(`${type} attendance marked successfully!`);
      }
    } catch (error) {
      console.error("Attendance marking failed:", error);
      
      if (error.message === 'User denied Geolocation') {
        toast.error('Please enable location services');
        setStatus('Location access denied');
      } else if (error.response?.status === 403) {
        const { distance, allowedRadius } = error.response.data.data || {};
        toast.error(`You are ${Math.round(distance)}m away from school. Must be within ${allowedRadius}m.`);
        setStatus('Outside school zone');
      } else {
        toast.error(error.response?.data?.message || 'Failed to mark attendance');
        setStatus('Attendance marking failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance history
  useEffect(() => {
    if (view === 'history') {
      fetchAttendanceHistory();
    }
  }, [view]);

  const fetchAttendanceHistory = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/teacher-attendance`, {
        params: {
          teacherId,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          schoolId
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const transformedData = response.data.data.map(record => ({
          ...record,
          status: record.type === 'start' ? 'IN' : 'OUT',
          timestamp: new Date(record.date).toISOString(),
          formattedDate: format(new Date(record.date), 'dd/MM/yyyy'),
          formattedTime: format(new Date(record.date), 'HH:mm:ss')
        }));
        setAttendanceHistory(transformedData);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch attendance history');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const wsData = attendanceHistory.map(record => ({
      Date: record.formattedDate,
      Type: record.status,
      Time: record.formattedTime,
      'Teacher Name': record.teacher.fullName,
      Email: record.teacher.email
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `attendance_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/teacher-attendance`,
        {
          params: {
            teacherId,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd')
          },
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to export PDF');
      console.error('Error:', error);
    }
  };

  const PunchStatus = () => {
    if (!punchStatus.lastPunch) return null;

    const formatDateTime = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return 'Not Available';
        }
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      } catch (error) {
        console.error('Date parsing error:', error);
        return 'Invalid Date';
      }
    };

    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Punch Status</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Last Punch:</span>{' '}
            {formatDateTime(punchStatus.lastPunch)}
          </p>
          {punchStatus.nextAvailableTime && (
            <p>
              <span className="font-medium">Next Available Punch:</span>{' '}
              {formatDateTime(punchStatus.nextAvailableTime)}
            </p>
          )}
          <p>
            <span className="font-medium">Remaining Punches:</span>{' '}
            {punchStatus.remainingPunches}
          </p>
          <div className="mt-4">
            <h4 className="font-medium mb-2">Today's Punches:</h4>
            <div className="space-y-1">
              {punchStatus.todayPunches.map((punch, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    punch.type === 'IN' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {punch.type}
                  </span>
                  <span>{formatDateTime(punch.time)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <div className="space-x-4">
          <button
            onClick={() => setView('mark')}
            className={`px-4 py-2 rounded ${view === 'mark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Mark Attendance
          </button>
          <button
            onClick={() => setView('history')}
            className={`px-4 py-2 rounded ${view === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            View History
          </button>
        </div>
      </div>

      {view === 'mark' ? (
        <div className="p-6 max-w-md mx-auto shadow rounded bg-white">
          <h2 className="text-xl font-bold mb-4">Teacher Attendance</h2>

          <div className="space-y-2">
            <button
              onClick={() => markAttendance("IN")}
              className="w-full bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-600"
              disabled={loading || attendance.start || 
                (punchStatus.nextAvailableTime && new Date() < new Date(punchStatus.nextAvailableTime))}
            >
              {loading ? "Processing..." : "Mark Entry Time"}
            </button>
            
            <button
              onClick={() => markAttendance("OUT")}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-blue-600"
              disabled={loading || attendance.end || !attendance.start ||
                (punchStatus.nextAvailableTime && new Date() < new Date(punchStatus.nextAvailableTime))}
            >
              {loading ? "Processing..." : "Mark Exit Time"}
            </button>
          </div>

          <div className="mt-4 space-y-2 text-gray-700">
            <p className="font-medium">Status: <span className="font-normal">{status}</span></p>
            <PunchStatus />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                className="border rounded p-2"
                dateFormat="dd/MM/yyyy"
              />
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                className="border rounded p-2"
                dateFormat="dd/MM/yyyy"
              />
              <button
                onClick={fetchAttendanceHistory}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Filter'}
              </button>
            </div>
            <div className="space-x-2">
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Export Excel
              </button>
              <button
                onClick={exportToPDF}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px]">
            <table className="min-w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.formattedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.formattedTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {record.teacher.fullName}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendance;
