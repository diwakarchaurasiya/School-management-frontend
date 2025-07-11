import React, { useEffect, useState, useRef } from "react";
import { Award, TrendingUp } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [Schooolname, setSchooolname] = useState(null);
  const [examType, setExamType] = useState(""); // State for selected exam type
  const [classFilter, setClassFilter] = useState(""); // State for selected class
  const [isResultPublished, setIsResultPublished] = useState(false); // State to check if result is published
  const [studentDetails, setStudentDetails] = useState(null); // State for student details
  const resultRef = useRef(null);

  const BASE_URL = "https://api.jsic.in"; // Base URL

  // Set schoolId and studentId from localStorage
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;

    const schools = user?.user?.schools;
    setSchooolname(schools?.[0]?.Schoolname || schools?.[0]?.schoolName || "");
    const schoolId = schools[0]?.id || null;
    const studentId = user?.user?.id || null;
    setSchoolId(schoolId);
    setStudentId(studentId);
  }, []);

  // Fetch student data to check if result is published and get student details
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        if (!studentId) {
          throw new Error("Student ID not found in localStorage.");
        }

        const token = localStorage.getItem("student_token");
        const response = await axios.get(`${BASE_URL}/api/admission/students/${studentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            schoolId,
          },
        });
        const studentData = response.data.student;

        setIsResultPublished(studentData.isResultPublished); // Set the result published status
        setStudentDetails(studentData); // Set student details
      } catch (err) {
        setError(err.message || "Failed to fetch student data.");
        toast.error(err.message || "Failed to fetch student data.");
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  // Fetch results based on studentId and schoolId
  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!studentId || !schoolId) {
          throw new Error("Student ID or School ID not found in localStorage.");
        }

        const token = localStorage.getItem("student_token");
        const response = await axios.get(
          `${BASE_URL}/api/result/results/student/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              schoolId,
            },
          }
        );

        const formattedResults = response.data.map((item) => ({
          subject: item.subject,
          marks: item.marks,
          grade: item.grade,
          remarks: item.remarks || "N/A",
          examType: item.examType,
          class: item.class,
          student: item.student,
        }));

        setResults(formattedResults);
        setFilteredResults(formattedResults); // Initialize filtered results
      } catch (err) {
        setError(err.message || "Failed to fetch results.");
        toast.error(err.message || "Failed to fetch results.");
      } finally {
        setLoading(false);
      }
    };

    if (studentId && schoolId && isResultPublished) {
      fetchResults();
    }
  }, [studentId, schoolId, isResultPublished]);

  // Filter results based on examType and class
  useEffect(() => {
    const filtered = results.filter(
      (result) =>
        (examType ? result.examType === examType : true) &&
        (classFilter ? result.class === classFilter : true)
    );
    setFilteredResults(filtered);
  }, [examType, classFilter, results]);

  const calculateTotal = () => {
    return filteredResults.reduce((total, subject) => total + subject.marks, 0);
  };

  const calculatePercentage = () => {
    const total = calculateTotal();
    return ((total / (filteredResults.length * 100)) * 100).toFixed(2);
  };

  const downloadPDF = async () => {
    const element = resultRef.current;
  
    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, {
      scale: 3, // Increase scale for better quality
      useCORS: true, // Allow cross-origin images
    });
  
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4"); // A4 size in portrait mode
  
    const pdfWidth = pdf.internal.pageSize.getWidth(); // A4 width
    const pdfHeight = pdf.internal.pageSize.getHeight(); // A4 height
  
    const imgWidth = pdfWidth - 20; // Leave 10mm margin on both sides
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
    let position = 10; // Start position with a top margin of 10mm
  
    // If the content height exceeds one page, split into multiple pages
    if (imgHeight > pdfHeight - 20) {
      let remainingHeight = imgHeight;
  
      while (remainingHeight > 0) {
        pdf.addImage(
          imgData,
          "PNG",
          10, // Left margin
          position,
          imgWidth,
          Math.min(remainingHeight, pdfHeight - 20) // Adjust height for margins
        );
  
        remainingHeight -= pdfHeight - 20;
        position = 10;
  
        if (remainingHeight > 0) {
          pdf.addPage(); // Add a new page for remaining content
        }
      }
    } else {
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    }
  
    pdf.save("result.pdf");
  };

  if (loading) {
    return <div className="text-center py-6">Results are not published yet....</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  if (!isResultPublished) {
    return (
      <div className="text-center py-6 text-gray-600">
        Results are not published yet.
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div ref={resultRef} className="bg-white p-6 rounded-lg shadow-sm">
        {/* Custom Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">{Schooolname || "School Name"}</h1>
        </div>

        {/* Student Details */}
        {studentDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-600">Student Name</p>
              <p className="font-semibold text-gray-800">{studentDetails.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-semibold text-gray-800">
                {new Date(studentDetails.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Father's Name</p>
              <p className="font-semibold text-gray-800">{studentDetails.fatherName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mother's Name</p>
              <p className="font-semibold text-gray-800">{studentDetails.motherName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-semibold text-gray-800">{studentDetails.class_}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Section</p>
              <p className="font-semibold text-gray-800">{studentDetails.sectionclass}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Admission Number</p>
              <p className="font-semibold text-gray-800">{studentDetails.Admission_Number}</p>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="border rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Subject
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Marks
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Grade
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.length > 0 ? (
                filteredResults.map((subject, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-800">{subject.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{subject.marks}</td>
                    <td className="px-4 py-3 text-sm font-medium text-blue-600">
                      {subject.grade}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{subject.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-3 text-center text-sm text-gray-600"
                  >
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="text-xl font-bold text-gray-800">
                {calculateTotal()}/{filteredResults.length * 100}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Percentage</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <p className="text-xl font-bold text-gray-800">
                  {calculatePercentage()}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
      >
        Download PDF
      </button>
    </div>
  );
};

export default Results;
