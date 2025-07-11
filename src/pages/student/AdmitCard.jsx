import React from "react";
import { FileText, User } from "lucide-react";

const AdmitCard = () => {
  const studentInfo = {
    name: "John Doe",
    rollNo: "2024001",
    class: "X",
    section: "A",
    examType: "Final Term Examination 2024",
    subjects: [
      {
        name: "Mathematics",
        date: "2024-04-01",
        time: "09:00 AM - 12:00 PM",
        room: "101",
      },
      {
        name: "Science",
        date: "2024-04-03",
        time: "09:00 AM - 12:00 PM",
        room: "102",
      },
      {
        name: "English",
        date: "2024-04-05",
        time: "09:00 AM - 12:00 PM",
        room: "103",
      },
    ],
  };

  return (
    <div className="max-w-full mx-auto bg-white p-8 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Admit Card</h1>
        </div>
        <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center">
          <User className="h-12 w-12 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-sm text-gray-600">Student Name</p>
          <p className="font-semibold text-gray-800">{studentInfo.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Roll Number</p>
          <p className="font-semibold text-gray-800">{studentInfo.rollNo}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Class</p>
          <p className="font-semibold text-gray-800">{studentInfo.class}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Section</p>
          <p className="font-semibold text-gray-800">{studentInfo.section}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {studentInfo.examType}
        </h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Time
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Room
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {studentInfo.subjects.map((subject, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {subject.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {subject.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {subject.time}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {subject.room}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t">
        <p className="text-sm text-gray-600">Important Instructions:</p>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
          <li>Bring this admit card to every examination</li>
          <li>
            Reach the examination center 30 minutes before the scheduled time
          </li>
          <li>
            Mobile phones and electronic devices are not allowed in the
            examination hall
          </li>
          <li>Follow all examination rules and regulations strictly</li>
        </ul>
      </div>
    </div>
  );
};

export default AdmitCard;
