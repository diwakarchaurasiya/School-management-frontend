import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const TeacherSalaryManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    assignedClass: "",
    assignedSection: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [schoolId, setSchoolId] = useState(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get schoolId from localStorage
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    setSchoolId(schoolId);
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    const fetchTeachers = async () => {
      try {
        const principal_token = localStorage.getItem("principal_token");
        const response = await axios.get(
          `https://api.jsic.in/api/teacher/teachers/by-school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );
        setTeachers(response.data.teachers || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [schoolId]);

  // Filter teachers based on class and section
  const filteredTeachers = teachers.filter((teacher) => {
    return (
      (filters.assignedClass === "" ||
        teacher.assignedClass === filters.assignedClass) &&
      (filters.assignedSection === "" ||
        teacher.assignedSection === filters.assignedSection)
    );
  });

  // Extract unique classes and sections
  const classes = [...new Set(teachers.map((teacher) => teacher.assignedClass))]
    .filter(Boolean)
    .sort();
  const sections = [
    ...new Set(teachers.map((teacher) => teacher.assignedSection)),
  ]
    .filter(Boolean)
    .sort();

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  // Handle Salary Update - Get the highest paid month index
  const handleSalaryUpdate = (teacher) => {
    setSelectedTeacher(teacher);
    const paidMonths = teacher.setSelectedMonthIndex
      ? teacher.setSelectedMonthIndex.split(",")
      : [];
    const lastPaidIndex = months.findIndex(
      (month) => month === paidMonths[paidMonths.length - 1]
    );
    setSelectedMonthIndex(lastPaidIndex);
  };

  const handleSubmit = async () => {
    if (!selectedTeacher || selectedMonthIndex === -1) return;

    try {
      const paidMonths = months.slice(0, selectedMonthIndex + 1);
      const principal_token = localStorage.getItem("principal_token");
      await axios.put(
        `https://api.jsic.in/api/teacher/teacher/${selectedTeacher.id}/salaryPaid`,
        { salaryPaid: paidMonths },
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      // Refresh the teacher list after successful update
      const response = await axios.get(
        `https://api.jsic.in/api/teacher/teachers/by-school/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );
      setTeachers(response.data.teachers || []);
      toast.success("Salary data updated successfully.");
      setSelectedTeacher(null);
      setSelectedMonthIndex(-1);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred."
      );
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "An unexpected error occurred."
      );
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      assignedClass: "",
      assignedSection: "",
    });
    setCurrentPage(1);
  };

  if (loading) return <AdmissionsSkeleton />;

  if (error)
    return (
      <div
        className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4"
        role="alert"
      >
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );

  return (
    <div className="container mx-auto p-4 w-full">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            <FiDollarSign className="inline mr-2" />
            Teacher Salary Management
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FiFilter className="mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  name="assignedClass"
                  value={filters.assignedClass}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  name="assignedSection"
                  value={filters.assignedSection}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {sections.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class/Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Months
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTeachers.length > 0 ? (
                currentTeachers.map((teacher) => {
                  const paidMonths = teacher.setSelectedMonthIndex
                    ? teacher.setSelectedMonthIndex.split(",")
                    : [];
                  const lastPaidIndex = months.findIndex(
                    (month) => month === paidMonths[paidMonths.length - 1]
                  );

                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {teacher.teacherId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.assignedClass} - {teacher.assignedSection}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.specialization}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {months.map((month, index) => {
                            const isPaid = index <= lastPaidIndex;
                            return (
                              <span
                                key={month}
                                className={`px-2 py-1 text-xs rounded ${
                                  isPaid
                                    ? "bg-green-200 text-green-800"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {month.substring(0, 3)}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleSalaryUpdate(teacher)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <FiCalendar className="mr-1" />
                          Update Salary
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No teachers found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTeachers.length > itemsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredTeachers.length)} of{" "}
              {filteredTeachers.length} teachers
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <FiChevronLeft />
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}

        {/* Modal to update salary */}
        {selectedTeacher && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Update Teacher Salary
                </h2>
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setSelectedMonthIndex(-1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-700">
                  {selectedTeacher.teacherName}
                </h3>
                <p className="text-sm text-gray-500">
                  Employee ID: {selectedTeacher.employeeId} | Department:{" "}
                  {selectedTeacher.department}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Select up to which month salary is paid:
                </p>
                <div className="flex flex-wrap gap-2">
                  {months.map((month, index) => (
                    <button
                      type="button"
                      key={month}
                      onClick={() => setSelectedMonthIndex(index)}
                      className={`text-sm px-3 py-2 rounded-md border ${
                        selectedMonthIndex >= 0 && index <= selectedMonthIndex
                          ? "bg-black text-white border-black"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setSelectedTeacher(null);
                    setSelectedMonthIndex(-1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={selectedMonthIndex === -1}
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    selectedMonthIndex === -1
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm Salary Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSalaryManagement;
