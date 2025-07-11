import React, { useEffect, useState } from "react";
import axios from "axios";

const ShowNotice = () => {
  const [notices, setNotices] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterOptions = ["Announcements", "Events", "Scholarships", "Exams"];

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await axios.get(
          "https://api.jsic.in/api/notices/notices"
        );
        if (response.data.success) {
          setNotices(response.data.notices.slice(0, 5));
        }
      } catch (err) {
        setError("Failed to load notices.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const toggleFilter = (option) => {
    setFilters((prev) =>
      prev.includes(option)
        ? prev.filter((f) => f !== option)
        : [...prev, option]
    );
  };

  const clearFilters = () => setFilters([]);
  const selectAllFilters = () => setFilters(filterOptions);

  const filteredNotices = filters.length
    ? notices.filter((notice) => filters.includes(notice.tag))
    : notices;

  return (
    <>
      <h2 className="text-2xl font-bold text-black">Important Updates</h2>
      <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Notices Section */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">New Notices</h3>
              <select className="border px-2 py-1 rounded">
                <option>This week</option>
                <option>This month</option>
              </select>
            </div>

            {loading && <p>Loading notices...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && filteredNotices.length === 0 && (
              <p>No notices available.</p>
            )}

            {!loading &&
              !error &&
              filteredNotices.map((notice) => (
                <div key={notice.id} className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm">
                      {notice.publishedBy.fullName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-black">
                        {notice.publishedBy.fullName}
                      </p>
                      <p className="text-gray-600 text-sm">on {notice.title}</p>
                    </div>
                    <span className="ml-auto text-xs text-gray-500">
                      {Math.floor(
                        (Date.now() - new Date(notice.createdAt)) / 3600000
                      )}{" "}
                      hours ago
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{notice.content}</p>
                  {notice.pdfUrl && (
                    <a
                      href={notice.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View PDF
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>

        {/* Filter Sidebar */}
        <div className="bg-white p-4 rounded-xl shadow-lg h-fit">
          <h3 className="font-semibold mb-4">Filter Options</h3>
          <div className="space-y-2">
            {filterOptions.map((option) => (
              <div key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.includes(option)}
                  onChange={() => toggleFilter(option)}
                />
                <label>{option}</label>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              className="bg-black text-white px-2 py-1 text-sm rounded"
              onClick={selectAllFilters}
            >
              Select all
            </button>
            <button
              className="bg-black text-white px-2 py-1 text-sm rounded"
              onClick={clearFilters}
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShowNotice;
