import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, ArrowDownToLine, FilePlus2, RotateCcw, Printer } from "lucide-react";
import axios from "axios";
import { useReactToPrint } from 'react-to-print';
import html2pdf from "html2pdf.js";
import { getImageUrl } from "../../utils/getImageUrl";

const TransferCertificate = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [classFilter, setClassFilter] = useState("");
  const [editableFields, setEditableFields] = useState({});
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [principalSignature, setPrincipalSignature] = useState(null);
  const [principalSignatureBase64, setPrincipalSignatureBase64] = useState(null);
  const [schoolLogoBase64, setSchoolLogoBase64] = useState(null);
  const [schoolNameFromUser, setSchoolNameFromUser] = useState("");
  const [tcNo, setTcNo] = useState("");
  const [tcConduct, setTcConduct] = useState("");
  const [tcRemarks, setTcRemarks] = useState("");
  const [schoolDetails, setSchoolDetails] = useState({
    Schoolname: '',
    address: '',
    medium: '',
    phone: '',
    establishmentYear: '',
    affiliationStatus: '',
    schoolAffiliationNumber: '',
    schoolCode: '',
    email: '',
    website: ''
  });
 
  const printRef = useRef();

  const characterOptions = ["GOOD", "VERY GOOD", "EXCELLENT", "SATISFACTORY"];
  const nationalityOptions = ["INDIAN", "OTHER"];
  const religionOptions = ["HINDU", "MUSLIM", "CHRISTIAN", "SIKH", "OTHER"];

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleDownloadPDF = () => {
    if (printRef.current) {
      html2pdf()
        .set({
          margin: 0,
          filename: `TransferCertificate_${selectedStudent.studentName}.pdf`,
          html2canvas: { scale: 2, useCORS: true, logging: true, windowWidth: 794 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ['avoid-all'] }
        })
        .from(printRef.current)
        .save();
    }
  };

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    setSchoolId(schoolId);
    setSchoolNameFromUser(schools[0]?.Schoolname || schools[0]?.schoolName || "");

    if (!schoolId) return;
    // Fetch logo
    const fetchLogo = async () => {
      try {
        const res = await fetch(`https://api.jsic.in/api/newSchool/school-assets/by-school/${schoolId}`);
        const data = await res.json();
        setSchoolLogo(data.schoolLogo || null);
        setPrincipalSignature(data.principalSignature || null);

        // Convert principal signature to base64
        if (data.principalSignature) {
          const response = await fetch(data.principalSignature);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setPrincipalSignatureBase64(reader.result);
          };
          reader.readAsDataURL(blob);
        } else {
          setPrincipalSignatureBase64(null);
        }

        // Convert school logo to base64 for PDF
        if (data.schoolLogo) {
          const response = await fetch(data.schoolLogo);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setSchoolLogoBase64(reader.result);
          };
          reader.readAsDataURL(blob);
        } else {
          setSchoolLogoBase64(null);
        }
      } catch (err) {
        setSchoolLogo(null);
        setPrincipalSignature(null);
        setPrincipalSignatureBase64(null);
        setSchoolLogoBase64(null);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    const fetchSchoolDetails = async () => {
      if (!schoolId) return;
      
      try {
        const principal_token = localStorage.getItem("principal_token");
        const response = await axios.get(
          `https://api.jsic.in/api/newSchool/schools/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            }
          }
        );
        
        setSchoolDetails({
          Schoolname: response.data.Schoolname,
          address: response.data.address,
          medium: response.data.medium,
          phone: response.data.phone,
          establishmentYear: response.data.establishmentYear,
          affiliationStatus: response.data.affiliationStatus,
          schoolAffiliationNumber: response.data.schoolAffiliationNumber,
          schoolCode: response.data.schoolCode
        });
      } catch (err) {
        console.error("Error fetching school details:", err);
      }
    };
  
    fetchSchoolDetails();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    const fetchAdmissions = async () => {
      try {
        const principal_token = localStorage.getItem("principal_token");
        const response = await axios.get(
          `https://api.jsic.in/api/admission/students/by-school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );
        setAdmissions(response.data.students || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmissions();
  }, [schoolId]);

  useEffect(() => {
    const fetchTcNo = async () => {
      if (!selectedStudent || !schoolId) return;
      try {
        const principal_token = localStorage.getItem("principal_token");
        const res = await axios.get(
          `https://api.jsic.in/api/transferCertificate/schools/${schoolId}/students/${selectedStudent.id}/transfer-certificates`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );
        // Assuming the latest TC is first in the array
        const tcData = res.data.data?.[0] || {};
        setTcNo(tcData.tcNo || "");
        setTcConduct(tcData.conductAndCharacter || "");
        setTcRemarks(tcData.remarks || "");
      } catch (err) {
        setTcNo("");
        setTcConduct("");
        setTcRemarks("");
      }
    };
    fetchTcNo();
  }, [selectedStudent, schoolId]);

  // Unique class options for filter (use class_ instead of class)
  const classOptions = useMemo(
    () => Array.from(new Set(admissions.map((s) => s.class_).filter(Boolean))),
    [admissions]
  );

  // Filtered admissions by search and class (use class_ instead of class)
  const filteredAdmissions = useMemo(
    () =>
      admissions.filter(
        (student) =>
          student.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          (classFilter ? student.class_ === classFilter : true)
      ),
    [admissions, searchQuery, classFilter]
  );

  const handleGenerateTC = async (student) => {
    try {
      const reason = prompt("Reason for leaving?");
      const remarks = prompt("Any remarks?");
      const principal_token = localStorage.getItem("principal_token");

      // Use editable fields for dynamic values if present
      const fields = editableFields[student.id] || {};
      const leftDate = fields.leftDate || new Date().toISOString().split("T")[0];
      const character = fields.character || "GOOD";
      const nationality = fields.nationality || "INDIAN";
      const religion = fields.religion || "HINDU";

      const res = await axios.post(
        `https://api.jsic.in/api/transferCertificate/students/${student.id}/transfer-certificate`,
        {
          reason,
          remarks,
          schoolId: parseInt(schoolId, 10),
          pdfUrl: "",
          dateOfLeaving: leftDate,
          conductAndCharacter: character,
          nationality,
          religion,
        },
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );
      if (res.data.success) {
        alert("Transfer Certificate issued successfully!");
        setSelectedStudent(student);
      } else {
        alert("Failed to issue Transfer Certificate");
      }
    } catch (err) {
      alert("Error issuing Transfer Certificate");
    }
  };

  const fetchStudentTCs = async (studentId) => {
    try {
      const principal_token = localStorage.getItem("principal_token");
      // Use schoolId from state (already set in useEffect)
      const res = await axios.get(
        `https://api.jsic.in/api/transferCertificate/schools/${schoolId}/students/${studentId}/transfer-certificates`,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );
      // You can use res.data.data for the certificates
      return res.data.data;
    } catch (err) {
      alert("Failed to fetch transfer certificates");
      return [];
    }
  };

  const handleRollbackTC = async (student) => {
    try {
      const principal_token = localStorage.getItem("principal_token");
      const res = await axios.post(
        `https://api.jsic.in/api/transferCertificate/students/${student.id}/transfer-certificate/rollback`,
        {},
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );
      if (res.data.success) {
        alert("TC status rolled back!");
        // Update UI: set isTransferCertIssued to false for this student
        setAdmissions((prev) =>
          prev.map((s) =>
            s.id === student.id ? { ...s, isTransferCertIssued: false, isActive: true } : s
          )
        );
      } else {
        alert("Failed to roll back TC status");
      }
    } catch (err) {
      alert("Error rolling back TC status");
    }
  };

  const handleFieldChange = (studentId, field, value) => {
    setEditableFields((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      {!selectedStudent ? (
        <>
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold">TranferCertificate</h1>
          </div>

          <div className="flex gap-3">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
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

          <div className="overflow-auto rounded shadow mt-4" style={{ maxHeight: "400px" }}>
            <table className="min-w-full border text-sm" id="tc-students-table">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Father's Name</th>
                  <th className="border px-2 py-1">Mother's Name</th>
                  <th className="border px-2 py-1">Class</th>
                  <th className="border px-2 py-1">Roll Number</th>
                  <th className="border px-2 py-1">Left Date</th>
                  <th className="border px-2 py-1">Character</th>
                  <th className="border px-2 py-1">Nationality</th>
                  <th className="border px-2 py-1">Religion</th>
                  <th className="border px-2 py-1">Date of Birth</th>
                  <th className="border px-2 py-1">TC Status</th>
                  <th className="border px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="text-center py-2 text-gray-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((student, idx) => (
                    <tr
                      key={student.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-blue-50 transition"}
                    >
                      <td className="border px-2 py-1">{idx + 1}</td>
                      <td className="border px-2 py-1 font-semibold">{student.studentName}</td>
                      <td className="border px-2 py-1">{student.fatherName}</td>
                      <td className="border px-2 py-1">{student.motherName}</td>
                      <td className="border px-2 py-1">{student.class_}</td>
                      <td className="border px-2 py-1">{student.rollNumber}</td>
                      <td className="border px-2 py-1">
                        <input
                          type="date"
                          value={
                            editableFields[student.id]?.leftDate ||
                            new Date().toISOString().split("T")[0]
                          }
                          onChange={(e) => handleFieldChange(student.id, "leftDate", e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                        />
                      </td>
                      <td className="border px-2 py-1">
                        <select
                          value={editableFields[student.id]?.character || "GOOD"}
                          onChange={(e) => handleFieldChange(student.id, "character", e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                        >
                          {characterOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-2 py-1">
                        <select
                          value={editableFields[student.id]?.nationality || "INDIAN"}
                          onChange={(e) => handleFieldChange(student.id, "nationality", e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                        >
                          {nationalityOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-2 py-1">
                        <select
                          value={editableFields[student.id]?.religion || "HINDU"}
                          onChange={(e) => handleFieldChange(student.id, "religion", e.target.value)}
                          className="border rounded px-1 py-0.5 text-xs"
                        >
                          {religionOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="border px-2 py-1">{new Date(student.dateOfBirth).toLocaleDateString()}</td>
                      <td className="border px-2 py-1">
                        {student.isTransferCertIssued ? (
                          <span className="text-green-600 font-semibold">Issued</span>
                        ) : (
                          <span className="text-gray-500">Not Issued</span>
                        )}
                      </td>
                      <td className="border px-2 py-1 flex gap-2 justify-center">
                        <button
                          onClick={() => handleGenerateTC(student)}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                          title="Generate Transfer Certificate"
                        >
                          <FilePlus2 size={16} />
                        </button>
                      </td>
                      <td className="border px-2 py-1 flex gap-2 justify-center">
                        {student.isTransferCertIssued && (
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 flex items-center justify-center"
                            title="Print TC"
                          >
                            <Printer size={16} />
                          </button>
                        )}
                      </td>
                      <td className="border px-2 py-1 flex gap-2 justify-center">
                        {student.isTransferCertIssued && (
                          <button
                            onClick={() => handleRollbackTC(student)}
                            className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 flex items-center justify-center"
                            title="Rollback TC"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {selectedStudent && (
            <>
              <div ref={printRef}>
                <div
                  id="force-one-page"
                  className="relative mx-auto bg-white shadow-lg"
                  style={{
                    width: "210mm",
                    height: "297mm", // fixed height for A4
                    position: "relative",
                    border: "2px solid #000",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    padding: "24px" // adjust as needed, but don't exceed height
                  }}
                >
                  {/* Header */}
                  <div className="bg-yellow-50 p-4 rounded-md border-b-4 border-red-600">
                    <div className="flex items-center">
                      <img
                        src={getImageUrl(schoolLogo) || "/school-logo.png"}
                        alt="School Logo"
                        className="w-20 h-20 mr-4"
                        style={{ 
                          objectFit: "contain",
                          backgroundColor: "white",
                          padding: "2px",
                          borderRadius: "4px"
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/school-logo.png";
                        }}
                      />
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold text-indigo-900">
                          {schoolDetails.Schoolname || schoolNameFromUser || "School Name"}
                        </h1>
                        <h2 className="text-xl font-bold text-indigo-800">
                          {schoolDetails.medium || ""} MEDIUM
                        </h2>
                        <p className="text-sm text-indigo-800">
                          {schoolDetails.affiliationStatus 
                            ? `Affiliated to ${schoolDetails.affiliationStatus} Board`
                            : ""}
                        </p>
                        <p className="text-sm">{schoolDetails.address}</p>
                        {schoolDetails.phone && (
                          <p className="text-sm">Phone: {schoolDetails.phone}</p>
                        )}
                        {schoolDetails.establishmentYear && (
                          <p className="text-sm">Est. {schoolDetails.establishmentYear}</p>
                        )}
                        <div className="flex justify-between text-sm mt-1">
                          <span>Email: {schoolDetails.email || ""}</span>
                          <span>Website: {schoolDetails.website || ""}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-pink-600 font-bold">
                            Affiliation No: {schoolDetails.schoolAffiliationNumber || ""}
                          </span>
                          <span className="text-pink-600 font-bold">
                            School Code: {schoolDetails.schoolCode || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center my-6">
                    <div className="inline-block border-2 border-black px-8 py-2">
                      <h2 className="text-2xl font-bold">TRANSFER CERTIFICATE</h2>
                    </div>
                  </div>

                  {/* Reference Numbers */}
                  <div className="flex justify-between mb-6">
                    <div><strong>Ref.No.</strong> {tcNo || "__________"}</div>
                    
                    <div><strong>Admn. No:</strong> {selectedStudent.Admission_Number || "__________"}</div>
                  </div>

                  {/* Certificate Content */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex">
                      <div className="w-2/3">1. Name of Pupil</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.studentName}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">2. Name of Father / Guardian</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.fatherName}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">3. Gender</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.gender}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">4. Nationality</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.nationality || "Indian"}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">5. Religion & Caste</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.religion} {selectedStudent.caste}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">7. Date of Birth according to Admission Register (In figures and words)</div>
                      <div className="w-1/3">: <span className="font-bold">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">8. Class in which the pupil last studied</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.class_}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">10. Whether the candidate has passed the Craft Subject, Core subject / work experience / Health and Physical Education</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.passedCraft || "Certified"}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">18. Date of issue of Transfer Certificate</div>
                      <div className="w-1/3">: <span className="font-bold">{new Date().toLocaleDateString()}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">19. Reason for leaving the school</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.reasonForLeaving}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">20. Number of school days up to date</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.schoolDaysUpToDate}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">21. Number of school days the pupil attended</div>
                      <div className="w-1/3">: <span className="font-bold">{selectedStudent.schoolDaysAttended}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">22. General Conduct</div>
                      <div className="w-1/3">: <span className="font-bold">{tcConduct || selectedStudent.conduct}</span></div>
                    </div>
                    <div className="flex">
                      <div className="w-2/3">23. Any other Remarks</div>
                      <div className="w-1/3">: <span className="font-bold">{tcRemarks || selectedStudent.remarks}</span></div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between mt-12 mb-6 pt-6">
                    <div>
                      <p><strong>CLASS TEACHER</strong></p>
                      <div className="h-16"></div>
                    </div>
                    <div>
                      <p><strong>VERIFIED BY</strong></p>
                      <div className="h-16"></div>
                    </div>
                    <div>
                      {principalSignature && (
                        <img src={getImageUrl(principalSignature)} alt="Principal Signature" crossOrigin="anonymous" 
                          className="h-8 mb-2 mx-auto flex-shrink-0 align-middle"
                        />
                      )}
                      <p className="text-center font-bold mt-2">PRINCIPAL</p>
                    </div>
                  </div>

                  {/* Watermark */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.10,
                      pointerEvents: "none",
                      zIndex: 0,
                      transform: "rotate(-45deg)"
                    }}
                  >
                    <p className="text-6xl font-bold text-gray-500 select-none">True Copy</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-6 max-w-[800px] mx-auto no-print">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Back
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded ml-2"
                >
                  Download PDF
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TransferCertificate;

