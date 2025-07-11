import React from 'react';

const attendanceData = [
  { date: '2025-04-01', status: 'Present' },
  { date: '2025-04-02', status: 'Absent' },
  { date: '2025-04-03', status: 'Present' },
  { date: '2025-04-04', status: 'Present' },
  { date: '2025-04-05', status: 'Late' },
  // Add more days here
];

const ParentsAttendances = () => {
  const totalDays = attendanceData.length;
  const presentDays = attendanceData.filter(day => day.status === 'Present').length;
  const absentDays = attendanceData.filter(day => day.status === 'Absent').length;
  const lateDays = attendanceData.filter(day => day.status === 'Late').length;
  const attendancePercent = ((presentDays / totalDays) * 100).toFixed(1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'text-green-600';
      case 'Absent': return 'text-red-600';
      case 'Late': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-2xl border border-gray-200 mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-4 text-center">Attendance Report</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Total Days</p>
          <p className="text-lg font-bold">{totalDays}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Present</p>
          <p className="text-lg font-bold">{presentDays}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Absent</p>
          <p className="text-lg font-bold">{absentDays}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Late</p>
          <p className="text-lg font-bold">{lateDays}</p>
        </div>
      </div>

      {/* Attendance Table */}
      <h2 className="text-xl font-semibold mb-3 text-gray-800">Monthly Attendance</h2>
      <table className="w-full text-left border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {attendanceData.map((entry, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{entry.date}</td>
              <td className={`border px-4 py-2 font-medium ${getStatusColor(entry.status)}`}>
                {entry.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-6 text-sm text-center text-gray-500">
        Attendance Percentage: <span className="font-bold text-blue-600">{attendancePercent}%</span>
      </div>
    </div>
  );
};

export default ParentsAttendances;
