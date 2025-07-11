import React from 'react';

const subjects = [
  { name: 'Mathematics', marks: 92, grade: 'A+' },
  { name: 'Science', marks: 88, grade: 'A' },
  { name: 'English', marks: 85, grade: 'A' },
  { name: 'History', marks: 78, grade: 'B+' },
  { name: 'Physical Education', marks: 95, grade: 'A+' },
];

const Academic= () => {
  const totalMarks = subjects.reduce((acc, subject) => acc + subject.marks, 0);
  const average = (totalMarks / subjects.length).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h1 className="text-2xl font-bold text-center text-black mb-4">Academic Report Card</h1>

      <div className="mb-6">
        <p><span className="font-semibold">Student Name:</span> John Doe</p>
        <p><span className="font-semibold">Class:</span> 8th Grade</p>
        <p><span className="font-semibold">Roll No:</span> 23</p>
        <p><span className="font-semibold">Academic Year:</span> 2024–2025</p>
      </div>

      <table className="w-full text-left border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Subject</th>
            <th className="border px-4 py-2">Marks</th>
            <th className="border px-4 py-2">Grade</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{subject.name}</td>
              <td className="border px-4 py-2">{subject.marks}</td>
              <td className="border px-4 py-2">{subject.grade}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-semibold">
            <td className="border px-4 py-2">Average</td>
            <td className="border px-4 py-2">{average}</td>
            <td className="border px-4 py-2">—</td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-6">
        <p className="text-sm text-gray-600">Remarks: <span className="italic">Excellent performance. Keep it up!</span></p>
      </div>
    </div>
  );
};

export default Academic;
