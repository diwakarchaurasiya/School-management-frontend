import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Download, Upload } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-toastify";
import CsvPreviewTable from "../../components/CsvPreviewTable";
import axios from "axios";

const API_BASE_URL = 'https://api.jsic.in/api';

const UploadResults = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headerError, setHeaderError] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState("");
  const [subjectConfigs, setSubjectConfigs] = useState({}); // Dynamically fetched subjects
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [studentResults, setStudentResults] = useState({});
  const [schoolId, setSchoolId] = useState(null); // Add schoolId state

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const groupClass = "mb-4";

  const classes = [
    "LKG",
    "UKG",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];
  const sections = ["A", "B", "C", "D"];
  const examTypes = ["Quarterly", "Halfyearly", "Annual"];

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      console.error("No user data found in localStorage");
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      const schools = user?.user?.schools || user?.schools || [];
      if (schools.length === 0) {
        console.error("No schools found for user");
        return;
      }
      
      const schoolIdFromStorage = schools[0]?.id;
      if (!schoolIdFromStorage) {
        console.error("No school ID found in first school");
        return;
      }

      console.log("Setting schoolId:", schoolIdFromStorage);
      setSchoolId(schoolIdFromStorage);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []); // This effect runs once when component mounts

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedClass || !schoolId) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/admission/students/by-school/${schoolId}?class=${selectedClass}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();
        const studentsData = data.students || [];
        setStudents(studentsData);

        // Extract subjects configuration from students' data
        const subjectsData = {};
        studentsData.forEach((student) => {
          if (student.class_ && student.subjects) {
            try {
              let parsedSubjects;

              // Check if subjects is a string and split it into an array
              if (typeof student.subjects === "string") {
                parsedSubjects = student.subjects.split(",").map((subject) => subject.trim());
              } else {
                parsedSubjects = student.subjects; // Assume it's already an array or object
              }

              if (Array.isArray(parsedSubjects)) {
                subjectsData[student.class_] = parsedSubjects;
              }
            } catch (parseError) {
              console.error("Error parsing subjects data:", parseError);
            }
          }
        });

        if (!subjectsData[selectedClass] || subjectsData[selectedClass].length === 0) {
          console.warn(`No valid subjects found for class: ${selectedClass}`);
        }

        setSubjectConfigs(subjectsData);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedClass && schoolId) {
      fetchData();
    }
  }, [selectedClass, schoolId]); // Update the existing fetchData useEffect to use schoolId

  const expectedHeaders = () => {
    const baseHeaders = [
      "rollNumber",
      "studentName",
      "studentId",
      "classId",
      "class_",
      "sectionclass",
      "examinationType",
    ];

    const subjects = subjectConfigs[selectedClass];
    if (subjects && Array.isArray(subjects)) {
      // If subjects is an array, iterate over it
      subjects.forEach((subjectName) => {
        baseHeaders.push(`${subjectName} Theory & practical"100""`);
      
      });
    } else if (subjects && typeof subjects === "object") {
      // If subjects is an object, iterate over its keys
      Object.keys(subjects).forEach((subjectName) => {
        baseHeaders.push(`${subjectName} Theory`);
      });
    }

    return baseHeaders;
  };

  const normalizeHeader = (header) => header.toLowerCase().trim();

  useEffect(() => {
    // Get teacher ID from local storage or context
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const principal_token = localStorage.getItem("principal_token");
    if (principal_token) {
      // setTeacherId(user._id);
    } else {
      // Redirect to login or show error message
      // toast.error("Please log in to upload results");
      // Optionally redirect to login page
      // window.location.href = '/login';
    }
  }, []);

  // Update the fetchStudentResults function to include schoolId
  const fetchStudentResults = async (studentId, token) => {
    try {
      if (!schoolId) {
        throw new Error("School ID is not available");
      }

      const response = await fetch(
        `${API_BASE_URL}/result/results/student/${studentId}/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch student results");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching results for student ${studentId}:`, error);
      return null;
    }
  };

  // Update the fetchStudentsAndResults function to include schoolId
  const fetchStudentsAndResults = async () => {
    if (!selectedClass || !selectedSection || !schoolId) return;

    setLoading(true);
    setError(null);
    
    const principal_token = localStorage.getItem("principal_token");
    
    if (!principal_token) {
      setError("Please login to continue");
      setLoading(false);
      return;
    }

    try {
      // First fetch all results for the school
      const resultsResponse = await fetch(
        `${API_BASE_URL}/result/results/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      if (!resultsResponse.ok) {
        throw new Error("Failed to fetch results");
      }

      const allResults = await resultsResponse.json();

      // Then fetch students
      const studentsResponse = await fetch(
        `${API_BASE_URL}/admission/students/by-school/${schoolId}?class=${selectedClass}`,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      if (!studentsResponse.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await studentsResponse.json();
      const studentsArray = data.students && Array.isArray(data.students) ? data.students : [];

      const filteredStudents = studentsArray.filter(
        (student) =>
          student.class_ === selectedClass &&
          student.sectionclass === selectedSection
      );

      // Map results to students
      const resultsMap = {};
      filteredStudents.forEach(student => {
        resultsMap[student.id] = allResults.filter(result => 
          result.studentId === student.id
        );
      });
      
      setStudentResults(resultsMap);
      setStudents(filteredStudents);

    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch students and results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndResults();
  }, [selectedClass, selectedSection]);

  const generateSampleCSV = () => {
    if (!students || !Array.isArray(students) || students.length === 0) {
      toast.error("No students found for selected class and section");
      return;
    }

    if (!selectedExamType) {
      toast.error("Please select an examination type");
      return;
    }

    // Check if subjects exist for the selected class
    if (!subjectConfigs[selectedClass] || !Array.isArray(subjectConfigs[selectedClass])) {
      toast.error("No subjects found for selected class");
      return;
    }

    const headers = [
      "rollNumber",
      "studentName", 
      "studentId",
      "schoolId",      // Add schoolId to headers
      "classId",
      "class_",
      "sectionclass",
      "examinationType",
      ...subjectConfigs[selectedClass].map(subject => 
        `${subject} Theory and practical"100"`
      )
    ];

    let csvContent = headers.join(",") + "\n";

    students.forEach((student) => {
      let row = [
        student.rollNumber || "",
        student.studentName || "",
        student.id || "",
        schoolId || "",     // Add schoolId to row data
        student.classId || "",
        student.class_ || "",
        student.sectionclass || "",
        selectedExamType,
        ...(subjectConfigs[selectedClass] || []).map(() => "0")
      ];

      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class_${selectedClass}${selectedSection}_${selectedExamType}_results_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateCsvData = (data) => {
    const errors = [];
    const requiredFields = [
      "rollNumber",
      "studentName",
      "studentId",
      "schoolId",      // Add schoolId to required fields
      "classId",
      "class_",
      "sectionclass",
      "examinationType"
    ];

    data.forEach((row, index) => {
      if (index === 0) return; // Skip header row

      // Check for missing required fields
      const missingFields = requiredFields.filter(field => !row[field]);
      if (missingFields.length > 0) {
        errors.push(`Row ${index + 1}: Missing required fields: ${missingFields.join(", ")}`);
      }

      // Validate subject marks
      Object.entries(row).forEach(([key, value]) => {
        if (key.includes("Theory and practical")) {
          const marks = parseInt(value);
          if (isNaN(marks)) {
            errors.push(`Row ${index + 1}: Invalid marks format for ${key}`);
          } else if (marks < 0 || marks > 100) {
            errors.push(`Row ${index + 1}: Marks for ${key} must be between 0 and 100`);
          }
        }
      });
    });

    return errors;
  };

  const validateCsvRow = (row, expectedHeaders) => {
    const errors = [];

    // Check for required fields
    const requiredFields = [
      "rollNumber",
      "studentName",
      "studentId",
      "classId",
      "class_",
      "sectionclass",
      "examinationType",
    ];

    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate subject marks
    expectedHeaders.forEach((header) => {
      if (header.includes("Theory") || header.includes("Practical")) {
        const marks = parseInt(row[header]);
        if (isNaN(marks) || marks < 0 || marks > 100) {
          errors.push(`Invalid marks for ${header}: ${row[header]}`);
        }
      }
    });

    return errors;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setCsvData([]);
    setHeaderError("");

    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        complete: (results) => {
          // Ensure we have valid data
          if (!results.data || results.data.length === 0) {
            setHeaderError("CSV file appears to be empty");
            return;
          }

          const expectedHeadersList = expectedHeaders();
          const uploadedHeaders = Object.keys(results.data[0]);

          // Find missing headers by comparing normalized versions
          const missingHeaders = expectedHeadersList.filter(
            (expectedHeader) =>
              !uploadedHeaders.some(
                (uploadedHeader) =>
                  normalizeHeader(uploadedHeader) === normalizeHeader(expectedHeader)
              )
          );

          if (missingHeaders.length > 0) {
            setHeaderError(
              `Missing required columns: ${missingHeaders.join(", ")}\n` +
              "Please use the sample template for the correct format."
            );
            return;
          }

          // Validate the data rows
          const validationErrors = validateCsvData(results.data, expectedHeadersList);
          if (validationErrors.length > 0) {
            setHeaderError(validationErrors.join("\n"));
            return;
          }

          // Set the parsed data
          setCsvData(results.data);
        },
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      });
    } else if (file) {
      toast.error("Please upload a valid CSV file");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    if (headerError) {
      toast.error("Please fix the CSV file errors before uploading");
      return;
    }

    if (!schoolId) {
      toast.error("School ID is not available");
      return;
    }

    const principal_token = localStorage.getItem("principal_token");
    if (!principal_token) {
      toast.error("Please login to continue");
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("schoolId", schoolId.toString()); // Convert to string if it's a number
      formData.append("semester", selectedExamType);

      const response = await fetch(`${API_BASE_URL}/result/results/bulk/upload`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${principal_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload results");
      }

      const result = await response.json();
      toast.success(
        `Successfully processed results: ${result.created} created, ${result.updated} updated`
      );

      // Reset form
      setFile(null);
      setCsvData([]);
      setHeaderError("");
      setSelectedClass("");
      setSelectedSection("");
      setSelectedExamType("");
      setStudents([]);
      setStudentResults({});  
      setError(null);
      setUploadLoading(false);

      // Refresh the results
      await fetchStudentsAndResults();

    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Error uploading results");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FileSpreadsheet className="h-8 w-8 text-[black]" />
        <h1 className="text-2xl font-bold text-gray-800">Upload Results</h1>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className={groupClass}>
            <label className={labelClass}>Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setFile(null);
                setCsvData([]);
                setHeaderError("");
              }}
              className={inputClass}
            >
              <option value="">Select Class</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div className={groupClass}>
            <label className={labelClass}>Section</label>
            <select
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setFile(null);
                setCsvData([]);
                setHeaderError("");
              }}
              className={inputClass}
            >
              <option value="">Select Section</option>
              {sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div className={groupClass}>
            <label className={labelClass}>Examination Type</label>
            <select
              value={selectedExamType}
              onChange={(e) => {
                setSelectedExamType(e.target.value);
                setFile(null);
                setCsvData([]);
                setHeaderError("");
              }}
              className={inputClass}
            >
              <option value="">Select Examination Type</option>
              {examTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <button
              onClick={generateSampleCSV}
              disabled={!selectedClass || !selectedSection || !selectedExamType}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md w-full ${
                selectedClass && selectedSection && selectedExamType
                  ? "bg-[black] text-white hover:bg-gray-900"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Download className="h-4 w-4" />
              <span className="whitespace-nowrap">Download Sample CSV</span>
            </button>
          </div>
        </div>

        <div className={groupClass}>
          <label className={labelClass}>Upload CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
          />
        </div>

        {headerError && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {headerError}
          </div>
        )}

        {csvData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <CsvPreviewTable csvData={csvData} />
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading students...</p>
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {students.length > 0 && !loading && !file && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Students List</h2>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Sr. No.</th>
                    <th className="p-2 border">Student Name</th>
                    <th className="p-2 border">Roll Number</th>
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Section</th>
                    {Array.isArray(subjectConfigs[selectedClass]) &&
                      subjectConfigs[selectedClass].map((subject, index) => (
                        <th key={`${subject}-${index}`} className="p-2 border">
                          {subject}
                        </th>
                      ))}
                    <th className="p-2 border">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const studentResult = studentResults[student.id] || [];
                    const totalMarks = studentResult.reduce((sum, result) => 
                      sum + (result.marks || 0), 0
                    );

                    return (
                      <tr key={student.id || index} className="even:bg-gray-50">
                        <td className="p-2 border">{index + 1}</td>
                        <td className="p-2 border">{student.studentName}</td>
                        <td className="p-2 border">{student.rollNumber}</td>
                        <td className="p-2 border">{student.class_}</td>
                        <td className="p-2 border">{student.sectionclass}</td>
                        {Array.isArray(subjectConfigs[selectedClass]) &&
                          subjectConfigs[selectedClass].map((subject, subIndex) => {
                            const subjectResult = studentResult.find(
                              r => r.subject === subject
                            );
                            return (
                              <td key={`${subject}-${subIndex}`} className="p-2 border">
                                {subjectResult ? (
                                  <span>
                                    {subjectResult.marks} ({subjectResult.grade})
                                  </span>
                                ) : "-"}
                              </td>
                            );
                          })}
                        <td className="p-2 border">{totalMarks}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpload}
            disabled={uploadLoading || !file}
            className={`flex items-center gap-2 px-4 py-2 rounded-md w-full sm:w-auto justify-center ${
              !uploadLoading && file
                ? "bg-[black] text-white hover:bg-gray-900"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {uploadLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Results
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadResults;
