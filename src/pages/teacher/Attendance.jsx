import React, { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Calendar, Clock, Search } from "lucide-react";
import AttendanceSkeleton from "../../Loading/AttendanceLoading";
import { format } from 'date-fns';

const Attendance = () => {
  // Get teacher data and tokens from localStorage
  const teacherData = JSON.parse(localStorage.getItem("user")) || {};
  const teacherId = teacherData.user?.id;
  const schools = teacherData.user?.schools || [];
  const schoolId = schools[0]?.id || null;
  const classId = teacherData.user?.classId;
  const token = localStorage.getItem("teacher_token");

  // State management
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({});
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'history'

  const API_BASE_URL = 'https://api.jsic.in/api';

  // Fetch students and attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!schoolId || !classId || !token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch attendance data for the specific date and class
        const { data: attendanceData } = await axios.get(
          `${API_BASE_URL}/attendance/by-date-class`,
          {
            params: {
              date: new Date(date).toISOString(),
              classId,
              schoolId
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (attendanceData.success) {
          const attendanceMap = {};
          attendanceData.data.forEach((record) => {
            attendanceMap[record.studentId] = record.status;
          });
          setAttendance(attendanceMap);
        }

        // Fetch students data for the class
        const { data: studentsData } = await axios.get(
          `${API_BASE_URL}/admission/students/by-school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (studentsData.success) {
          const filteredStudents = studentsData.students.filter(
            (student) => student.classId === classId
          );
          setStudents(filteredStudents);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [date, classId, schoolId, token]);

  const fetchAttendanceHistory = async () => {
    if (!classId || !schoolId || !token) {
      console.error("Missing required parameters");
      return;
    }

    try {
      const { data } = await axios.get(
        // Changed endpoint to match backend route
        `${API_BASE_URL}/attendance/by-class`,
        {
          params: {
            classId, // Send as query param instead of URL param
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            schoolId: String(schoolId)
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        setAttendanceHistory(data.data);
      } else {
        console.error("Failed to fetch attendance history:", data.message);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error.response?.data || error.message);
      alert("Failed to fetch attendance history. Please try again.");
    }
  };

  useEffect(() => {
    if (viewMode === 'history') {
      fetchAttendanceHistory();
    }
  }, [viewMode]);

  const handleFilterClick = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before start date");
      return;
    }

    fetchAttendanceHistory();
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const attendanceData = {
      date: new Date(date).toISOString(),
      classId,
      teacherId,
      attendance: Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status
      }))
    };

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/attendance/mark`,
        attendanceData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data.success) {
        alert("Attendance marked successfully!");
      } else {
        alert(data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert(error.response?.data?.message || "Error marking attendance");
    }
  };

  // Early return if no schoolId
  if (!schoolId) {
    return <div>No school assigned</div>;
  }

  if (loading) return <AttendanceSkeleton />;

  // Filtered students based on teacher's classId and search
  const filteredStudents = students
    .filter((student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.idcardNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

  console.log("Local storage classId:", classId);
  console.log("Filtered students:", filteredStudents);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Attendance Management
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'daily' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Daily Attendance
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-4 py-2 rounded-md ${
                viewMode === 'history' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Attendance History
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or ID card number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 outline-none "
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      ID Card No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {student.idcardNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {student.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(student.id, "present")
                            }
                            className={`p-2 rounded-full transition-colors ${
                              attendance[student.id] === "present"
                                ? "bg-green-100 text-green-600"
                                : "text-gray-400 hover:text-green-600"
                            }`}
                          >
                            <CheckCircle className="h-6 w-6" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleAttendanceChange(student.id, "absent")
                            }
                            className={`p-2 rounded-full transition-colors ${
                              attendance[student.id] === "absent"
                                ? "bg-red-100 text-red-600"
                                : "text-gray-400 hover:text-red-600"
                            }`}
                          >
                            <XCircle className="h-6 w-6" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Absent</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Attendance
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <button
                  onClick={handleFilterClick}
                  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!startDate || !endDate}
                >
                  Filter
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none focus:ring-0 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">ID Card No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Student Name</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceHistory
                  .filter(record => 
                    record.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    record.student.idcardNumber.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {format(new Date(record.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {record.student.idcardNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {record.student.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            record.status === 'present' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {record.markedBy.fullName}
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

export default Attendance;
