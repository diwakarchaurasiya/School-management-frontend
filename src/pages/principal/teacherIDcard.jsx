import React, { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import AdmissionsSkeleton from "../../Loading/AdmissionsLoading";
import { Download } from "lucide-react";
import { getImageUrl } from "../../utils/getImageUrl";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="mb-1">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm ml-2">: {value}</span>
  </div>
);

const TeacherIDCard = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [schoolId, setSchoolId] = useState(null);
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [principalSignature, setPrincipalSignature] = useState(null);

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
    const fetchTeachers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5002/api/teacher/teachers/by-school/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "principal_token"
              )}`,
            },
          }
        );
        setTeachers(response.data.teachers || []);
      } catch {
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    const fetchAssets = async () => {
      try {
        const res = await fetch(
          `http://localhost:5002/api/newSchool/school-assets/by-school/${schoolId}`
        );
        const data = await res.json();
        // School Logo
        if (data.schoolLogo) {
          setSchoolLogo(data.schoolLogo);
        }
        // Principal Signature
        if (data.principalSignature) {
          setPrincipalSignature(data.principalSignature);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
        setSchoolLogo(null);
        setPrincipalSignature(null);
      }
    };
    fetchAssets();
  }, [schoolId]);

  const fetchTeacherPhotoBase64 = async (photoUrl) => {
    if (!photoUrl) {
      setTeacherPhotoBase64("");
      return;
    }
    try {
      const response = await fetch(photoUrl, { mode: "cors" });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setTeacherPhotoBase64(reader.result);
      reader.readAsDataURL(blob);
    } catch {
      setTeacherPhotoBase64("");
    }
  };

  const openIdCardForm = (teacher) => {
    setSelectedTeacher(teacher);
    setShowModal(true);
    fetchTeacherPhotoBase64(teacher.photo);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTeacher(null);
  };

  const handleDownloadIdCard = async () => {
    const cardElement = document.getElementById("teacherIdCardPreview");
    if (!cardElement) return;

    // Wait for images to load
    const images = cardElement.getElementsByTagName("img");
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    // Additional delay to ensure everything is rendered
    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(cardElement, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      logging: true,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png", 1.0);
    link.download = `Teacher_ID_Card_${selectedTeacher.fullName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <AdmissionsSkeleton />;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th>S.No</th>
              <th>Name</th>
              <th>Teacher ID</th>
              <th>Subject</th>
              <th>Email</th>
              <th>Phone</th>
              <th>ID Card</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="7">No teachers found</td>
              </tr>
            ) : (
              teachers.map((teacher, index) => (
                <tr key={teacher.id || teacher._id} className="border-b">
                  <td>{index + 1}</td>
                  <td className="flex items-center gap-3 py-2">
                    <div className="w-12 h-12 flex-shrink-0">
                      {teacher.photo ? (
                        <img
                          src={getImageUrl(teacher.photo)}
                          alt="Student"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : (
                        <img
                          src="/placeholder-teacher.png"
                          alt="No Photo"
                          className="w-12 h-12 rounded object-cover border opacity-60"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {teacher.fullName || (
                          <span className="text-gray-400">No Name</span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <form
                          style={{ display: "inline" }}
                          encType="multipart/form-data"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              if (file.size > 51200) {
                                alert("Photo must not exceed 50KB");
                                return;
                              }
                              const formData = new FormData();
                              formData.append("photo", file);
                              try {
                                const res = await fetch(
                                  `http://localhost:5002/api/teacher/teacher/${teacher.id}/photo`,
                                  {
                                    method: "POST",
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "principal_token"
                                      )}`,
                                    },
                                    body: formData,
                                  }
                                );
                                const data = await res.json();
                                if (data.success) {
                                  setTeachers((prev) =>
                                    prev.map((t) =>
                                      t.id === teacher.id
                                        ? { ...t, photo: data.photoUrl }
                                        : t
                                    )
                                  );
                                  alert("Photo uploaded!");
                                } else {
                                  alert(data.message || "Photo upload failed");
                                }
                              } catch {
                                alert("Photo upload failed");
                              }
                            }
                          }}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            id={`teacher-photo-upload-${teacher.id}`}
                          />
                          <label
                            htmlFor={`teacher-photo-upload-${teacher.id}`}
                            className="text-xs text-blue-600 underline cursor-pointer"
                            title="Update Photo"
                          >
                            Upload
                          </label>
                        </form>
                        {teacher.photo && (
                          <button
                            className="text-xs text-red-600 underline cursor-pointer"
                            title="Delete Photo"
                            onClick={async () => {
                              if (
                                !window.confirm("Delete this teacher's photo?")
                              )
                                return;
                              try {
                                const res = await fetch(
                                  `http://localhost:5002/api/teacher/teacher/${teacher.id}/photo`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: `Bearer ${localStorage.getItem(
                                        "principal_token"
                                      )}`,
                                    },
                                  }
                                );
                                const data = await res.json();
                                if (data.success) {
                                  setTeachers((prev) =>
                                    prev.map((t) =>
                                      t.id === teacher.id
                                        ? { ...t, photo: null }
                                        : t
                                    )
                                  );
                                  alert("Photo deleted!");
                                } else {
                                  alert(data.message || "Photo delete failed");
                                }
                              } catch {
                                alert("Photo delete failed");
                              }
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              marginLeft: 8,
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{teacher.teacherId || teacher.id}</td>
                  <td>{teacher.subjects}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone}</td>
                  <td>
                    <button
                      className="text-emerald-600 flex items-center justify-center"
                      title="Download ID Card"
                      onClick={() => openIdCardForm(teacher)}
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

      {showModal && selectedTeacher && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4">
            {/* ID Card Preview Container */}
            <div
              id="teacherIdCardPreview"
              className="w-[400px] bg-white rounded-lg shadow-lg overflow-hidden border-2 border-emerald-700 mb-4"
            >
              {/* Header section */}
              <div className="bg-emerald-700 p-4 flex items-center gap-4">
                <div className="bg-white rounded-full p-2 border border-emerald-700">
                  <img
                    src={getImageUrl(schoolLogo)}
                    alt="School Logo"
                    className="w-10 h-10 object-contain"
                    crossOrigin="anonymous"
                    loading="eager"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/no-photo.png";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-white text-2xl font-bold">
                    {schoolName || "SCHOOL NAME"}
                  </h1>
                  <div className="text-emerald-100 text-sm">
                    TEACHER ID CARD
                  </div>
                </div>
                <div className="bg-white px-3 py-1 rounded">
                  <span className="text-sm text-emerald-700">
                    ID: {selectedTeacher.teacherId || selectedTeacher.id}
                  </span>
                </div>
              </div>

              {/* Content section */}
              <div className="p-4 flex gap-4">
                <div className="flex-1">
                  <InfoRow label="NAME" value={selectedTeacher.fullName} />
                  <InfoRow label="SUBJECT" value={selectedTeacher.subjects} />
                  <InfoRow label="EMAIL" value={selectedTeacher.email} />
                  <InfoRow label="PHONE" value={selectedTeacher.phone} />
                  <InfoRow
                    label="JOINED"
                    value={
                      selectedTeacher.joiningDate
                        ? new Date(
                            selectedTeacher.joiningDate
                          ).toLocaleDateString()
                        : "N/A"
                    }
                  />
                  <InfoRow
                    label="ADDRESS"
                    value={selectedTeacher.address || "N/A"}
                  />
                </div>
                <div className="w-32">
                  <div className="w-full h-40 bg-gray-200 border-2 border-emerald-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={getImageUrl(selectedTeacher?.photo)}
                      alt="Teacher"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      loading="eager"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-photo.png";
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer section */}
              <div className="border-t border-gray-200 p-4 flex justify-between items-end">
                <div />
                <div className="flex flex-col items-center">
                  {principalSignature && (
                    <img
                      src={getImageUrl(principalSignature)}
                      alt="Principal Signature"
                      className="h-8 w-32 object-contain"
                      style={{ maxWidth: "100px", maxHeight: "40px" }}
                      crossOrigin="anonymous"
                      loading="eager"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-photo.png";
                      }}
                    />
                  )}
                  <div className="text-sm font-semibold text-emerald-700 mt-1">
                    Principal
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={handleDownloadIdCard}
                className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 flex items-center gap-2"
              >
                Download ID Card
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
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

export default TeacherIDCard;
