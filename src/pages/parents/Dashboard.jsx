import React, { useEffect, useState } from "react";
import { Book, Calendar, Clock, Bell } from "lucide-react";

const ParentsDashboard = () => {
  const childrenDetails = [
    { name: "John Smith", grade: "Grade 8", rollNo: "A123", studentId: "studentid1" },
    { name: "Emily Smith", grade: "Grade 5", rollNo: "B456", studentId: "studentid2" },
  ];

  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const allResults = {};
        for (const child of childrenDetails) {
          // Adjust endpoint as per your backend
          const res = await fetch(`/api/results/published?studentId=${child.studentId}`);
          const data = await res.json();
          if (data.success) {
            allResults[child.studentId] = data.publications || [];
          } else {
            allResults[child.studentId] = [];
          }
        }
        setResults(allResults);
      } catch (err) {
        setError("Error fetching results");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const upcomingEvents = [
    { subject: "Parent-Teacher Meeting", time: "09:00 AM", date: "2024-04-15" },
    { subject: "Annual Day Practice", time: "10:30 AM", date: "2024-04-18" },
    { subject: "Sports Day", time: "12:00 PM", date: "2024-04-20" },
  ];

  const recentAnnouncements = [
    {
      title: "Annual Sports Day",
      date: "2024-03-25",
      content: "Annual sports day will be held next week. Parents are welcome to attend.",
    },
    {
      title: "Parent-Teacher Meeting",
      date: "2024-03-28",
      content: "PTM scheduled for next Thursday. Please confirm your attendance.",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Parents Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Children</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-600">{childrenDetails.length}</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">Due Fees</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">₹5000</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex itemsCenter gap-3">
            <Clock className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Pending Forms</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-600">2</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Children Details
          </h2>
          <div className="space-y-4">
            {childrenDetails.map((child, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">{child.name}</h3>
                  <p className="text-sm text-gray-600">{child.grade}</p>
                </div>
                <span className="text-sm text-gray-600">{child.rollNo}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Announcements
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

      {/* Published Results Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Published Results
        </h2>
        {loading ? (
          <p>Loading results...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          childrenDetails.map((child) => (
            <div key={child.studentId} className="mb-6">
              <h3 className="font-medium text-gray-700 mb-2">
                {child.name} ({child.grade})
              </h3>
              {results[child.studentId] && results[child.studentId].length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border mb-4">
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
                      {results[child.studentId].map((pub, i) =>
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
              ) : (
                <p className="text-gray-500 mb-4">No results published yet.</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentsDashboard;
