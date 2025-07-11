import React from 'react';

const activities = [
  {
    date: 'March 5, 2025',
    name: 'Inter-School Debate',
    category: 'Academic',
    result: 'Runner-Up',
  },
  {
    date: 'Feb 20, 2025',
    name: 'Annual Sports Day - 100m Race',
    category: 'Sports',
    result: '1st Place',
  },
  {
    date: 'Jan 10, 2025',
    name: 'Art & Craft Exhibition',
    category: 'Cultural',
    result: 'Participation',
  },
];

const certificates = [
  {
    title: 'Best Debater - Zonal Level',
    date: 'March 5, 2025',
    issuer: 'District Education Board',
  },
  {
    title: 'Gold Medal - 100m Race',
    date: 'Feb 20, 2025',
    issuer: 'School Sports Committee',
  },
];

const ActivitiesPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 bg-white shadow-md rounded-2xl border border-gray-200">
      <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Student Activity Report</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Total Activities</p>
          <p className="text-lg font-bold">{activities.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Sports</p>
          <p className="text-lg font-bold">1</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Academic</p>
          <p className="text-lg font-bold">1</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Cultural</p>
          <p className="text-lg font-bold">1</p>
        </div>
      </div>

      {/* Activity Log */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Activity Timeline</h2>
      <div className="space-y-4 mb-10">
        {activities.map((activity, idx) => (
          <div key={idx} className="p-4 border rounded-lg hover:bg-gray-50 transition">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-blue-700">{activity.name}</h3>
              <span className="text-sm text-gray-500">{activity.date}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Category: <strong>{activity.category}</strong></p>
            <p className="text-sm text-gray-600">Result: <strong>{activity.result}</strong></p>
          </div>
        ))}
      </div>

      {/* Certificates */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Certificates & Awards</h2>
      <div className="space-y-3">
        {certificates.map((cert, idx) => (
          <div key={idx} className="p-4 border border-dashed rounded-lg bg-gray-50">
            <h3 className="text-md font-semibold text-green-700">{cert.title}</h3>
            <p className="text-sm text-gray-600">Issued by: {cert.issuer}</p>
            <p className="text-sm text-gray-500">Date: {cert.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesPage;
