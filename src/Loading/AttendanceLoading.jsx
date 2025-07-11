import React from "react";

const AttendanceSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-300 rounded"></div>
        <div className="flex items-center space-x-4">
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
          <div className="h-8 w-24 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Search */}
      <div className="h-10 w-1/3 bg-gray-300 rounded"></div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-3 gap-4 bg-gray-100 p-4">
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
          <div className="h-4 w-full bg-gray-300 rounded"></div>
        </div>

        {/* Table rows */}
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-3 gap-4 p-4 border-t border-gray-100 items-center"
          >
            {/* Roll No */}
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            {/* Student Name */}
            <div className="h-4 w-40 bg-gray-200 rounded"></div>
            {/* Attendance actions */}
            <div className="flex space-x-2">
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
        <div className="h-10 w-36 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default AttendanceSkeleton;
