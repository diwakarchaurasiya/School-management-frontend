import React from "react";
import { Users, CheckCircle, BookOpen, Bell } from "lucide-react";

const TeacherDashboard = () => {
  const upcomingClasses = [
    {
      class: "10th Grade",
      subject: "Mathematics",
      time: "09:00 AM",
      students: 35,
    },
    {
      class: "9th Grade",
      subject: "Mathematics",
      time: "10:30 AM",
      students: 32,
    },
    {
      class: "8th Grade",
      subject: "Mathematics",
      time: "12:00 PM",
      students: 38,
    },
  ];

  const recentSubmissions = [
    {
      student: "John Doe",
      assignment: "Algebra Quiz",
      status: "Submitted",
      date: "2024-03-20",
    },
    {
      student: "Jane Smith",
      assignment: "Geometry Test",
      status: "Graded",
      date: "2024-03-19",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Total Students
            </h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-600">105</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Classes Today
            </h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">5</p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Assignments</h2>
          </div>
          <p className="mt-2 text-3xl font-bold text-purple-600">12</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Upcoming Classes
          </h2>
          <div className="space-y-4">
            {upcomingClasses.map((class_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {class_.class} - {class_.subject}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {class_.students} students
                  </p>
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
              Recent Submissions
            </h2>
          </div>
          <div className="space-y-4">
            {recentSubmissions.map((submission, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-gray-800">
                    {submission.student}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {submission.assignment}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      submission.status === "Graded"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {submission.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {submission.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
