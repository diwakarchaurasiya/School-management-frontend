import React, { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import {
  Pencil,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  ArrowDownToLine,
} from "lucide-react";
import { toast } from "react-toastify";
import html2pdf from "html2pdf.js";
import { getImageUrl } from "../../utils/getImageUrl";

const API_BASE_URL = "http://localhost:5002/api";
const RESULT_PUBLISH_API = `${API_BASE_URL}/resultpublish`;

const ResultPublish = () => {
  const [students, setStudents] = useState([]);
  const [studentResults, setStudentResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [schoolId, setSchoolId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [publishStatus, setPublishStatus] = useState({});
  const examTypes = ["Quarterly", "Halfyearly", "Annual"];
  const [currentExamType, setCurrentExamType] = useState("Quarterly");
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [expandedClass, setExpandedClass] = useState(null);
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolLogoBase64, setSchoolLogoBase64] = useState(null);
  const [principalSignatureBase64, setPrincipalSignatureBase64] =
    useState(null);
  const [schoolNameFromUser, setSchoolNameFromUser] = useState("");
  const printRef = useRef();
  const [isPrinting, setIsPrinting] = useState(false);
  const [schoolDetails, setSchoolDetails] = useState({
    schoolname: "",
    address: "",
    medium: "",
    phone: "",
    establishmentYear: "",
    affiliationStatus: "",
    schoolAffiliationNumber: "",
  });

  useEffect(() => {
    // Set default zoom to 80% for this page
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "85%";
    return () => {
      document.body.style.zoom = prevZoom || "";
    };
  }, []);
  // Add this function after your existing state declarations
  const fetchPublishStatus = async (classId) => {
    try {
      const principal_token = localStorage.getItem("principal_token");
      const response = await axios.get(
        `${RESULT_PUBLISH_API}/publish-status/${classId}`,
        {
          params: {
            examType: currentExamType || "Annual",
            academicYear,
          },
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );
      return response.data.published;
    } catch (error) {
      console.error(
        `Error fetching publish status for class ${classId}:`,
        error
      );
      return false;
    }
  };

  // Update the fetchLogo function in useEffect
  useEffect(() => {
    const fetchLogo = async () => {
      if (!schoolId) return;

      try {
        const principal_token = localStorage.getItem("principal_token");
        const response = await axios.get(
          `${API_BASE_URL}/newSchool/school-assets/by-school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );

        const data = response.data;
        setSchoolLogo(data.schoolLogo || null);

        // Handle principal signature
        if (data.principalSignature) {
          const signatureResponse = await axios.get(data.principalSignature, {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          });
          const signatureBase64 = await convertBlobToBase64(
            signatureResponse.data
          );
          setPrincipalSignatureBase64(signatureBase64);
        } else {
          setPrincipalSignatureBase64(null);
        }

        // Handle school logo
        if (data.schoolLogo) {
          const logoResponse = await axios.get(data.schoolLogo, {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          });
          const logoBase64 = await convertBlobToBase64(logoResponse.data);
          setSchoolLogoBase64(logoBase64);
        } else {
          setSchoolLogoBase64(null);
        }
      } catch (err) {
        console.error("Error fetching school assets:", err);
        setSchoolLogo(null);
        setPrincipalSignatureBase64(null);
        setSchoolLogoBase64(null);
      }
    };

    // Helper function to convert blob to base64
    const convertBlobToBase64 = (blob) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    };

    fetchLogo();
  }, [schoolId]);

  // Get unique class options
  const classOptions = useMemo(
    () => Array.from(new Set(students.map((s) => s.class_).filter(Boolean))),
    [students]
  );

  // Group students by class
  const studentsByClass = useMemo(() => {
    const grouped = {};
    students.forEach((student) => {
      if (student.class_) {
        if (!grouped[student.class_]) {
          grouped[student.class_] = [];
        }
        grouped[student.class_].push(student);
      }
    });
    return grouped;
  }, [students]);

  // Filter students based on search and class
  const filteredStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.studentName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          (classFilter ? student.class_ === classFilter : true)
      ),
    [students, searchQuery, classFilter]
  );

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    const schoolNameFromUser =
      schools[0]?.Schoolname || schools[0]?.schoolName || "";

    setSchoolId(schoolId);
    setSchoolNameFromUser(schoolNameFromUser);

    if (schoolId) {
      fetchSchoolDetails(schoolId);
    }
  }, []);

  const fetchSchoolDetails = async (schoolId) => {
    try {
      const principal_token = localStorage.getItem("principal_token");
      const response = await axios.get(
        `${API_BASE_URL}/newSchool/schools/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      // Map the response data to our state structure
      setSchoolDetails({
        Schoolname: response.data.Schoolname,
        address: response.data.address,
        medium: response.data.medium,
        phone: response.data.phone,
        establishmentYear: response.data.establishmentYear,
        affiliationStatus: response.data.affiliationStatus,
        schoolAffiliationNumber: response.data.schoolAffiliationNumber,
        schoolCode: response.data.schoolCode,
      });
    } catch (err) {
      console.error("Error fetching school details:", err);
    }
  };

  const fetchStudentsAndResults = async () => {
    if (!schoolId) return;

    try {
      setLoading(true);
      const principal_token = localStorage.getItem("principal_token");

      // Fetch students
      const studentsResponse = await axios.get(
        `http://localhost:5002/api/admission/students/by-school/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      const fetchedStudents = studentsResponse.data.students || [];
      setStudents(fetchedStudents);

      // Fetch results for each student
      const resultsMap = {};
      for (const student of fetchedStudents) {
        const resultResponse = await axios.get(
          `${API_BASE_URL}/result/results/student/${student.id}`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );
        resultsMap[student.id] = resultResponse.data;
      }
      setStudentResults(resultsMap);

      // Fetch publishing status for each class
      const publishedClasses = {};
      for (const classId of Array.from(
        new Set(fetchedStudents.map((s) => s.class_))
      ).filter(Boolean)) {
        try {
          const statusResponse = await axios.get(
            `${API_BASE_URL}/resultpublish/publish-status/${classId}`,
            {
              params: {
                examType: currentExamType || "Final",
                academicYear,
              },
              headers: {
                Authorization: `Bearer ${principal_token}`,
              },
            }
          );
          publishedClasses[classId] = statusResponse.data.published || false;
        } catch (err) {
          console.error(
            `Error fetching publish status for class ${classId}:`,
            err
          );
          publishedClasses[classId] = false;
        }
      }
      setPublishStatus(publishedClasses);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!schoolId || !currentExamType) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await fetchStudentsAndResults();

        // Fetch publish status for all classes
        const publishedClasses = {};
        for (const classId of classOptions) {
          const isPublished = await fetchPublishStatus(classId);
          publishedClasses[classId] = isPublished;
        }
        setPublishStatus(publishedClasses);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [schoolId, currentExamType]);

  const handleViewResults = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setEditMode(false);
  };

  const handleEdit = (result) => {
    setEditingResult({
      ...result,
      marks: result.marks || 0,
    });
    setEditMode(true);
  };

  const handleUpdate = async () => {
    try {
      const principal_token = localStorage.getItem("principal_token");

      const response = await axios.put(
        `${API_BASE_URL}/result/results/${editingResult.id}`,
        {
          marks: parseInt(editingResult.marks),
          subject: editingResult.subject,
          semester: editingResult.semester,
        },
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Result updated successfully");
        setEditMode(false);
        fetchStudentsAndResults(); // Refresh the data
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update result");
    }
  };

  const validateBeforePublish = (classId) => {
    if (!currentExamType) {
      toast.error("Please select an exam type");
      return false;
    }
    if (!schoolId) {
      toast.error("School ID not found");
      return false;
    }

    const classStudents = studentsByClass[classId] || [];
    const allHaveResults = classStudents.every((student) => {
      const results = studentResults[student.id] || [];
      return results.length > 0;
    });

    if (!allHaveResults) {
      toast.error(
        "All students in the class must have results before publishing"
      );
      return false;
    }

    return true;
  };

  const handlePublishResults = async (classId) => {
    if (!currentExamType) {
      // Ensure examType is defined
      console.error("Exam type is not defined");
      toast.error("Please select an exam type before publishing results.");
      return;
    }

    console.log("Publishing results with data:", {
      classId,
      examType: currentExamType,
      academicYear,
      schoolId,
    }); // Debugging log

    try {
      const token = localStorage.getItem("principal_token"); // Retrieve token from localStorage
      const response = await fetch(
        "http://localhost:5002/api/resultpublish/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            classId,
            examType: currentExamType,
            academicYear,
            schoolId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Publish successful:", data); // Debugging log
      toast.success(`Results for Class ${classId} published successfully`);
      setPublishStatus((prev) => ({
        ...prev,
        [classId]: true,
      }));
    } catch (error) {
      console.error("Error publishing results:", error); // Debugging log
      toast.error("Failed to publish results. Please try again.");
    }
  };

  const handleUnpublishResults = async (classId) => {
    try {
      const principal_token = localStorage.getItem("principal_token");

      const response = await axios.post(
        `${RESULT_PUBLISH_API}/unpublish`,
        {
          classId,
          examType: currentExamType,
          academicYear,
          schoolId,
        },
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      if (response.data) {
        toast.success(`Results for Class ${classId} unpublished successfully`);
        setPublishStatus((prev) => ({
          ...prev,
          [classId]: false,
        }));
        fetchStudentsAndResults(); // Refresh data
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to unpublish results";
      toast.error(errorMsg);
      console.error("Unpublish error:", error);
    }
  };

  const toggleClassExpansion = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const checkClassResultsStatus = (classId) => {
    const classStudents = studentsByClass[classId] || [];
    const totalStudents = classStudents.length;
    const studentsWithResults = classStudents.filter(
      (student) => (studentResults[student.id] || []).length > 0
    ).length;

    return {
      total: totalStudents,
      withResults: studentsWithResults,
      percentage:
        totalStudents > 0 ? (studentsWithResults / totalStudents) * 100 : 0,
    };
  };

  // Update the handleDownloadPDF function
  const handleDownloadPDF = () => {
    if (printRef.current) {
      // Set printing mode to hide actions column
      setIsPrinting(true);

      // Remove overflow and max-height temporarily for PDF generation
      const modalContent = printRef.current;
      const originalStyle = modalContent.style.cssText;
      modalContent.style.maxHeight = "none";
      modalContent.style.overflow = "visible";

      html2pdf()
        .set({
          margin: 1,
          filename: `Results_${selectedStudent.studentName}.pdf`,
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: true,
            windowWidth: 794,
            windowHeight: 1123, // A4 height
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(printRef.current)
        .save()
        .then(() => {
          // Restore original styles after PDF generation
          modalContent.style.cssText = originalStyle;
          // Reset printing mode
          setIsPrinting(false);
        });
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Student Results Management</h1>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Search className="text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Filter by Class:</label>
          <select
            className="border rounded px-2 py-1"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
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
          <label className="font-medium">Exam Type:</label>
          <select
            className="border rounded px-2 py-1"
            value={currentExamType}
            onChange={(e) => setCurrentExamType(e.target.value)}
          >
            {examTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Academic Year:</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />
        </div>
      </div>

      {/* Class-wise results section */}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-semibold">Class-wise Results Management</h2>

        {loading ? (
          <div className="text-center py-4">Loading class data...</div>
        ) : (
          Object.keys(studentsByClass)
            .sort()
            .map((classId) => {
              const status = checkClassResultsStatus(classId);
              const isComplete =
                status.total > 0 && status.total === status.withResults;
              const isExpanded = expandedClass === classId;

              return (
                <div
                  key={classId}
                  className="border rounded-lg overflow-hidden"
                >
                  <div
                    className={`p-4 flex justify-between items-center cursor-pointer ${
                      isExpanded ? "bg-blue-50" : "bg-gray-50"
                    }`}
                    onClick={() => toggleClassExpansion(classId)}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                      <h3 className="text-lg font-medium">Class {classId}</h3>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-sm">
                        <span className="font-semibold">
                          {status.withResults}
                        </span>
                        <span className="text-gray-500">
                          /{status.total} students with results
                        </span>
                      </div>

                      <div className="w-40 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            isComplete ? "bg-green-600" : "bg-blue-600"
                          }`}
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          publishStatus[classId]
                            ? handleUnpublishResults(classId)
                            : handlePublishResults(classId);
                        }}
                        disabled={!isComplete || !currentExamType}
                        className={`px-4 py-1 rounded ${
                          !isComplete || !currentExamType
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : publishStatus[classId]
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {publishStatus[classId]
                          ? "Unpublish Results"
                          : "Publish Results"}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="border px-2 py-1 text-left">#</th>
                            <th className="border px-2 py-1 text-left">Name</th>
                            <th className="border px-2 py-1 text-left">
                              Roll Number
                            </th>
                            <th className="border px-2 py-1 text-left">
                              Section
                            </th>
                            <th className="border px-2 py-1 text-left">
                              Father's Name
                            </th>
                            <th className="border px-2 py-1 text-left">
                              Result Status
                            </th>
                            <th className="border px-2 py-1 text-left">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsByClass[classId].map((student, idx) => {
                            const results = studentResults[student.id] || [];
                            const hasResults = results.length > 0;

                            return (
                              <tr
                                key={student.id}
                                className={
                                  idx % 2 === 0
                                    ? "bg-white"
                                    : "bg-gray-50 hover:bg-blue-50 transition"
                                }
                              >
                                <td className="border px-2 py-1">{idx + 1}</td>
                                <td className="border px-2 py-1 font-semibold">
                                  {student.studentName}
                                </td>
                                <td className="border px-2 py-1">
                                  {student.rollNumber}
                                </td>
                                <td className="border px-2 py-1">
                                  {student.sectionclass}
                                </td>
                                <td className="border px-2 py-1">
                                  {student.fatherName}
                                </td>
                                <td className="border px-2 py-1">
                                  {hasResults ? (
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded">
                                      Results Available
                                    </span>
                                  ) : (
                                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                      No Results
                                    </span>
                                  )}
                                </td>
                                <td className="border px-2 py-1">
                                  <button
                                    onClick={() => handleViewResults(student)}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Pencil size={16} />
                                    {hasResults
                                      ? "View Results"
                                      : "Add Results"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>

      {/* Individual students table - show if filtered */}
      {searchQuery || classFilter ? (
        <div
          className="overflow-auto rounded shadow mt-4"
          style={{ maxHeight: "400px" }}
        >
          <h2 className="text-xl font-semibold mb-2">Filtered Students</h2>
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Roll Number</th>
                <th className="border px-2 py-1">Class</th>
                <th className="border px-2 py-1">Section</th>
                <th className="border px-2 py-1">Father's Name</th>
                <th className="border px-2 py-1">Result Status</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-2 text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const results = studentResults[student.id] || [];
                  const hasResults = results.length > 0;

                  return (
                    <tr
                      key={student.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50 hover:bg-blue-50 transition"
                      }
                    >
                      <td className="border px-2 py-1">{idx + 1}</td>
                      <td className="border px-2 py-1 font-semibold">
                        {student.studentName}
                      </td>
                      <td className="border px-2 py-1">{student.rollNumber}</td>
                      <td className="border px-2 py-1">{student.class_}</td>
                      <td className="border px-2 py-1">
                        {student.sectionclass}
                      </td>
                      <td className="border px-2 py-1">{student.fatherName}</td>
                      <td className="border px-2 py-1">
                        {hasResults ? (
                          <span className="text-green-600">
                            Results Available
                          </span>
                        ) : (
                          <span className="text-gray-500">No Results</span>
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          onClick={() => handleViewResults(student)}
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Pencil size={16} />
                          {hasResults ? "View Results" : "Add Results"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Student Results Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={printRef}
            className="bg-white rounded-lg p-6 w-[800px]"
            style={{
              maxHeight: showModal ? "80vh" : "none",
              overflow: showModal ? "auto" : "visible",
            }}
          >
            {/* Header with school info */}
            <div className="bg-yellow-50 p-4 rounded-md border-b-4 border-red-600 mb-6">
              <div className="flex items-center">
                <img
                  src={getImageUrl(schoolLogo) || "/school-logo.png"}
                  alt="School Logo"
                  className="w-20 h-20 mr-4"
                  style={{
                    objectFit: "contain",
                    backgroundColor: "white",
                    padding: "2px",
                    borderRadius: "4px",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/school-logo.png";
                  }}
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-indigo-900">
                    {schoolDetails.schoolname ||
                      schoolNameFromUser ||
                      "School Name"}
                  </h1>
                  <h2 className="text-xl font-bold text-indigo-800">
                    {schoolDetails.medium || ""} Medium
                  </h2>
                  <p className="text-sm text-indigo-800">
                    {schoolDetails.affiliationStatus
                      ? `Affiliated to ${schoolDetails.affiliationStatus} Board`
                      : ""}
                  </p>
                  <div className="text-sm mt-1">
                    <p>{schoolDetails.address}</p>
                    <p>Est. {schoolDetails.establishmentYear}</p>
                    {schoolDetails.phone && <p>Phone: {schoolDetails.phone}</p>}
                  </div>
                  <div className="flex justify-between text-sm text-pink-600 font-bold mt-1">
                    <p>School Code: {schoolDetails.schoolCode}</p>
                    <p>
                      Affiliation No: {schoolDetails.schoolAffiliationNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student details with photo */}
            <div className="flex items-start gap-6 mb-6">
              {/* Student Photo */}
              <div className="w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={
                    getImageUrl(selectedStudent.photo) || "/default-student.png"
                  }
                  alt="Student"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-student.png";
                  }}
                />
              </div>

              {/* Student Details */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-4">
                  {selectedStudent.studentName}'s Results
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Class:</strong> {selectedStudent.class_}
                    </p>
                    <p>
                      <strong>Roll Number:</strong> {selectedStudent.rollNumber}
                    </p>
                    <p>
                      <strong>Section:</strong> {selectedStudent.sectionclass}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Father's Name:</strong>{" "}
                      {selectedStudent.fatherName}
                    </p>
                    <p>
                      <strong>Mother's Name:</strong>{" "}
                      {selectedStudent.motherName}
                    </p>
                    <p>
                      <strong>Admission No:</strong>{" "}
                      {selectedStudent.Admission_Number}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Result</h3>
              {!isPrinting && ( // Hide buttons during PDF generation
                <div className="flex gap-2 no-print">
                  {" "}
                  {/* Add no-print class */}
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedStudent(null);
                      setEditMode(false);
                      setEditingResult(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    title="Download PDF"
                  >
                    <ArrowDownToLine size={20} />
                    Download
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <table className="min-w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border px-4 py-2">Subject</th>
                    <th className="border px-4 py-2">Marks</th>
                    <th className="border px-4 py-2">Grade</th>
                    {!isPrinting && (
                      <th className="border px-4 py-2">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(studentResults[selectedStudent.id] || []).length === 0 ? (
                    <tr>
                      <td
                        colSpan={isPrinting ? 3 : 4}
                        className="border px-4 py-6 text-center text-gray-500"
                      >
                        No results available for this student.
                      </td>
                    </tr>
                  ) : (
                    (studentResults[selectedStudent.id] || []).map((result) => (
                      <tr key={result.id}>
                        <td className="border px-4 py-2">{result.subject}</td>
                        <td className="border px-4 py-2">
                          {editMode &&
                          editingResult?.id === result.id &&
                          !isPrinting ? (
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingResult.marks}
                              onChange={(e) =>
                                setEditingResult({
                                  ...editingResult,
                                  marks: e.target.value,
                                })
                              }
                              className="border rounded px-2 py-1 w-20"
                            />
                          ) : (
                            result.marks
                          )}
                        </td>
                        <td className="border px-4 py-2">{result.grade}</td>
                        {!isPrinting && (
                          <td className="border px-4 py-2">
                            {editMode && editingResult?.id === result.id ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdate}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditMode(false);
                                    setEditingResult(null);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEdit(result)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Add signature section */}
              <div className="flex justify-between mt-12 mb-6 pt-6">
                <div>
                  {/* <p><strong>CLASS TEACHER</strong></p> */}
                  <div className="h-16"></div>
                </div>
                <div>
                  {principalSignatureBase64 && (
                    <img
                      src={getImageUrl(principalSignatureBase64)}
                      alt="Principal Signature"
                      crossOrigin="anonymous"
                      className="h-6 mb-1"
                      style={{ objectFit: "contain" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <p className="text-center font-bold">PRINCIPAL</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPublish;
