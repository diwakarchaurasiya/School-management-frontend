import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { UserPlus, Users } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentOnboarding = () => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(-1);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [classes, setClasses] = useState([]);
  const [schoolId, setSchoolId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  // Get schoolId from user object in localStorage
  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    // Extract schoolIds from user.schools
    const schools = user?.user?.schools || user?.schools || [];
    const schoolId = schools[0]?.id || null;
    setSchoolId(schoolId);
  }, []);

  useEffect(() => {
    // Set default zoom to 80% for this page
    const prevZoom = document.body.style.zoom;
    document.body.style.zoom = "85%";
    return () => {
      document.body.style.zoom = prevZoom || "";
    };
  }, []);

  // Fetch classes for the current schoolId
  useEffect(() => {
    if (!schoolId) return;
    const fetchClasses = async () => {
      try {
        const principal_token = localStorage.getItem("principal_token");
        const res = await axios.get(
          `http://localhost:5002/api/classes/${schoolId}`,
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );
        setClasses(res.data.classes || []);
      } catch (error) {
        toast.error("❌ Failed to load classes");
      }
    };
    fetchClasses();
  }, [schoolId]);

  // Fetch subjects for the selected class
  useEffect(() => {
    if (!selectedClassId || !schoolId) {
      setSubjects([]);
      return;
    }
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5002/api/newSchool/schools/${schoolId}`,
          {
            params: {
              schoolId: schoolId,
              classId: selectedClassId,
            },
          }
        );
        // Adjust this according to your backend response structure
        setSubjects(res.data.subjects || []);
      } catch (error) {
        setSubjects([]);
        toast.error("❌ Failed to load subjects");
      }
    };
    fetchSubjects();
  }, [selectedClassId, schoolId]);

  // Get selected class object
  const selectedClassObj = classes.find(
    (cls) => String(cls.id) === String(selectedClassId)
  );

  // Sections for selected class
  const sections = selectedClassObj?.sections || [];

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setValue("subjects", subjects);
    } else {
      setValue("subjects", []);
    }
  };

  const watchedSubjects = watch("subjects") || [];
  const months = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  const onSubmit = async (data) => {
    try {
      // Find selected section object
      const selectedSectionObj = sections.find(
        (sec) => sec.id === data.assignedSection
      );

      const formattedData = {
        ...data,
        class_: selectedClassObj?.name || "",
        assignedSection: selectedSectionObj?.sectionName || "",
        classId: selectedClassId,
        schoolId: schoolId,
        dateOfBirth: new Date(data.dateOfBirth).toISOString(),
      };

      // Get token from localStorage
      const principal_token = localStorage.getItem("principal_token");

      const response = await axios.post(
        "http://localhost:5002/api/admission/admission",
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${principal_token}`,
          },
        }
      );

      if (response.status === 201 || response.status === 200) {
        toast.success("✨ Student Registration Successful!");
        console.log("Response student data:", response.data);

        setRegisteredStudent(response.data); // Save returned student data
        setShowSuccessModal(true); // Open modal
        reset();
        setSelectedClassId("");
      } else {
        toast.error("❌ Failed to register student");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "❌ Failed to register student"
      );
    }
  };

  // Confirmation handler for modal
  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    if (pendingFormData) {
      await onSubmit(pendingFormData);
      setPendingFormData(null);
    }
  };

  // Intercept form submit to show confirmation modal
  const handleFormSubmit = (formData) => {
    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const handleAddFees = () => {
    console.log("Registered Student:", registeredStudent);

    if (registeredStudent) {
      navigate(`/principal/School-Fees-Management`);
    } else {
      toast.error("Student data not available for fees collection.");
    }
  };

  const handleAddNewStudent = () => {
    setShowSuccessModal(false);
    setRegisteredStudent(null);
    // The form is already reset by `onSubmit`, so no additional reset needed here.
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl text-center font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
        <UserPlus /> Student Registration
      </h2>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Student Admission Number */}
        <div className="mb-4">
          <label
            htmlFor="Admission Number"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Admission Number
          </label>
          <input
            placeholder="If you want to admission Not to be auto generated"
            id="Admission_Number"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
            {...register("Admission_Number", {})}
          />
          {errors.Admission_Number && (
            <p className="text-sm text-[red] mt-1">
              {errors.Admission_Number.message}
            </p>
          )}
        </div>
        {/* Student Name */}
        <div className="mb-4">
          <label
            htmlFor="studentName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Student Name
          </label>
          <input
            placeholder="e.g., John Doe"
            id="studentName"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
            {...register("studentName", {
              required: "Student name is required",
            })}
          />
          {errors.studentName && (
            <p className="text-sm text-[red] mt-1">
              {errors.studentName.message}
            </p>
          )}
        </div>

        {/* Date of Birth & Gender */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("dateOfBirth", {
                required: "Date of Birth is required",
              })}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-[red] mt-1">
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="gender"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gender
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("gender", { required: "Gender is required" })}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-[red] mt-1">{errors.gender.message}</p>
            )}
          </div>
        </div>
        {/* Class & Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="class_"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Class
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("class_", { required: "Class is required" })}
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectAll(false);
                setValue("subjects", []);
              }}
            >
              <option value="" disabled>
                Select Class
              </option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {errors.class_ && (
              <p className="text-sm text-[red] mt-1">{errors.class_.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="assignedSection"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Section
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("assignedSection", {
                required: "Section is required",
              })}
            >
              <option value="" disabled>
                Select Section
              </option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.sectionName}
                </option>
              ))}
            </select>
            {errors.assignedSection && (
              <p className="text-sm text-[red] mt-1">
                {errors.assignedSection.message}
              </p>
            )}
          </div>
        </div>
        {/* Religion & Caste */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Religion Dropdown */}
          <div className="mb-4">
            <label
              htmlFor="religion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Religion
            </label>
            <select
              id="religion"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("religion", { required: "Religion is required" })}
            >
              <option value="" disabled>
                Select Religion
              </option>
              <option value="Hindu">Hindu</option>
              <option value="Muslim">Muslim</option>
              <option value="Christian">Christian</option>
              <option value="Sikh">Sikh</option>
              <option value="Other">Other</option>
            </select>
            {errors.religion && (
              <p className="text-sm text-[red] mt-1">
                {errors.religion.message}
              </p>
            )}
          </div>
          {/* Caste Dropdown */}
          <div className="mb-4">
            <label
              htmlFor="caste"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Caste
            </label>
            <select
              id="caste"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("caste", { required: "Caste is required" })}
            >
              <option value="" disabled>
                Select Caste
              </option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="Other">Other</option>
            </select>
            {errors.caste && (
              <p className="text-sm text-[red] mt-1">{errors.caste.message}</p>
            )}
          </div>
        </div>
        {/* Parent Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="fatherName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Father's Name
            </label>
            <input
              placeholder="e.g., Mr. Doe"
              id="fatherName"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("fatherName", {
                required: "Father's name is required",
              })}
            />
            {errors.fatherName && (
              <p className="text-sm text-[red] mt-1">
                {errors.fatherName.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="motherName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mother's Name
            </label>
            <input
              placeholder="e.g., Mrs. Doe"
              id="motherName"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("motherName", {
                required: "Mother's name is required",
              })}
            />
            {errors.motherName && (
              <p className="text-sm text-[red] mt-1">
                {errors.motherName.message}
              </p>
            )}
          </div>
        </div>
        {/* Aadhar Number and PEN Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="aadharNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Aadhar Number
            </label>
            <input
              placeholder="e.g., 1234 5678 9012"
              id="aadharNumber"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("aadharNumber", {})}
            />
            {errors.aadharNumber && (
              <p className="text-sm text-[red] mt-1">
                {errors.aadharNumber.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="penNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PEN Number
            </label>
            <input
              placeholder="e.g., PEN123456789"
              id="penNumber"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("penNumber", {})}
            />
            {errors.penNumber && (
              <p className="text-sm text-[red] mt-1">
                {errors.penNumber.message}
              </p>
            )}
          </div>
        </div>
        {/* Address */}
        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Address
          </label>
          <textarea
            placeholder="e.g., 123 Main Street, City, ZIP"
            id="address"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black] resize-none"
            {...register("address", { required: "Address is required" })}
          />
          {errors.address && (
            <p className="text-sm text-[red] mt-1">{errors.address.message}</p>
          )}
        </div>
        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone
            </label>
            <input
              placeholder="e.g., 9876543210"
              id="phone"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("phone", { required: "Phone is required" })}
            />
            {errors.phone && (
              <p className="text-sm text-[red] mt-1">{errors.phone.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              placeholder="e.g., john@example.com"
              id="email"
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[black]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-[red] mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
        {/* Subjects */}
        {selectedClassId && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Subjects
            </label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span>Select All</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subjects.map((subject) => (
                <label key={subject} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={subject}
                    {...register("subjects", {
                      required: "Please select at least one subject",
                    })}
                    checked={watchedSubjects.includes(subject)}
                    onChange={(e) => {
                      const newSubjects = e.target.checked
                        ? [...watchedSubjects, subject]
                        : watchedSubjects.filter((sub) => sub !== subject);
                      setValue("subjects", newSubjects);
                      if (newSubjects.length !== subjects.length) {
                        setSelectAll(false);
                      } else {
                        setSelectAll(true);
                      }
                    }}
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
            {errors.subjects && (
              <p className="text-sm text-[red] mt-1">
                {errors.subjects.message}
              </p>
            )}
          </div>
        )}
        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[black] text-white py-2 px-4 rounded-md hover:bg-opacity-90 flex items-center justify-center gap-2"
        >
          <Users /> Submit
        </button>
      </form>

      {/* Success Modal */}
      {showSuccessModal && registeredStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-green-700 text-center">
              Student Registered Successfully! 🎉
            </h3>
            <div className="mb-6 space-y-2">
              <p>
                <b>Name:</b> {registeredStudent.student?.studentName}
              </p>
              <p>
                <b>Admission Number:</b>{" "}
                {registeredStudent.Admission_Number || "Auto Generated"}
              </p>
              <p>
                <b>Class:</b> {registeredStudent.class_}
              </p>
              <p>
                <b>Section:</b> {registeredStudent.assignedSection}
              </p>
              {registeredStudent.feesPaid &&
                registeredStudent.feesPaid.length > 0 && (
                  <p>
                    <b>Fees Paid:</b> {registeredStudent.feesPaid.join(", ")}
                  </p>
                )}
            </div>
            <div className="flex justify-between gap-4">
              <button
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors duration-200"
                onClick={handleAddNewStudent}
              >
                Add New Student
              </button>
              <button
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors duration-200"
                onClick={handleAddFees}
              >
                Add Fees
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="font-semibold mb-4 text-center text-lg">
              Are you sure you want to submit new admission?
            </div>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={handleConfirmSubmit}
              >
                Yes
              </button>
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowConfirmModal(false)}
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

export default StudentOnboarding;
