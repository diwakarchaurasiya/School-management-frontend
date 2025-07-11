import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Download, Upload } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-toastify";

const TeacherUploadResults = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [headerError, setHeaderError] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teacherId, setTeacherId] = useState("");

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const groupClass = "mb-4";

  const classes = ["LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const sections = ["A", "B", "C", "D"];
  const semesters = ["First", "Second", "Third", "Annual"];

  const subjectConfigs = {
    LKG: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "EVS", maxTheory: 100, maxPractical: 0 },
    ],
    UKG: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "EVS", maxTheory: 100, maxPractical: 0 },
    ],
    I: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "EVS", maxTheory: 100, maxPractical: 0 },
    ],
    II: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "EVS", maxTheory: 100, maxPractical: 0 },
    ],
    III: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "EVS", maxTheory: 100, maxPractical: 0 },
    ],
    IV: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "EVS", maxTheory: 100, maxPractical: 0 },
    ],
    V: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "Science", maxTheory: 80, maxPractical: 20 },
      { name: "Social Science", maxTheory: 100, maxPractical: 0 },
    ],
    VI: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "Science", maxTheory: 80, maxPractical: 20 },
      { name: "Social Science", maxTheory: 100, maxPractical: 0 },
    ],
    VII: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "Science", maxTheory: 80, maxPractical: 20 },
      { name: "Social Science", maxTheory: 100, maxPractical: 0 },
    ],
    VIII: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 100, maxPractical: 0 },
      { name: "Science", maxTheory: 80, maxPractical: 20 },
      { name: "Social Science", maxTheory: 100, maxPractical: 0 },
    ],
    IX: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 80, maxPractical: 20 },
      { name: "Science", maxTheory: 70, maxPractical: 30 },
      { name: "Social Science", maxTheory: 100, maxPractical: 0 },
    ],
    X: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Hindi", maxTheory: 100, maxPractical: 0 },
      { name: "Mathematics", maxTheory: 80, maxPractical: 20 },
      { name: "Science", maxTheory: 70, maxPractical: 30 },
      { name: "Social Science", maxTheory: 100, maxPractical: 0 },
    ],
    XI: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Physics", maxTheory: 70, maxPractical: 30 },
      { name: "Chemistry", maxTheory: 70, maxPractical: 30 },
      { name: "Mathematics", maxTheory: 80, maxPractical: 20 },
      { name: "Computer Science", maxTheory: 70, maxPractical: 30 },
    ],
    XII: [
      { name: "English", maxTheory: 100, maxPractical: 0 },
      { name: "Physics", maxTheory: 70, maxPractical: 30 },
      { name: "Chemistry", maxTheory: 70, maxPractical: 30 },
      { name: "Mathematics", maxTheory: 80, maxPractical: 20 },
      { name: "Computer Science", maxTheory: 70, maxPractical: 30 },
    ],
  };

  const expectedHeaders = () => {
    if (!selectedClass) return [];
    const subjects = subjectConfigs[selectedClass];
    let headers = ["rollNumber", "studentName", "studentId", "classId", "semester"];
    subjects.forEach((subject) => {
      headers.push(`${subject.name} Theory (Max: ${subject.maxTheory})`);
      if (subject.maxPractical > 0) {
        headers.push(
          `${subject.name} Practical (Max: ${subject.maxPractical})`
        );
      }
    });
    return headers;
  };

  useEffect(() => {
    // Get teacher ID from local storage or context
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.id && user.role === "teacher") {
      setTeacherId(user.id);
    }
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass || !selectedSection) return;

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.jsic.in/api/admission/students?class=${selectedClass}`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const data = await response.json();
        
        // Check if data has students property and it's an array
        const studentsArray = data.students && Array.isArray(data.students) ? data.students : [];
        
        // Filter students by both class and section
        const filteredStudents = studentsArray.filter(student =>
          student.class_ === selectedClass && student.sectionclass === selectedSection
        );

        // Fetch the class ID for these students
        const classResponse = await fetch(`https://api.jsic.in/api/classes?name=${selectedClass}`);
        const classData = await classResponse.json();
        const classId = classData.classes?.[0]?.id || "";
        
        // Add class ID to each student
        const studentsWithClassId = filteredStudents.map(student => ({
          ...student,
          classId
        }));
        
        setStudents(studentsWithClassId);

        if (filteredStudents.length === 0) {
          toast.info("No students found for selected class and section");
        }
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSection]);

  const generateSampleCSV = () => {
    if (!students || !Array.isArray(students) || students.length === 0) {
      toast.error("No students found for selected class and section");
      return;
    }

    if (!selectedSemester) {
      toast.error("Please select a semester");
      return;
    }

    const headers = expectedHeaders();
    let csvContent = headers.join(",") + "\n";

    students.forEach((student) => {
      // Start with basic information
      let row = [
        student.rollNumber || "", 
        student.studentName || "",
        student.id || "",
        student.classId || "",
        selectedSemester
      ];
      
      // Add subject marks placeholders
      subjectConfigs[selectedClass].forEach((subject) => {
        row.push("0"); // Theory marks
        if (subject.maxPractical > 0) {
          row.push("0"); // Practical marks
        }
      });
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class_${selectedClass}${selectedSection}_${selectedSemester}_results_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
    setCsvData([]);
    setHeaderError("");

    if (file && file.type === "text/csv") {
      Papa.parse(file, {
        complete: (results) => {
          const [headerRow, ...rows] = results.data;
          const headers = expectedHeaders();

          if (JSON.stringify(headerRow) !== JSON.stringify(headers)) {
            setHeaderError(
              "CSV headers do not match the sample template for the selected class and section."
            );
          } else {
            setCsvData([headerRow, ...rows]);
          }
        },
      });
    } else if (file) {
      toast.error("Please upload a valid CSV file");
    }
  };

  const convertToResultsFormat = (csvData) => {
    const [headers, ...rows] = csvData;
    const results = [];

    // Create a map for column indices
    const columnMap = {};
    headers.forEach((header, index) => {
      columnMap[header] = index;
    });

    // Process each row
    rows.forEach((row) => {
      if (!row || row.length < 5) return; // Skip empty rows

      const studentId = row[columnMap["studentId"]];
      const classId = row[columnMap["classId"]];
      const semester = row[columnMap["semester"]];
      
      // Process each subject
      subjectConfigs[selectedClass].forEach((subject) => {
        const theoryHeader = `${subject.name} Theory (Max: ${subject.maxTheory})`;
        const practicalHeader = subject.maxPractical > 0 
          ? `${subject.name} Practical (Max: ${subject.maxPractical})` 
          : null;

        // Get theory marks
        const theoryMarks = parseInt(row[columnMap[theoryHeader]] || 0);
        
        // Get practical marks if applicable
        const practicalMarks = practicalHeader
          ? parseInt(row[columnMap[practicalHeader]] || 0)
          : 0;
        
        // Calculate total marks for the subject
        const totalMarks = theoryMarks + practicalMarks;

        // Add to results array
        results.push({
          studentId,
          classId,
          semester,
          subject: subject.name,
          marks: totalMarks,
          teacherId
        });
      });
    });

    return results;
  };

  const handleUpload = async () => {
    if (!selectedClass || !selectedSection || !selectedSemester) {
      toast.error("Please select class, section, and semester");
      return;
    }
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (headerError) {
      toast.error("CSV header mismatch. Please fix the CSV file.");
      return;
    }
    if (!teacherId) {
      toast.error("Teacher ID not found. Please log in again.");
      return;
    }

    setUploadLoading(true);
    try {
      // Convert CSV data to the format needed by the server
      const resultsData = convertToResultsFormat(csvData);
      
      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to the server
      const response = await fetch(`https://api.jsic.in/api/results/bulk/teacher/${teacherId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload results');
      }

      const result = await response.json();
      toast.success(`Successfully uploaded ${result.results.count} results!`);
      
      // Reset the form
      setFile(null);
      setCsvData([]);
    } catch (error) {
      toast.error(error.message || "Error uploading results");
    } finally {
      setUploadLoading(false);
    }
  };

  const calculateTotalMarks = (student) => {
    if (!selectedClass || !student) return 0;
    
    let total = 0;
    subjectConfigs[selectedClass].forEach((subject) => {
      const theory = parseInt(student[`${subject.name}Theory`]) || 0;
      const practical = subject.maxPractical > 0 
        ? (parseInt(student[`${subject.name}Practical`]) || 0)
        : 0;
      total += theory + practical;
    });
    
    return total;
  };

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <FileSpreadsheet className="h-8 w-8 text-[black]" />
        <h1 className="text-2xl font-bold text-gray-800">Upload Results</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex flex-wrap md:flex-nowrap items-end gap-4">
          <div className={groupClass + " flex-1 min-w-[150px]"}>
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

          <div className={groupClass + " flex-1 min-w-[150px]"}>
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

          <div className={groupClass + " flex-1 min-w-[150px]"}>
            <label className={labelClass}>Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setFile(null);
                setCsvData([]);
                setHeaderError("");
              }}
              className={inputClass}
            >
              <option value="">Select Semester</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex-1">
            <button
              onClick={generateSampleCSV}
              disabled={!selectedClass || !selectedSection || !selectedSemester}
              className={`flex items-center gap-2 px-4 py-2 rounded-md whitespace-nowrap ${
                selectedClass && selectedSection && selectedSemester
                  ? "bg-[black] text-white hover:bg-gray-900"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Download className="h-4 w-4" />
              Download Sample CSV
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
          <div className="overflow-x-auto border rounded-md">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {csvData[0].map((header, idx) => (
                    <th key={idx} className="p-2 border">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(1).map((row, idx) => (
                  <tr key={idx} className="even:bg-gray-50">
                    {row.map((cell, i) => (
                      <td key={i} className="p-2 border">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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

        {students.length > 0 && !loading && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Students List</h2>
            <div className="overflow-x-auto border rounded-md">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Sr. No.</th>
                    <th className="p-2 border">Student Name</th>
                    <th className="p-2 border">Roll Number</th>
                    {/* <th className="p-2 border">Student ID</th> */}
                    <th className="p-2 border">Class</th>
                    <th className="p-2 border">Section</th>
                    {subjectConfigs[selectedClass]?.map((subject) => (
                      <React.Fragment key={subject.name}>
                        <th className="p-2 border">{subject.name} Theory</th>
                        {subject.maxPractical > 0 && (
                          <th className="p-2 border">{subject.name} Practical</th>
                        )}
                      </React.Fragment>
                    ))}
                    <th className="p-2 border">Total Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="p-2 border">{index + 1}</td>
                      <td className="p-2 border">{student.studentName}</td>
                      <td className="p-2 border">{student.rollNumber}</td>
                      {/* <td className="p-2 border">{student.id}</td> */}
                      <td className="p-2 border">{student.class_}</td>
                      <td className="p-2 border">{student.sectionclass}</td>
                      {subjectConfigs[selectedClass]?.map((subject) => (
                        <React.Fragment key={subject.name}>
                          <td className="p-2 border">
                            {student[`${subject.name}Theory`] || '-'}
                          </td>
                          {subject.maxPractical > 0 && (
                            <td className="p-2 border">
                              {student[`${subject.name}Practical`] || '-'}
                            </td>
                          )}
                        </React.Fragment>
                      ))}
                      <td className="p-2 border font-semibold">
                        {calculateTotalMarks(student)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleUpload}
            disabled={uploadLoading || !file}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
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

export default TeacherUploadResults;