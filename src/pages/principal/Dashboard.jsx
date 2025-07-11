import { useState, useEffect } from "react";
import {
  Users,
  GraduationCap,
  UserCheck,
  Award,
  Bell,
  Search,
  Settings,
  Plus,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  BookOpen,
  FileText,
  UserPlus,
  CalendarPlus,
  Mail,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PieChart, Pie, Cell } from "recharts";

import { Link } from "react-router-dom";
import { BiIdCard, BiMoney } from "react-icons/bi";
import { FaRupeeSign } from "react-icons/fa";
import axios from "axios";

export default function PrincipalDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState();
  const [schoolId, setSchoolId] = useState(null);
  const [enquiries, setEnquiries] = useState([]); // Dynamic enquiries
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [enquiriesError, setEnquiriesError] = useState(null);

  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      if (!userRaw) return;

      const parsed = JSON.parse(userRaw);
      const schoolId = parsed?.user?.schools?.[0]?.id;

      if (schoolId) {
        setSchoolId(schoolId); // assume setSchoolId is from useState
      }
    } catch (err) {
      console.error("Error parsing user from localStorage:", err);
    }
  }, []);
  console.log("School ID:", schoolId);

  useEffect(() => {
    // Set default zoom to 80% for this page
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "85%";
    return () => {
      document.body.style.zoom = prevZoom || "";
    };
  }, []);

  // Student Attendance Chart Data
  const [attendanceChartData, setAttendanceChartData] = useState([]);

  // Fetch and process student attendance for chart
  useEffect(() => {
    if (!schoolId) return;
    const token = localStorage.getItem("principal_token");
    // Example: last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];
    axios
      .get(`http://localhost:5002/api/attendance/school/${schoolId}`, {
        params: { startDate: startStr, endDate: endStr, schoolId },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((attendanceRes) => {
        const records = attendanceRes.data.data || [];
        // Group by date
        const dateMap = {};
        records.forEach((record) => {
          const date = record.date?.slice(0, 10);
          if (!date) return;
          if (!dateMap[date]) dateMap[date] = { Present: 0, Absent: 0 };
          if (record.status === "present") dateMap[date].Present++;
          else dateMap[date].Absent++;
        });
        // Format for recharts
        const chartData = Object.entries(dateMap).map(([day, val]) => ({
          day,
          ...val,
        }));
        setAttendanceChartData(chartData);
      });
  }, [schoolId]);

  const COLORS = ["#000000", "#787878 "]; // Black for boys, gray for girls

  const messages = [
    {
      sender: "Dr. Sarah Johnson",
      message: "Monthly attendance report needs review before submission.",
      time: "9:00 AM",
      unread: true,
    },
    {
      sender: "Mr. David Chen",
      message: "Budget proposal for new laboratory equipment ready.",
      time: "8:30 AM",
      unread: true,
    },
    {
      sender: "Ms. Emily Rodriguez",
      message: "Student disciplinary meeting scheduled for tomorrow.",
      time: "Yesterday",
      unread: false,
    },
  ];
  const admissionEnquiries = [
    {
      name: "Ravi Kumar",
      studentClass: "6",
      phone: "9876543210",
      email: "ravi@example.com",
    },
    {
      name: "Sana Ansari",
      studentClass: "1",
      phone: "9123456789",
      email: "sana@example.com",
    },
    {
      name: "Arjun Mehta",
      studentClass: "9",
      phone: "8765432109",
      email: "arjun@example.com",
    },
  ];

  const quickActions = [
    {
      icon: UserPlus,
      label: "Add Student",
      linkTo: "/principal/register-student",
    },
    {
      icon: GraduationCap,
      label: "Add Teacher",
      linkTo: "/principal/register-teacher",
    },
    {
      icon: BiMoney,
      label: "Fees Management",
      linkTo: "/principal/School-Fees-Management",
    },
    {
      icon: FaRupeeSign,
      label: "Salary Management",
      linkTo: "/principal/salary-management",
    },
    {
      icon: BiIdCard,
      label: "Generate TC ",
      linkTo: "/principal/transferCertificate",
    },
    {
      icon: Mail,
      label: "Send Notice",
      linkTo: "/principal/add-notice",
    },
  ];

  useEffect(() => {
    if (!schoolId) return;

    axios
      .get(`http://localhost:5002/api/dashboard/${schoolId}`)
      .then((response) => {
        const data = response.data;

        if (data.stats && Array.isArray(data.stats)) {
          const [studentData, teacherData, presentTeacherData] = data.stats;

          if (studentData) {
            setStudentStats((prev) => ({
              ...prev,
              ...studentData,
            }));
          }

          if (teacherData) {
            setTeacherStats((prev) => ({
              ...prev,
              ...teacherData,
            }));
          }

          if (presentTeacherData) {
            setPresentTeacherStats((prev) => ({
              ...prev,
              ...presentTeacherData,
            }));
          }
        }

        if (data.genderData) {
          setGenderData(data.genderData);
        }
      })
      .catch((error) => {
        console.error("Dashboard API error:", error);
      });
  }, [schoolId]);

  useEffect(() => {
    // Fetch latest admission enquiries
    const principalToken =
      localStorage.getItem("principal_token") || "your_principal_token_here";
    setEnquiriesLoading(true);
    setEnquiriesError(null);
    axios
      .get("http://localhost:5002/api/enquiry", {
        headers: {
          Authorization: `Bearer ${principalToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setEnquiries(response.data.slice(0, 5)); // Show only latest 5
      })
      .catch((err) => {
        setEnquiriesError("Failed to load enquiries.");
      })
      .finally(() => setEnquiriesLoading(false));
  }, []);

  // Fetch present teachers count for today
  useEffect(() => {
    if (!schoolId) return;
    const token = localStorage.getItem("principal_token");
    const today = new Date().toISOString().split("T")[0];
    axios
      .get(`http://localhost:5002/api/teacher-attendance/daily-summary`, {
        params: { schoolId, date: today },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = response.data.data || [];
        const presentCount = data.filter(
          (t) => t.punches && t.punches.length > 0
        ).length;
        setPresentTeacherStats((prev) => ({
          ...prev,
          value: presentCount,
        }));
      })
      .catch((err) => {
        setPresentTeacherStats((prev) => ({
          ...prev,
          value: "0",
        }));
      });
  }, [schoolId]);

  const [studentStats, setStudentStats] = useState({
    title: "Students",
    value: "0",
    change: "+0",
    trend: "up",
    icon: Users,
    color: "bg-gray-100",
    linkTo: "/principal/admissions",
  });

  const [teacherStats, setTeacherStats] = useState({
    title: "Teachers",
    value: "0",
    change: "-0",
    trend: "down",
    icon: GraduationCap,
    color: "bg-black text-white",
    linkTo: "/principal/teachers",
  });

  const [presentTeacherStats, setPresentTeacherStats] = useState({
    title: "Present Teachers",
    value: "0",
    icon: UserCheck,
    color: "bg-gray-100",
    linkTo: "/principal/teachers",
  });

  const [genderData, setGenderData] = useState([
    { name: "Boys", value: 0 },
    { name: "Girls", value: 0 },
  ]);
  return (
    <div className="min-h-screen p-6">
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <Link to={action.linkTo} key={index}>
              <button className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-black hover:shadow-lg transition-all duration-300 group w-full">
                <action.icon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm font-medium text-center">
                  {action.label}
                </span>
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/principal/admissions">
          <div
            className={`${studentStats.color} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-95`}
          >
            <div className="flex items-center justify-between mb-4">
              <studentStats.icon className="w-8 h-8" />
              <div
                className={`flex items-center space-x-1 ${
                  studentStats.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {studentStats.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {studentStats.change}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{studentStats.value}</div>
            <div
              className={`text-sm ${
                studentStats.color.includes("black")
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {studentStats.title}
            </div>
          </div>
        </Link>
        <Link to="/principal/teachers">
          <div
            className={`${teacherStats.color} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-95`}
          >
            <div className="flex items-center justify-between mb-4">
              <teacherStats.icon className="w-8 h-8" />
              <div
                className={`flex items-center space-x-1 ${
                  teacherStats.trend === "up"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {teacherStats.trend === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {teacherStats.change}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{teacherStats.value}</div>
            <div
              className={`text-sm ${
                teacherStats.color.includes("black")
                  ? "text-gray-300"
                  : "text-gray-600"
              }`}
            >
              {teacherStats.title}
            </div>
          </div>
        </Link>
        {/* <Link to="/"> */}
        <div
          className={`${presentTeacherStats.color} p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-95`}
        >
          <div className="flex items-center justify-between mb-4">
            <presentTeacherStats.icon className="w-8 h-8" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {presentTeacherStats.value}
          </div>
          <div
            className={`text-sm ${
              presentTeacherStats.color.includes("black")
                ? "text-gray-300"
                : "text-gray-600"
            }`}
          >
            {presentTeacherStats.title}
          </div>
        </div>
        {/* </Link> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Student Attendance</h3>
              <div className="flex items-center space-x-4">
                <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={attendanceChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" stackId="a" fill="#000000" />
                <Bar dataKey="Absent" stackId="a" fill="#787878" />
              </BarChart>
            </ResponsiveContainer>

            <div className="text-center mt-4">
              <span className="text-2xl font-bold">92%</span>
              <span className="text-gray-600 ml-2">Average Attendance</span>
            </div>
          </div>
        </div>

        {/* Gender Pie Chart */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8 flex flex-col lg:flex-row gap-6">
        {/* Messages */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg max-h-[500px] flex-1 lg:max-w-[33.33%] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Messages</h3>
            <button className="text-sm text-gray-500 hover:text-black transition-colors duration-200">
              View All
            </button>
          </div>

          <div
            className="space-y-4 overflow-y-auto pr-2"
            style={{ maxHeight: "400px" }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {message.sender
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{message.sender}</div>
                    <div className="text-xs text-gray-500">{message.time}</div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {message.message}
                  </div>
                  {message.unread && (
                    <div className="w-2 h-2 bg-black rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Enquiries */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-lg flex-1 lg:max-w-[66.66%] flex flex-col justify-between">
          <div>
            <div className="flex justify-between ">
              <h3 className="text-lg font-semibold mb-4">
                Recent Admission Enquiries
              </h3>
              <div className="">
                <button className="text-sm text-gray-500 hover:text-black transition-colors duration-200">
                  View All
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              {enquiriesLoading ? (
                <div className="p-4 text-gray-500">Loading enquiries...</div>
              ) : enquiriesError ? (
                <div className="p-4 text-red-500">{enquiriesError}</div>
              ) : (
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-100 font-medium">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Class</th>
                      <th className="px-4 py-2">Phone</th>
                      <th className="px-4 py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.length > 0 ? (
                      enquiries.map((enquiry, index) => (
                        <tr key={enquiry.id || index} className="border-b">
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2 font-medium">
                            {enquiry.name}
                          </td>
                          <td className="px-4 py-2">{enquiry.class}</td>
                          <td className="px-4 py-2">📞 {enquiry.mobile}</td>
                          <td className="px-4 py-2">
                            {enquiry.email ? `✉️ ${enquiry.email}` : "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-4 text-center text-gray-400"
                        >
                          No enquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
