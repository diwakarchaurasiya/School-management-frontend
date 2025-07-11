import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CLASS_OPTIONS = [
  "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
];
const SECTION_OPTIONS = ["A", "B", "C", "D"];

const AdmissionPublic = () => {
  const [form, setForm] = useState({
    studentName: "",
    dateOfBirth: "",
    schoolId: "1", // Predefined
    gender: "male",
    assignedSection: "A",
    class_: "LKG",
    fatherName: "",
    motherName: "",
    address: "",
    aadharNumber: "",
    phone: "",
    penNumber: "",
    email: "",
    religion: "Hindu", // default
    caste: "Gen" // default
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setShowPreview(true);
  };

  const handleFinalSubmit = async () => {
    setConfirmSubmit(false);
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || "https://api.jsic.in";
      const res = await axios.post(`${API_BASE}/api/admission/public/register-student`, form);
      if (res.data.success) {
        toast.success(res.data.message || "Student registered successfully!");
        setModalData({
          applicationNumber: res.data.Application_Number,
          class_: res.data.class_,
          assignedSection: res.data.assignedSection
        });
        setForm({
          studentName: "",
          dateOfBirth: "",
          schoolId: "1",
          gender: "male",
          assignedSection: "A",
          class_: "LKG",
          fatherName: "",
          motherName: "",
          address: "",
          aadharNumber: "",
          phone: "",
          penNumber: "",
          email: "",
          religion: "Hindu",
          caste: "Gen"
        });
        setShowPreview(false);
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await axios.post("https://api.jsic.in/api/admission/public/register-student", form);
      if (res.data.success) {
        toast.success(res.data.message || "Student registered successfully!");
        setModalData({
          applicationNumber: res.data.Application_Number,
          class_: res.data.class_,
          assignedSection: res.data.assignedSection
        });
        setForm({
          studentName: "",
          dateOfBirth: "",
          schoolId: "1",
          gender: "male",
          assignedSection: "A",
          class_: "LKG",
          fatherName: "",
          motherName: "",
          address: "",
          aadharNumber: "",
          phone: "",
          penNumber: "",
          email: "",
          religion: "Hindu",
          caste: "Gen"
        });
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Admission Form</h2>
      {/* Modal for application details */}
      {modalData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4 text-green-700">Application Submitted!</h3>
            <div className="mb-2">Application Number: <span className="font-semibold">{modalData.applicationNumber}</span></div>
            <div className="mb-2">Class: <span className="font-semibold">{modalData.class_}</span></div>
            <div className="mb-4">Section: <span className="font-semibold">{modalData.assignedSection}</span></div>
            <a href="/" className="inline-block w-full">
              <button type="button" className="w-full bg-black text-white py-2 rounded font-semibold mt-2 hover:bg-blue-700 transition">
                Go to Home
              </button>
            </a>
            <button onClick={() => setModalData(null)} className="mt-2 text-blue-600 underline text-sm">Close</button>
          </div>
        </div>
      )}
      {error && <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">{error}</div>}
      <form onSubmit={handlePreview} className="space-y-3">
        <div>
          <label className="block mb-1 font-medium">Student Name*</label>
          <input type="text" name="studentName" value={form.studentName} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Date of Birth*</label>
          <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        {/* School ID field removed, value is predefined as 1 */}
        <div>
          <label className="block mb-1 font-medium">Gender*</label>
          <select name="gender" value={form.gender} onChange={handleChange} required className="w-full border rounded px-2 py-1">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Class*</label>
          <select name="class_" value={form.class_} onChange={handleChange} required className="w-full border rounded px-2 py-1">
            {CLASS_OPTIONS.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Section*</label>
          <select name="assignedSection" value={form.assignedSection} onChange={handleChange} required className="w-full border rounded px-2 py-1">
            {SECTION_OPTIONS.map((sec) => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Father's Name*</label>
          <input type="text" name="fatherName" value={form.fatherName} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mother's Name*</label>
          <input type="text" name="motherName" value={form.motherName} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Address*</label>
          <input type="text" name="address" value={form.address} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Aadhar Number</label>
          <input type="text" name="aadharNumber" value={form.aadharNumber} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone*</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">PEN Number</label>
          <input type="text" name="penNumber" value={form.penNumber} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Religion</label>
          <select name="religion" value={form.religion} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="Hindu">Hindu</option>
            <option value="Muslim">Muslim</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Caste</label>
          <select name="caste" value={form.caste} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="Gen">Gen</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-black text-white py-2 rounded font-semibold mt-2 hover:bg-blue-700 transition">
          {loading ? "Registering..." : "Register Student"}
        </button>
      </form>
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full text-left">
            <h3 className="text-xl font-bold mb-4 text-blue-700 text-center">Preview Admission Details</h3>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {Object.entries(form).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span> {value || <span className="text-gray-400">-</span>}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowPreview(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Edit</button>
              <button onClick={() => setConfirmSubmit(true)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
            </div>
          </div>
        </div>
      )}
      {/* Confirmation Dialog */}
      {confirmSubmit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-xs w-full text-center">
            <h3 className="text-lg font-bold mb-4">Are you sure for Admission?</h3>
            <div className="flex justify-center gap-4">
              <button onClick={handleFinalSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Yes, Submit</button>
              <button onClick={() => setConfirmSubmit(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionPublic;
