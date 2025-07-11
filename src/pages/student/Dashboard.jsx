import React, { useEffect, useState } from "react";
import { Book, Calendar, Clock, Bell } from "lucide-react";

const StudentDashboard = () => {
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [error, setError] = useState(null);

  // Replace with actual studentId (from auth or context)
  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    // Fetch published results for this student
    const fetchResults = async () => {
      try {
        setLoadingResults(true);
        setError(null);
        // Adjust endpoint and params as per your backend
        const res = await fetch(
          `/api/results/published?studentId=${studentId}`
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.publications || []);
        } else {
          setError(data.message || "Failed to fetch results");
        }
      } catch (err) {
        setError("Error fetching results");
      } finally {
        setLoadingResults(false);
      }
    };
    if (studentId) fetchResults();
  }, [studentId]);

  const upcomingClasses = [
    { subject: "Mathematics", time: "09:00 AM", teacher: "Mr. Smith" },
    { subject: "Science", time: "10:30 AM", teacher: "Mrs. Johnson" },
    { subject: "English", time: "12:00 PM", teacher: "Ms. Davis" },
  ];

  const recentAnnouncements = [
    {
      title: "Annual Sports Day",
      date: "2024-03-25",
      content: "Annual sports day will be held next week.",
    },
    {
      title: "Parent-Teacher Meeting",
      date: "2024-03-28",
      content: "PTM scheduled for next Thursday.",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Subjects</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-600">6</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Attendance</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">92%</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Study Hours</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-600">24h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Today's Classes
          </h2>
          <div className="space-y-4">
            {upcomingClasses.map((class_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {class_.subject}
                  </h3>
                  <p className="text-sm text-gray-600">{class_.teacher}</p>
                </div>
                <span className="text-sm text-gray-600">{class_.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Announcements
            </h2>
          </div>
          <div className="space-y-4">
            {recentAnnouncements.map((announcement, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium text-gray-800">
                  {announcement.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {announcement.content}
                </p>
                <span className="text-xs text-gray-500">
                  {announcement.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Published Results
        </h2>
        {loadingResults ? (
          <p>Loading results...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : results.length === 0 ? (
          <p>No results published yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Exam</th>
                  <th className="border px-2 py-1">Class</th>
                  <th className="border px-2 py-1">Semester</th>
                  <th className="border px-2 py-1">English</th>
                  <th className="border px-2 py-1">Hindi</th>
                  <th className="border px-2 py-1">Maths</th>
                  <th className="border px-2 py-1">Science</th>
                  <th className="border px-2 py-1">Social Science</th>
                  <th className="border px-2 py-1">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {results.map((pub, i) =>
                  pub.results.map((r, j) => (
                    <tr key={r.id || `${i}-${j}`}>
                      <td className="border px-2 py-1">{pub.examType}</td>
                      <td className="border px-2 py-1">{pub.class?.className || ""}</td>
                      <td className="border px-2 py-1">{pub.semester}</td>
                      <td className="border px-2 py-1">{r.englishTheory ?? "-"}</td>
                      <td className="border px-2 py-1">{r.hindiTheory ?? "-"}</td>
                      <td className="border px-2 py-1">
                        {r.mathematicsTheory ?? "-"}
                        {r.mathPractical ? ` + ${r.mathPractical}` : ""}
                      </td>
                      <td className="border px-2 py-1">
                        {r.scienceTheory ?? "-"}
                        {r.sciencePractical ? ` + ${r.sciencePractical}` : ""}
                      </td>
                      <td className="border px-2 py-1">{r.socialScience ?? "-"}</td>
                      <td className="border px-2 py-1">{pub.remarks ?? "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentDashboard;
