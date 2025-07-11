import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DropBox = () => {
  const [droppedStudents, setDroppedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const schools = user?.user?.schools || user?.schools || [];
    setSchoolId(schools[0]?.id || null);
  }, []);

  useEffect(() => {
    if (!schoolId) return;
    fetchDroppedStudents();
    // eslint-disable-next-line
  }, [schoolId]);

  const fetchDroppedStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.jsic.in/api/admission/students/by-school/${schoolId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      const dropped = (res.data.students || []).filter(
        (student) => student.isStudentmarkdrop === true || student.isStudentmarkdrop === "true"
      );
      setDroppedStudents(dropped);
    } catch (err) {
      toast.error("Failed to fetch dropped students");
    }
    setLoading(false);
  };

  const handleRevoke = async (studentId) => {
    if (!window.confirm("Revoke drop for this student?")) return;
    try {
      await axios.patch(
        `https://api.jsic.in/api/sessions/students/${studentId}/revoke`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      toast.success("Student restored!");
      fetchDroppedStudents();
    } catch (err) {
      toast.error("Failed to revoke drop");
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Delete this dropped student permanently?")) return;
    try {
      await axios.delete(
        `https://api.jsic.in/api/admission/students/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("principal_token")}`,
          },
        }
      );
      toast.success("Student deleted!");
      fetchDroppedStudents();
    } catch (err) {
      toast.error("Failed to delete student");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Drop Box (Dropped Students)</h2>
      {loading ? (
        <div>Loading...</div>
      ) : droppedStudents.length === 0 ? (
        <div className="text-gray-500">No dropped students found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Name</th>
                <th className="border px-2 py-1">Admission No.</th>
                <th className="border px-2 py-1">Class</th>
                <th className="border px-2 py-1">Section</th>
                <th className="border px-2 py-1">Father</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {droppedStudents.map((student, idx) => (
                <tr key={student.id || student._id}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{student.studentName}</td>
                  <td className="border px-2 py-1">{student.Admission_Number}</td>
                  <td className="border px-2 py-1">{student.class_}</td>
                  <td className="border px-2 py-1">{student.sectionclass}</td>
                  <td className="border px-2 py-1">{student.fatherName}</td>
                  <td className="border px-2 py-1">{student.phone}</td>
                  <td className="border px-2 py-1 flex gap-2">
                    <button
                      className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                      onClick={() => handleRevoke(student.id || student._id)}
                    >
                      Revoke
                    </button>
                    <button
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                      onClick={() => handleDelete(student.id || student._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DropBox;
// ...end of file...