import React from 'react';

const transportDetails = {
  busNumber: 'BUS-12A',
  route: 'Route 5 - East Sector',
  pickupTime: '7:30 AM',
  dropTime: '3:45 PM',
  driverName: 'Mr. Ramesh Kumar',
  driverPhone: '+91 98765 43210',
  busStatus: 'On Time',
};

const Transport = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-2xl border border-gray-200 mt-8">
      <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Transport Details</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-700">
        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-gray-500">Bus Number</p>
          <p className="font-semibold text-lg">{transportDetails.busNumber}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-gray-500">Route</p>
          <p className="font-semibold text-lg">{transportDetails.route}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-gray-500">Pickup Time</p>
          <p className="font-semibold text-lg">{transportDetails.pickupTime}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-gray-500">Drop Time</p>
          <p className="font-semibold text-lg">{transportDetails.dropTime}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-gray-500">Driver Name</p>
          <p className="font-semibold text-lg">{transportDetails.driverName}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl">
          <p className="text-gray-500">Driver Contact</p>
          <p className="font-semibold text-lg">{transportDetails.driverPhone}</p>
        </div>

        <div className="sm:col-span-2 bg-green-100 p-4 rounded-xl text-center">
          <p className="text-sm text-gray-600">Current Bus Status</p>
          <p className="text-xl font-bold text-green-700">{transportDetails.busStatus}</p>
        </div>
      </div>
    </div>
  );
};

export default Transport;
