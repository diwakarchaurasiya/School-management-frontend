import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";

const DailyAttendanceSummary = ({ token, teacherId }) => {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("daily");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendance, setAttendance] = useState({});
  const [printMode, setPrintMode] = useState("both"); // 'teachers', 'students', 'both'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const schools = user?.user?.schools || user?.schools || [];
  const schoolId = schools[0]?.id || null;

  // Fetch classes for the current schoolId
  useEffect(() => {
    // const fetchClasses = async () => {
    //   if (!schoolId || !token) return;
    //   try {
    //     const response = await axios.get(
    //       `http://localhost:5002/api/classes/school/${schoolId}`,
    //       {
    //         headers: { Authorization: `Bearer ${token}` }
    //       }
    //     );
    //     setClasses(response.data.classes || []);
    //   } catch (err) {
    //     console.error("Error fetching classes:", err);
    //   }
    // };
    // fetchClasses();
  }, [schoolId, token]);

  // Fetch teacher attendance summary
  const fetchAttendanceSummary = async () => {
    if (!schoolId || !startDate || !endDate) {
      setError("Missing required fields: schoolId or date");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const schools = user?.user?.schools || user?.schools || [];
      const schoolId = schools[0]?.id || null;
      const token = localStorage.getItem("principal_token");
      const response = await axios.get(
        `http://localhost:5002/api/teacher-attendance/daily-summary`,
        {
          params: {
            schoolId,
            date: startDate,
            endDate: endDate,
            teacherId: teacherId || undefined,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAttendanceSummary(response.data.data);
    } catch (err) {
      console.error(
        "Error fetching attendance summary:",
        err.response || err.message
      );
      setError(
        err.response?.data?.message || "Failed to fetch attendance summary"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Students and Attendance
  const fetchStudentsAndAttendance = async () => {
    if (!schoolId || !startDate || !endDate) {
      setError("Missing required fields: schoolId or date");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("principal_token");
      // Fetch all students for the school
      const studentsRes = await axios.get(
        `http://localhost:5002/api/admission/students/by-school/${schoolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const allStudents = studentsRes.data.students || [];

      // Fetch attendance for date range
      const attendanceRes = await axios.get(
        `http://localhost:5002/api/attendance/school/${schoolId}`,
        {
          params: { startDate, endDate, schoolId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const attendanceMap = {};
      (attendanceRes.data.data || []).forEach((record) => {
        attendanceMap[record.studentId] = record.status;
      });

      setStudents(allStudents);
      setAttendance(attendanceMap);
    } catch (err) {
      console.error("Error fetching student data:", err);
      setError("Failed to fetch student attendance");
      setStudents([]);
      setAttendance({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSummary();
    fetchStudentsAndAttendance();
  }, [startDate, endDate, selectedClassId, schoolId, token, teacherId]);

  // Calculate teacher totals
  const totalTeachers = attendanceSummary.length;
  const totalPresentTeachers = attendanceSummary.filter(
    (t) => t.punches && t.punches.length > 0
  ).length;
  const totalAbsentTeachers = totalTeachers - totalPresentTeachers;

  // Calculate student totals
  const filteredStudents = students.filter(
    (student) =>
      (!selectedClassId ||
        String(student.classId) === String(selectedClassId)) &&
      (student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.idcardNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalStudents = filteredStudents.length;
  const totalPresent = filteredStudents.filter(
    (s) => attendance[s.id] === "present"
  ).length;
  const totalAbsent = totalStudents - totalPresent;

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Excel export function
  const handleExcelExport = () => {
    let ws,
      wb,
      data = [];
    if (printMode === "teachers" || printMode === "both") {
      data = attendanceSummary.map((teacher, idx) => ({
        "Sr. No": idx + 1,
        "Teacher Name": teacher.fullName,
        Email: teacher.email,
        "Punch Details": (teacher.punches || [])
          .map(
            (p) =>
              `${p.type}: ${new Date(p.time).toLocaleTimeString()} (Lat: ${
                p.latitude
              }, Lon: ${p.longitude})`
          )
          .join("\n"),
        Status:
          teacher.punches && teacher.punches.length > 0 ? "Present" : "Absent",
      }));
      ws = XLSX.utils.json_to_sheet(data);
      wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Teacher Attendance");
    }
    if (printMode === "students" || printMode === "both") {
      data = filteredStudents.map((student, idx) => ({
        "Sr. No": idx + 1,
        "Student Name": student.studentName,
        "ID Card No": student.idcardNumber,
        "Admission No": student.Admission_Number,
        Class: student.class_,
        Section: student.sectionclass,
        Status: attendance[student.id] === "present" ? "Present" : "Absent",
      }));
      ws = XLSX.utils.json_to_sheet(data);
      if (!wb) wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Attendance");
    }
    if (wb) {
      XLSX.writeFile(wb, "Attendance_Report.xlsx");
    }
  };

  // Download Monthly Teacher Attendance Summary (flat rows)
  const handleDownloadMonthlySummary = async () => {
    if (!schoolId || !selectedMonth || !selectedYear) return;
    try {
      const token = localStorage.getItem("principal_token");
      const response = await axios.get(
        `http://localhost:5002/api/teacher-attendance/monthly-summary`,
        {
          params: {
            schoolId,
            month: selectedMonth,
            year: selectedYear,
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data.data || [];
      // Format for Excel (flat rows)
      const excelData = data.map((row) => ({
        "Sr. No": row.srNo,
        "Teacher Name": row.teacherName,
        Email: row.email,
        Type: row.type,
        Time: new Date(row.time).toLocaleString(),
        Latitude: row.latitude,
        Longitude: row.longitude,
        createdAt: new Date(row.createdAt).toLocaleString(),
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Monthly Teacher Attendance");
      XLSX.writeFile(
        wb,
        `Monthly_Teacher_Attendance_${selectedMonth}_${selectedYear}.xlsx`
      );
    } catch (err) {
      alert("Failed to download monthly summary.");
    }
  };
  // Date range validation
  const isValidDateRange = startDate <= endDate;

  return (
    <>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            .print-break { page-break-before: always; }
            
            .print-header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            
            .print-summary {
              display: flex;
              justify-content: space-around;
              margin: 20px 0;
              padding: 10px;
              border: 1px solid #ccc;
              background-color: #f9f9f9;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            
            .print-table th,
            .print-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            
            .print-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            
            .status-present { 
              background-color: #d4edda !important; 
              color: #155724 !important; 
            }
            
            .status-absent { 
              background-color: #f8d7da !important; 
              color: #721c24 !important; 
            }
          }
        `}
      </style>

      <div className="bg-white min-h-screen">
        {/* Header Section - No Print */}
        <div className="no-print bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">
            Daily Attendance Report
          </h1>
          <p className="text-center text-blue-100">
            Comprehensive attendance tracking system
          </p>
        </div>

        {/* Print Header - Print Only */}
        <div className="print-only hidden print-header">
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>
            {schools[0]?.name || "School"} - Attendance Report
          </h1>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            Date Range: {new Date(startDate).toLocaleDateString()} to{" "}
            {new Date(endDate).toLocaleDateString()}
          </p>
          <p style={{ margin: "0", fontSize: "12px", color: "#666" }}>
            Generated on: {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Controls Section - No Print */}
        <div className="no-print space-y-6 mb-8">
          {/* Date Range Filters */}
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Date Range Filter
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Filter
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Print Options
                </label>
                <select
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="both">Teachers & Students</option>
                  <option value="teachers">Teachers Only</option>
                  <option value="students">Students Only</option>
                </select>
              </div>
            </div>

            {!isValidDateRange && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                End date must be after or equal to start date.
              </div>
            )}
          </div>

          {/* Search and Actions */}
          <div className="bg-white p-6 rounded-lg shadow-lg border">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleExcelExport}
                disabled={!isValidDateRange}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Download Excel"
              >
                <FaFileExcel className="w-5 h-5" />
                Download Excel
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Summary Download Controls */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-4 bg-black p-3 rounded-lg shadow-lg">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700"
            >
              {[...Array(6)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
            <button
              onClick={handleDownloadMonthlySummary}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
            >
              Download Monthly Teacher Summary
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalPresentTeachers}</div>
              <div className="text-sm opacity-90">Teachers Present</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-400 to-red-500 text-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalAbsentTeachers}</div>
              <div className="text-sm opacity-90">Teachers Absent</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalPresent}</div>
              <div className="text-sm opacity-90">Students Present</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-6 rounded-lg shadow-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalAbsent}</div>
              <div className="text-sm opacity-90">Students Absent</div>
            </div>
          </div>
        </div>

        {/* Print Summary */}
        <div className="print-only hidden print-summary">
          <div>
            <strong>Teachers Present:</strong> {totalPresentTeachers}
          </div>
          <div>
            <strong>Teachers Absent:</strong> {totalAbsentTeachers}
          </div>
          <div>
            <strong>Students Present:</strong> {totalPresent}
          </div>
          <div>
            <strong>Students Absent:</strong> {totalAbsent}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Loading attendance data...
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Teacher Attendance Table */}
        {!loading &&
          !error &&
          attendanceSummary.length > 0 &&
          (printMode === "both" || printMode === "teachers") && (
            <div className="mb-8">
              <div className="no-print">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  👨‍🏫 Teacher Attendance
                </h2>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full print-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teacher Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Punch Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceSummary.map((teacher, index) => (
                      <tr key={teacher.teacherId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.fullName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {teacher.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {teacher.punches && teacher.punches.length > 0 ? (
                            teacher.punches.map((punch, punchIndex) => (
                              <div key={punchIndex} className="mb-2">
                                <span className="font-semibold">
                                  {punch.type}:
                                </span>{" "}
                                {new Date(punch.time).toLocaleTimeString()}
                                <br />
                                <small className="text-gray-400">
                                  Lat: {punch.latitude}, Lon: {punch.longitude}
                                </small>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">
                              No punches recorded
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              teacher.punches && teacher.punches.length > 0
                                ? "bg-green-100 text-green-800 status-present"
                                : "bg-red-100 text-red-800 status-absent"
                            }`}
                          >
                            {teacher.punches && teacher.punches.length > 0
                              ? "Present"
                              : "Absent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* Student Attendance Table */}
        {!loading &&
          !error &&
          filteredStudents.length > 0 &&
          (printMode === "both" || printMode === "students") && (
            <div className="mb-8 print-break">
              <div className="no-print">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  👨‍🎓 Student Attendance
                </h2>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="w-full print-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr. No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Card No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admission No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.studentName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.idcardNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.Admission_Number}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.class_}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.sectionclass}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              attendance[student.id] === "present"
                                ? "bg-green-100 text-green-800 status-present"
                                : "bg-red-100 text-red-800 status-absent"
                            }`}
                          >
                            {attendance[student.id] === "present"
                              ? "Present"
                              : "Absent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        {/* No Data Messages */}
        {!loading && !error && attendanceSummary.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              📋 No teacher attendance records found for the selected date
              range.
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          filteredStudents.length === 0 &&
          students.length > 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">
                🔍 No students found matching your search criteria.
              </div>
            </div>
          )}
      </div>
    </>
  );
};

export default DailyAttendanceSummary;
