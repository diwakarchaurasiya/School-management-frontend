import React from "react";

const AdmissionsSkeleton = () => {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-300 rounded"></div>
        <div className="h-10 w-36 bg-gray-300 rounded"></div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center justify-between space-x-4">
        <div className="h-10 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-10 w-24 bg-gray-300 rounded"></div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-9 gap-4 bg-gray-100 p-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-300 rounded"></div>
          ))}
        </div>

        {/* Table rows */}
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-9 gap-4 p-4 border-t border-gray-100 items-center"
          >
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdmissionsSkeleton;
