import React, { useState, useEffect, useMemo } from "react";
import { UserPlus, Search, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";

const MyClassStudents = () => {
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    dateOfBirth: "",
    gender: "",
    grade: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    address: "",
    previousSchool: "",
  });
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("A");

  const CLASS_OPTIONS = ["LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const SECTION_OPTIONS = ["A", "B", "C", "D"];

  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const response = await axios.get(
          "https://api.jsic.in/api/admission/students"
        );
        // Check if response.data.students exists, otherwise use response.data
        const studentsData = response.data.students || response.data || [];
        console.log("Fetched data:", studentsData); // Debug log
        setAdmissions(studentsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err); // Debug log
        setError(err.message);
        setLoading(false);
        setAdmissions([]);
      }
    };

    fetchAdmissions();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle form submission
    console.log("Form submitted:", formData);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const filteredAdmissions = useMemo(() => {
    if (!Array.isArray(admissions)) return [];

    let filtered = admissions;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (student) =>
          student.studentName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.fatherName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.penNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter(
        (student) => student.status?.toLowerCase() === filter
      );
    }

    // Apply class filter
    if (classFilter !== "all") {
      filtered = filtered.filter(
        (student) => student.class_ === classFilter
      );
    }

    // Apply section filter
    filtered = filtered.filter(
      (student) => student.sectionclass === sectionFilter
    );

    return filtered;
  }, [admissions, filter, searchQuery, classFilter, sectionFilter]);

  if (loading) {
    return <AdmissionsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="">
      {/* <div className="flex items-center justify-between my-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
        </div>
        <Link to="/principal/register-student">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Admission
          </button>
        </Link>
      </div> */}

      <div className=" rounded-lg shadow-sm">
        <div className="p-4 border my-4 rounded-md bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 outline-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border-none text-sm text-gray-600 focus:ring-0"
                >
                  <option value="all">All Applications</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="border-none text-sm text-gray-600 focus:ring-0"
                >
                  <option value="all">All Classes</option>
                  {CLASS_OPTIONS.map((cls) => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="border-none text-sm text-gray-600 focus:ring-0"
                >
                  {SECTION_OPTIONS.map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Student ID Card No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Father's Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Mother's Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  PEN Number
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-3 text-sm text-gray-600 text-center"
                  >
                    {loading
                      ? "Loading..."
                      : error
                      ? `Error: ${error}`
                      : "No students found"}
                    <br />
                    {process.env.NODE_ENV === "development" && (
                      <small className="text-gray-400">
                        Total records in admissions: {admissions.length}
                      </small>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((student) => (
                  <tr key={student._id || student.id}>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.idcardNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.class_}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.sectionclass}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.fatherName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.motherName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.phone}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.penNumber}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        onClick={() => handleViewDetails(student)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredAdmissions.length} applications
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Student Details
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700">
                    Personal Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      {selectedStudent.studentName}
                    </p>
                    <p>
                      <span className="text-gray-600">Date of Birth:</span>{" "}
                      {new Date(
                        selectedStudent.dateOfBirth
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="text-gray-600">Gender:</span>{" "}
                      {selectedStudent.gender}
                    </p>
                    <p>
                      <span className="text-gray-600">Aadhar Number:</span>{" "}
                      {selectedStudent.aadharNumber}
                    </p>
                    <p>
                      <span className="text-gray-600">PEN Number:</span>{" "}
                      {selectedStudent.penNumber}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">
                    Academic Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="text-gray-600">Class:</span>{" "}
                      {selectedStudent.class_ || selectedStudent.class}
                    </p>
                    <p>
                      <span className="text-gray-600">Section:</span>{" "}
                      {selectedStudent.sectionclass}
                    </p>
                    <p>
                      <span className="text-gray-600">Subjects:</span>
                    </p>
                    <ul className="list-disc pl-5">
                      {Array.isArray(selectedStudent.subjects)
                        ? selectedStudent.subjects.map((subject, index) => (
                            <li key={index} className="text-gray-600">
                              {subject}
                            </li>
                          ))
                        : selectedStudent.subjects
                            ?.split(",")
                            .map((subject, index) => (
                              <li key={index} className="text-gray-600">
                                {subject.trim()}
                              </li>
                            ))}
                    </ul>
                  </div>
                </div>

                <div className="col-span-2">
                  <h3 className="font-medium text-gray-700">
                    Contact Information
                  </h3>
                  <div className="mt-2 space-y-2">
                    <p>
                      <span className="text-gray-600">Father's Name:</span>{" "}
                      {selectedStudent.fatherName}
                    </p>
                    <p>
                      <span className="text-gray-600">Mother's Name:</span>{" "}
                      {selectedStudent.motherName}
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      {selectedStudent.phone}
                    </p>
                    <p>
                      <span className="text-gray-600">Email:</span>{" "}
                      {selectedStudent.email}
                    </p>
                    <p>
                      <span className="text-gray-600">Address:</span>{" "}
                      {selectedStudent.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyClassStudents;
