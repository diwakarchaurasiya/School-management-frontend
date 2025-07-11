import React from 'react';

const timetable = {
  Monday: [
    { time: '9:00 AM - 10:00 AM', subject: 'Mathematics' },
    { time: '10:00 AM - 11:00 AM', subject: 'English' },
    { time: '11:15 AM - 12:15 PM', subject: 'Science' },
  ],
  Tuesday: [
    { time: '9:00 AM - 10:00 AM', subject: 'Social Studies' },
    { time: '10:00 AM - 11:00 AM', subject: 'Maths' },
    { time: '11:15 AM - 12:15 PM', subject: 'Computer' },
  ],
  Wednesday: [
    { time: '9:00 AM - 10:00 AM', subject: 'English' },
    { time: '10:00 AM - 11:00 AM', subject: 'Science' },
    { time: '11:15 AM - 12:15 PM', subject: 'Art' },
  ],
  Thursday: [
    { time: '9:00 AM - 10:00 AM', subject: 'Maths' },
    { time: '10:00 AM - 11:00 AM', subject: 'English' },
    { time: '11:15 AM - 12:15 PM', subject: 'Sports' },
  ],
  Friday: [
    { time: '9:00 AM - 10:00 AM', subject: 'Science' },
    { time: '10:00 AM - 11:00 AM', subject: 'Social Studies' },
    { time: '11:15 AM - 12:15 PM', subject: 'Music' },
  ],
};

const TimeTable = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-2xl border border-gray-200 mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Weekly Time Table</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Day</th>
              <th className="border px-4 py-2">9:00 - 10:00</th>
              <th className="border px-4 py-2">10:00 - 11:00</th>
              <th className="border px-4 py-2">11:15 - 12:15</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(timetable).map(([day, sessions]) => (
              <tr key={day} className="hover:bg-gray-50">
                <td className="border px-4 py-2 font-medium text-blue-700">{day}</td>
                {sessions.map((session, index) => (
                  <td key={index} className="border px-4 py-2">{session.subject}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimeTable;
