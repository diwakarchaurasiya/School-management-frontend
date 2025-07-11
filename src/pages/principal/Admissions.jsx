import React, { useState, useEffect, useMemo } from "react";
import { UserPlus, Search, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";

const Admissions = () => {
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
  const [pendingPublicApps, setPendingPublicApps] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const classOptions = useMemo(
    () => Array.from(new Set(admissions.map((s) => s.class_).filter(Boolean))),
    [admissions]
  );
  const sectionOptions = useMemo(
    () =>
      Array.from(
        new Set(admissions.map((s) => s.sectionclass).filter(Boolean))
      ),
    [admissions]
  );
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [schoolId, setSchoolId] = useState(null);
  const [confirmAction, setConfirmAction] = useState({ open: false, appId: null, action: null });

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    setSchoolId(schoolId);
  }, []);

  useEffect(() => {
    const fetchAdmissions = async () => {
      if (!schoolId) return;
      try {
        const response = await axios.get(
          `https://api.jsic.in/api/admission/students/by-school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "principal_token"
              )}`,
            },
          }
        );
        const studentsData = response.data?.students || [];
        console.log("Fetched data:", studentsData);
        setAdmissions(studentsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
        setAdmissions([]);
      }
    };

    fetchAdmissions();
  }, [schoolId]);

  useEffect(() => {
    const fetchPendingPublicApps = async () => {
      setLoadingPublic(true);
      try {
        const token = localStorage.getItem("principal_token");
        const res = await axios.get(
          `https://api.jsic.in/api/admission/public-students/by-school/${schoolId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setPendingPublicApps(res.data.publicStudents || []);
        }
      } catch (err) {
        toast.error("Failed to fetch public applications");
      } finally {
        setLoadingPublic(false);
      }
    };
    if (schoolId) fetchPendingPublicApps();
  }, [schoolId]);

  const handleSubmit = (e) => {
    e.preventDefault();
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

  const handleEdit = () => {
    // Always use a fresh copy of the selectedStudent for editing
    setEditData({ ...selectedStudent });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("principal_token");
      // Send all fields in editData, not just changed ones
      const res = await axios.put(
        `https://api.jsic.in/api/admission/students/${selectedStudent.id}`,
        { ...editData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAdmissions((prev) =>
          prev.map((s) => (s.id === selectedStudent.id ? res.data.student : s))
        );
        setSelectedStudent(res.data.student);
        setIsEditing(false);
        toast.success("Student updated successfully!");
      }
    } catch (err) {
      toast.error("Failed to update student");
    }
  };

  const handleDelete = async () => {
    // Show confirmation toast
    const toastId = toast(({ closeToast }) => (
      <div>
        <div className="font-semibold mb-2">
          Are you sure you want to delete this student?
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            onClick={async () => {
              closeToast();
              try {
                const token = localStorage.getItem("principal_token");
                const res = await axios.delete(
                  `https://api.jsic.in/api/admission/students/${selectedStudent.id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.success) {
                  setAdmissions((prev) =>
                    prev.filter((s) => s.id !== selectedStudent.id)
                  );
                  setIsModalOpen(false);
                  toast.success("Student deleted successfully!");
                }
              } catch (err) {
                toast.error("Failed to delete student");
              }
            }}
          >
            Yes
          </button>
          <button
            className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            onClick={closeToast}
          >
            No
          </button>
        </div>
      </div>
    ),
    { autoClose: false, closeOnClick: false });
  };

  const filteredAdmissions = useMemo(() => {
    if (!Array.isArray(admissions)) return [];

    let filtered = admissions; // Show all students for now

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

    if (filter !== "all") {
      filtered = filtered.filter(
        (student) => student.status?.toLowerCase() === filter
      );
    }

    if (classFilter) {
      filtered = filtered.filter((student) => student.class_ === classFilter);
    }

    if (sectionFilter) {
      filtered = filtered.filter(
        (student) => student.sectionclass === sectionFilter
      );
    }

    return filtered;
  }, [admissions, filter, searchQuery, classFilter, sectionFilter]);

  const handlePublicDecision = async (id, decision) => {
    setConfirmAction({ open: false, appId: null, action: null });
    try {
      const token = localStorage.getItem("principal_token");
      const res = await axios.post(
        `https://api.jsic.in/api/admission/public-students/${id}/decision`,
        { decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setPendingPublicApps((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      toast.error("Failed to process application");
    }
  };

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
      <div className="flex items-center justify-between my-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Admissions</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/principal/register-student">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              New Admission
            </button>
          </Link>
          {/* Bulk upload */}
          <form
            encType="multipart/form-data"
            onSubmit={async (e) => {
              e.preventDefault();
              const files = e.target.elements.photos.files;
              const admissionNumbersRaw =
                e.target.elements.admissionNumbers.value;
              const admissionNumbers = admissionNumbersRaw
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              if (files.length !== admissionNumbers.length) {
                toast.error(
                  "Number of photos and admission numbers must match"
                );
                return;
              }

              // Check file sizes (20KB - 50KB)
              for (let i = 0; i < files.length; i++) {
                // if (files[i].size < 20480) {
                //   toast.error(`Photo ${files[i].name} must be at least 20KB`);
                //   return;
                // }
                if (files[i].size > 51200) {
                  toast.error(`Photo ${files[i].name} must not exceed 50KB`);
                  return;
                }
              }

              const formData = new FormData();
              for (let i = 0; i < files.length; i++) {
                formData.append("photos", files[i]);
              }
              formData.append("admissionNumbers", admissionNumbers.join(","));

              try {
                const res = await axios.post(
                  "https://api.jsic.in/api/admission/students/bulk-photo-upload",
                  formData,
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "principal_token"
                      )}`,
                      "Content-Type": "multipart/form-data",
                    },
                  }
                );
                if (res.data.success) {
                  toast.success("Bulk photo upload successful!");
                  // Optionally refresh admissions here
                } else {
                  toast.error(res.data.message || "Bulk upload failed");
                }
              } catch (err) {
                toast.error(
                  err.response?.data?.message || "Bulk upload failed"
                );
              }
            }}
            style={{ display: "inline" }}
          >
            <input
              type="file"
              name="photos"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              id="bulk-photo-upload"
            />
            <input
              type="text"
              name="admissionNumbers"
              placeholder="Admission numbers (comma separated)"
              className="border px-2 py-1 rounded text-xs mr-1"
              style={{ width: 180 }}
              required
            />
            <label
              htmlFor="bulk-photo-upload"
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded cursor-pointer text-xs"
            >
              Select Photos
            </label>
            <button
              type="submit"
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs ml-1"
            >
              Bulk Upload
            </button>
          </form>
        </div>
      </div>

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
                <label className="text-sm text-gray-600">Class:</label>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="border text-sm text-gray-600 rounded px-2 py-1"
                >
                  <option value="">All</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Section:</label>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="border text-sm text-gray-600 rounded px-2 py-1"
                >
                  <option value="">All</option>
                  {sectionOptions.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded shadow mt-4">
          <table
            className="min-w-full border text-sm"
            id="admissions-students-table"
          >
            <thead className="bg-gray-100 sticky top-0 ">
              <tr>
                <th className="border px-2 py-1">Photo</th>
                <th className="border px-2 py-1">Admission</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Student ID Card No.</th>
                <th className="border px-2 py-1">Class</th>
                <th className="border px-2 py-1">Section</th>
                <th className="border px-2 py-1">Father's Name</th>
                <th className="border px-2 py-1">Mother's Name</th>
                <th className="border px-2 py-1">Contact</th>
                <th className="border px-2 py-1">Email</th>
                <th className="border px-2 py-1">PEN Number</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-2 text-gray-500">
                    No students found.
                    <br />
                    {process.env.NODE_ENV === "development" && (
                      <small className="text-gray-400">
                        Total records in admissions: {admissions.length}
                      </small>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAdmissions
                  .slice()
                  .sort((a, b) => {
                    const numA = Number(a.Admission_Number);
                    const numB = Number(b.Admission_Number);
                    if (!isNaN(numA) && !isNaN(numB)) {
                      return numA - numB;
                    }
                    // Fallback to string comparison
                    return (a.Admission_Number || "").localeCompare(
                      b.Admission_Number || ""
                    );
                  })
                  .map((student, idx) => (
                    <tr
                      key={student._id || student.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50 hover:bg-blue-50 transition"
                      }
                    >
                      <td className="border px-2 py-1">
                        <img
                          src={
                            student.photo
                              ? `https://api.jsic.in/${student.photo.replace(/\\/g, "/")}`
                              : "/no-photo.png"
                          }
                          alt="Student Photo"
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/no-photo.png";
                          }}
                        />
                        <form
                          style={{ display: "inline" }}
                          encType="multipart/form-data"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              // Check file size (20KB - 50KB)
                              // if (file.size < 20480) {
                              //   toast.error("Photo must be at least 20KB");
                              //   return;
                              // }
                              if (file.size > 51200) {
                                toast.error("Photo must not exceed 50KB");
                                return;
                              }
                              const formData = new FormData();
                              formData.append("photo", file);
                              try {
                                const res = await axios.post(
                                  `https://api.jsic.in/api/admission/students/${student.Admission_Number}/photo`,
                                  formData,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "principal_token"
                                      )}`,
                                      "Content-Type": "multipart/form-data",
                                    },
                                  }
                                );
                                if (res.data.success) {
                                  setAdmissions((prev) =>
                                    prev.map((s) =>
                                      s.Admission_Number ===
                                      student.Admission_Number
                                        ? { ...s, photo: res.data.photoUrl }
                                        : s
                                    )
                                  );
                                  toast.success("Photo uploaded!");
                                } else {
                                  toast.error(
                                    res.data.message || "Photo upload failed"
                                  );
                                }
                              } catch (err) {
                                toast.error(
                                  err.response?.data?.message ||
                                    "Photo upload failed"
                                );
                              }
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            id={`photo-upload-${student.Admission_Number}`}
                          />
                          <label
                            htmlFor={`photo-upload-${student.Admission_Number}`}
                            className="text-xs text-blue-600 underline cursor-pointer ml-2"
                            title="Update Photo"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="inline h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                              />
                            </svg>
                          </label>
                        </form>
                        {/* Delete Photo Icon */}
                        {student.photo && (
                          <button
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Delete Photo"
                            onClick={async () => {
                              if (
                                !window.confirm("Delete this student's photo?")
                              )
                                return;
                              try {
                                const res = await axios.delete(
                                  `https://api.jsic.in/api/admission/students/${student.Admission_Number}/photo`,
                                  {
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "principal_token"
                                      )}`,
                                    },
                                  }
                                );
                                if (res.data.success) {
                                  setAdmissions((prev) =>
                                    prev.map((s) =>
                                      s.Admission_Number ===
                                      student.Admission_Number
                                        ? { ...s, photo: null }
                                        : s
                                    )
                                  );
                                  toast.success("Photo deleted!");
                                } else {
                                  toast.error(
                                    res.data.message || "Photo delete failed"
                                  );
                                }
                              } catch (err) {
                                toast.error(
                                  err.response?.data?.message ||
                                    "Photo delete failed"
                                );
                              }
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="inline h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        {student.Admission_Number}
                      </td>
                      <td className="border px-2 py-1 font-semibold">
                        {student.studentName}
                      </td>
                      <td className="border px-2 py-1">
                        {student.idcardNumber}
                      </td>
                      <td className="border px-2 py-1">{student.class_}</td>
                      <td className="border px-2 py-1">
                        {student.sectionclass}
                      </td>
                      <td className="border px-2 py-1">{student.fatherName}</td>
                      <td className="border px-2 py-1">{student.motherName}</td>
                      <td className="border px-2 py-1">{student.phone}</td>
                      <td className="border px-2 py-1">{student.email}</td>
                      <td className="border px-2 py-1">{student.penNumber}</td>
                      <td className="border px-2 py-1">
                        {student.isActive ? (
                          <span className="text-green-600 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className={`text-sm flex items-center gap-1 px-2 py-1 rounded
                            ${
                              student.isActive
                                ? "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                          onClick={() =>
                            student.isActive && handleViewDetails(student)
                          }
                          disabled={!student.isActive}
                          title={
                            student.isActive
                              ? "View Details"
                              : "Inactive student"
                          }
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

      {/* Pending Public Applications Section */}
      <div className="my-8">
        <h2 className="text-xl font-bold mb-2">Pending Public Applications</h2>
        {loadingPublic ? (
          <div>Loading...</div>
        ) : pendingPublicApps.length === 0 ? (
          <div className="text-gray-500">No pending public applications.</div>
        ) : (
          <table className="min-w-full border text-sm mb-4">
            <thead>
              <tr>
                <td className="border px-2 py-1">Application.No</td>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Class</th>
                <th className="border px-2 py-1">Section</th>
                <th className="border px-2 py-1">Father</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingPublicApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{app.Application_Number}</td>
                  <td className="border px-2 py-1">{app.studentName}</td>
                  <td className="border px-2 py-1">{app.class_}</td>
                  <td className="border px-2 py-1">{app.sectionclass}</td>
                  <td className="border px-2 py-1">{app.fatherName}</td>
                  <td className="border px-2 py-1">{app.phone}</td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                      onClick={() => setConfirmAction({ open: true, appId: app.id, action: "approve" })}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => setConfirmAction({ open: true, appId: app.id, action: "reject" })}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    {isEditing ? (
                      <input
                        name="studentName"
                        value={editData.studentName || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.studentName
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Date of Birth:</span>{" "}
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={editData.dateOfBirth?.slice(0, 10) || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Gender:</span>{" "}
                    {isEditing ? (
                      <input
                        name="gender"
                        value={editData.gender || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.gender
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Aadhar Number:</span>{" "}
                    {isEditing ? (
                      <input
                        name="aadharNumber"
                        value={editData.aadharNumber || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.aadharNumber
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">PEN Number:</span>{" "}
                    {isEditing ? (
                      <input
                        name="penNumber"
                        value={editData.penNumber || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.penNumber
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Class:</span>{" "}
                    {isEditing ? (
                      <input
                        name="class_"
                        value={editData.class_ || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.class_ || selectedStudent.class
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Section:</span>{" "}
                    {isEditing ? (
                      <input
                        name="sectionclass"
                        value={editData.sectionclass || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.sectionclass ||
                      selectedStudent.assignedSection
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Father's Name:</span>{" "}
                    {isEditing ? (
                      <input
                        name="fatherName"
                        value={editData.fatherName || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.fatherName
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Mother's Name:</span>{" "}
                    {isEditing ? (
                      <input
                        name="motherName"
                        value={editData.motherName || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.motherName
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    {isEditing ? (
                      <input
                        name="phone"
                        value={editData.phone || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.phone
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    {isEditing ? (
                      <input
                        name="email"
                        value={editData.email || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.email
                    )}
                  </p>
                  <p>
                    <span className="text-gray-600">Address:</span>{" "}
                    {isEditing ? (
                      <input
                        name="address"
                        value={editData.address || ""}
                        onChange={handleEditChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      selectedStudent.address
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end gap-2 rounded-b-lg">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve/Reject */}
      {confirmAction.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            <h3 className="text-lg font-bold mb-4">
              {confirmAction.action === "approve"
                ? "Are you sure for New Admission?"
                : "Are you sure to Reject this application?"}
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handlePublicDecision(confirmAction.appId, confirmAction.action)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmAction({ open: false, appId: null, action: null })}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admissions;
