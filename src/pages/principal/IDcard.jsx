import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import html2canvas from "html2canvas";
import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";
import {
  School,
  Download,
  MapPin,
  Phone,
  Calendar,
  User,
  GraduationCap,
} from "lucide-react"; // Add more icons
import { getImageUrl } from "../../utils/getImageUrl";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${date.getDate().toString().padStart(2, "0")}/${
    months[date.getMonth()]
  }/${date.getFullYear()}`;
};

// InfoRow component for consistency and styling of each information field
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 mb-0.5">
    <Icon className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-1" />
    <div className="flex-1">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
        {label}
      </span>
      <div className="text-sm font-semibold text-gray-800 break-words leading-tight">
        {value}
      </div>
    </div>
  </div>
);

const IDCardBuilder = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [principalSignature, setPrincipalSignature] = useState(null);
  const [studentPhotoBase64, setStudentPhotoBase64] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    const schoolNameFromUser =
      schools[0]?.Schoolname || schools[0]?.schoolName || "";
    setSchoolId(schoolId);
    setSchoolName(schoolNameFromUser);
  }, []);

    useEffect(() => {
      // Set default zoom to 80% for this page
      const prevZoom = document.body.style.zoom;
      document.body.style.zoom = "85%";
      return () => {
        document.body.style.zoom = prevZoom || "";
      };
    }, []);

  useEffect(() => {
    if (!schoolId) return;
    const fetchAdmissions = async () => {
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
        setAdmissions(response.data.students || []);
      } catch (err) {
        setError(err.message);
        setAdmissions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmissions();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    const fetchAssets = async () => {
      try {
        const res = await fetch(
          `https://api.jsic.in/api/newSchool/school-assets/by-school/${schoolId}`
        );
        const data = await res.json();
        setSchoolLogo(data.schoolLogo || null);

        // No need for base64 conversion here if getImageUrl handles direct URL
        // However, if html2canvas still needs it, you'd re-enable this.
        // For now, assuming getImageUrl is sufficient and html2canvas works with CORS.

        setPrincipalSignature(data.principalSignature || null);
      } catch {
        setSchoolLogo(null);
        setPrincipalSignature(null);
      }
    };
    fetchAssets();
  }, [schoolId]);

  const fetchStudentPhotoBase64 = async (photoUrl) => {
    // This is primarily for the fallback User icon display logic, not for html2canvas
    if (!photoUrl) {
      setStudentPhotoBase64("");
      return;
    }
    try {
      const response = await fetch(photoUrl, { mode: "cors" });
      if (!response.ok) throw new Error("Network response was not ok.");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setStudentPhotoBase64(reader.result);
      reader.readAsDataURL(blob);
    } catch {
      console.warn(
        "Could not fetch student photo for base64 conversion, using fallback."
      );
      setStudentPhotoBase64(""); // Set to empty to show fallback icon
    }
  };

  const openIdCardForm = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    fetchStudentPhotoBase64(student.photo); // Call to fetch photo for fallback logic
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const downloadIdCard = async () => {
    const card = document.getElementById("id-card");
    if (!card) return;

    // Ensure images are loaded and rendered
    await new Promise((resolve) => {
      const images = card.querySelectorAll("img");
      let loadedImages = 0;
      if (images.length === 0) {
        resolve();
        return;
      }
      images.forEach((img) => {
        if (img.complete) {
          loadedImages++;
        } else {
          img.onload = () => {
            loadedImages++;
            if (loadedImages === images.length) resolve();
          };
          img.onerror = () => {
            // Handle broken images
            loadedImages++;
            if (loadedImages === images.length) resolve();
          };
        }
      });
      // Fallback for images already loaded or very fast rendering
      if (loadedImages === images.length) resolve();
      setTimeout(resolve, 500); // Max wait time
    });

    html2canvas(card, {
      useCORS: true,
      backgroundColor: null,
      scale: 2, // Higher quality for better clarity on print
      width: 400, // Fixed width for consistent output image
      // Set height dynamically based on the rendered element's actual height
      height: card.offsetHeight * 2,
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `${selectedStudent.studentName}_ID_Card.png`;
      link.href = canvas.toDataURL("image/png", 2.0); // Ensure high quality PNG
      link.click();
    });
  };

  // Get unique class options
  const classOptions = Array.from(
    new Set(admissions.map((s) => s.class_).filter(Boolean))
  );

  // Filter admissions by selected class
  const filteredAdmissions = classFilter
    ? admissions.filter((s) => s.class_ === classFilter)
    : admissions;

  if (loading) return <AdmissionsSkeleton />;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center mb-4">
        <label className="mr-2 font-semibold">Filter by Class:</label>
        <select
          className="border px-2 py-1 rounded"
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

      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>S.No</th>
              <th>Name</th>
              <th>Student ID Card No.</th>
              <th>Class</th>
              <th>Section</th>
              <th>Father's Name</th>
              <th>Mother's Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>PEN Number</th>
              <th>ID Card</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmissions.length === 0 ? (
              <tr>
                <td colSpan="11">No students found</td>
              </tr>
            ) : (
              filteredAdmissions.map((student, index) => (
                <tr key={student._id || student.id} className="border-b">
                  <td>{index + 1}</td>
                  <td>{student.studentName}</td>
                  <td>{student.idcardNumber}</td>
                  <td>{student.class_}</td>
                  <td>{student.sectionclass}</td>
                  <td>{student.fatherName}</td>
                  <td>{student.motherName}</td>
                  <td>{student.email}</td>
                  <td>{student.phone}</td>
                  <td>{student.penNumber}</td>
                  <td>
                    <button
                      className="text-emerald-600 flex items-center justify-center hover:bg-emerald-50 rounded p-1 transition-colors"
                      title="Download ID Card"
                      onClick={() => openIdCardForm(student)}
                      style={{ width: 32, height: 32 }}
                    >
                      <Download size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && selectedStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-xl w-full">
            {/* Enhanced ID Card Design */}
            <div
              id="id-card"
              className="w-[340px] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl overflow-hidden border border-gray-200 relative mx-auto"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-br-full opacity-10"></div>
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-emerald-600 to-emerald-700 rounded-bl-full opacity-10"></div>

              {/* Header section with improved gradient */}
              <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-5"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>

                <div className="relative flex items-center gap-4">
                  <div className="bg-white rounded-full p-2 border-2 border-white/20 shadow-lg flex-shrink-0">
                    {schoolLogo ? (
                      <img
                        src={getImageUrl(schoolLogo)}
                        alt="School Logo"
                        className="w-10 h-10 object-contain"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/no-photo.png";
                        }}
                      />
                    ) : (
                      <School className="w-10 h-10 text-emerald-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {" "}
                    {/* Use min-w-0 to allow content to shrink */}
                    <h1 className="text-white text-lg font-bold leading-tight drop-shadow-sm">
                      {schoolName || "JALPAI PUBLIC SCHOOL"}
                    </h1>
                    <div className="text-emerald-100 text-xs font-medium tracking-wide flex flex-col items-start mt-0.5">
                      {" "}
                      {/* Changed to flex-col for stacking */}
                      <span>STUDENT IDENTITY CARD</span>
                      <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm border border-white/20 text-emerald-700 font-bold text-xs mt-1">
                        {" "}
                        {/* Slightly smaller font and padding */}
                        ID: {selectedStudent.idcardNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content section with improved layout using grid */}
              <div className="p-4 grid grid-cols-3 gap-x-4 gap-y-1.5 items-start">
                {/* Student Photo with enhanced styling - positioned in the first column */}
                <div className="col-span-1 flex justify-center items-start pt-2">
                  <div className="w-24 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-emerald-200 shadow-lg overflow-hidden relative flex-shrink-0">
                    <img
                      src={getImageUrl(selectedStudent.photo)}
                      alt="Student"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      // Use studentPhotoBase64 to control fallback icon display
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                      style={{ display: studentPhotoBase64 ? "block" : "none" }} // Show img only if base64 is available
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400"
                      style={{ display: studentPhotoBase64 ? "none" : "flex" }}
                    >
                      <User size={32} />
                    </div>
                  </div>
                </div>

                {/* Student Information - takes the remaining 2 columns */}
                <div className="col-span-2 space-y-0.5 mt-0">
                  <InfoRow
                    icon={User}
                    label="Student Name"
                    value={selectedStudent.studentName}
                  />
                  <InfoRow
                    icon={GraduationCap}
                    label="Class & Section"
                    value={`${selectedStudent.class_} - ${selectedStudent.sectionclass}`}
                  />
                  <InfoRow
                    icon={User}
                    label="Father's Name"
                    value={selectedStudent.fatherName}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Date of Birth"
                    value={formatDate(selectedStudent.dateOfBirth)}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Address"
                    value={selectedStudent.address || "N/A"}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Contact"
                    value={selectedStudent.phone}
                  />
                </div>

                {/* Session and Blood Group in a stylized box - Spans all 3 columns below */}
                <div className="col-span-3 mt-3 p-3 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="font-semibold text-gray-700">
                        Session: 2024-25
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-semibold text-gray-700">
                        Blood: {selectedStudent.bloodGroup || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Footer section */}
              <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-600">
                    <div className="font-semibold text-emerald-700 mb-1 leading-tight">
                      {schoolName || "JALPAI PUBLIC SCHOOL"}
                    </div>
                    <div>Academic Session 2024-25</div>
                  </div>

                  <div className="flex flex-col items-center">
                    {principalSignature ? (
                      <div className="mb-2">
                        <img
                          src={getImageUrl(principalSignature)}
                          alt="Principal Signature"
                          className="h-8 max-w-20 object-contain"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/no-photo.png";
                          }}
                        />
                      </div>
                    ) : (
                      // Optional: Placeholder for missing signature
                      <div className="h-8 mb-2 flex items-center justify-center text-gray-400 text-xs">
                        No Signature
                      </div>
                    )}
                    <div className="text-xs font-bold text-emerald-700 border-t border-emerald-200 pt-1">
                      PRINCIPAL
                    </div>
                  </div>
                </div>
              </div>

              {/* Security stripe */}
              <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={downloadIdCard}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-8 py-3 rounded-lg hover:from-emerald-700 hover:to-emerald-800 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download size={18} />
                Download ID Card
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 border border-gray-300"
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

export default IDCardBuilder;
