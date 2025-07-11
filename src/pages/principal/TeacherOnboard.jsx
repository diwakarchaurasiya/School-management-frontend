import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  UserPlus,
  Calendar,
  Mail,
  Lock,
  Phone,
  BookOpen,
  Briefcase,
  MapPin,
  CalendarClock,
  GraduationCap,
} from "lucide-react";

const TeacherOnboardingForm = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const [classSectionData, setClassSectionData] = useState([]);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(-1);
  const [selectedClass, setSelectedClass] = useState("");
  const [schoolId, setSchoolId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
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

  // Fetch classes and sections dynamically
  useEffect(() => {
    if (!schoolId) return;
    const fetchClasses = async () => {
      try {
        const principal_token = localStorage.getItem("principal_token");
        const res = await axios.get(
          `https://api.jsic.in/api/classes/${schoolId}`, // Updated URL
          {
            headers: {
              Authorization: `Bearer ${principal_token}`,
            },
          }
        );
        // Transform to [{ class: "I", sections: ["A", "B"] }, ...]
        const data = (res.data.classes || []).map((cls) => ({
          class: cls.name,
          sections: Array.isArray(cls.sections)
            ? cls.sections.map((sec) => sec.sectionName)
            : [],
        }));
        setClassSectionData(data);
      } catch (error) {
        setClassSectionData([]);
        toast.error("❌ Failed to load classes");
      }
    };
    fetchClasses();
  }, [schoolId]);

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
    if (!schoolId) {
      toast.error("School ID not found. Please login again.");
      return;
    }

    // Transform all string fields to uppercase except email (which is lowercase)
    const transformToUpper = (obj) => {
      if (typeof obj === "string") return obj.toUpperCase();
      if (Array.isArray(obj)) return obj.map(transformToUpper);
      if (typeof obj === "object" && obj !== null) {
        const newObj = {};
        for (const key in obj) {
          if (key === "email") {
            newObj[key] = obj[key]?.toLowerCase?.() || obj[key];
          } else {
            newObj[key] = transformToUpper(obj[key]);
          }
        }
        return newObj;
      }
      return obj;
    };

    // Prepare payload: email always lowercase, gender as selected, rest uppercase
    const payload = {
      ...transformToUpper({ ...data, email: undefined, gender: undefined }),
      email: data.email?.toLowerCase?.() || data.email,
      gender: data.gender, // Send as selected by user (no uppercasing)
      schoolId,
      assignedClass: {
        className: data.assignedClass?.toUpperCase?.() || data.assignedClass,
        schoolId: schoolId,
      },
      assignedSection: {
        sectionName: data.assignedSection?.toUpperCase?.() || data.assignedSection,
        schoolId: schoolId,
      },
    };

    const url = "https://api.jsic.in/api/teacher/register"; // Updated URL
    try {
      const principal_token = localStorage.getItem("principal_token");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${principal_token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || "Failed to register");
      }

      toast.success("Teacher registered successfully!");
      navigate("/principal/dashboard");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
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

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const errorClass = "text-sm text-[red] mt-1";
  const groupClass = "mb-4";

  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl text-center font-bold text-black mb-6 flex items-center justify-center gap-2">
        <UserPlus /> Teacher Onboarding
      </h2>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-6"
        encType="multipart/form-data"
      >
        {/* Full Name */}
        <div className={groupClass}>
          <label htmlFor="fullName" className={labelClass}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            {...register("fullName", { required: "Full Name is required" })}
            className={inputClass}
          />
          {errors.fullName && (
            <p className={errorClass}>{errors.fullName.message}</p>
          )}
        </div>

        {/* Email and Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={groupClass}>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email", { required: "Email is required" })}
              className={inputClass}
            />
            {errors.email && (
              <p className={errorClass}>{errors.email.message}</p>
            )}
          </div>

          <div className={groupClass}>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="********"
              {...register("password", { required: "Password is required" })}
              className={inputClass}
            />
            {errors.password && (
              <p className={errorClass}>{errors.password.message}</p>
            )}
          </div>
        </div>

        {/* Phone and DOB */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={groupClass}>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              type="text"
              placeholder="9876543210"
              {...register("phone", { required: "Phone is required" })}
              className={inputClass}
            />
            {errors.phone && (
              <p className={errorClass}>{errors.phone.message}</p>
            )}
          </div>
          <div className={groupClass}>
            <label htmlFor="dateOfBirth" className={labelClass}>
              Date of Birth
            </label>
            <input
              id="dateOfBirth"
              type="date"
              {...register("dateOfBirth", {
                required: "Date of Birth is required",
              })}
              className={inputClass}
            />
            {errors.dateOfBirth && (
              <p className={errorClass}>{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        {/* Gender */}
        <div className={groupClass}>
          <label htmlFor="gender" className={labelClass}>
            Gender
          </label>
          <select
            {...register("gender", { required: "Gender is required" })}
            className={inputClass}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className={errorClass}>{errors.gender.message}</p>
          )}
        </div>

        {/* Qualification and Specialization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={groupClass}>
            <label htmlFor="qualification" className={labelClass}>
              Qualification
            </label>
            <input
              id="qualification"
              type="text"
              placeholder="M.Ed / B.Ed"
              {...register("qualification", {
                required: "Qualification is required",
              })}
              className={inputClass}
            />
            {errors.qualification && (
              <p className={errorClass}>{errors.qualification.message}</p>
            )}
          </div>
          <div className={groupClass}>
            <label htmlFor="specialization" className={labelClass}>
              Specialization
            </label>
            <input
              id="specialization"
              type="text"
              placeholder="Mathematics / Science"
              {...register("specialization", {
                required: "Specialization is required",
              })}
              className={inputClass}
            />
            {errors.specialization && (
              <p className={errorClass}>{errors.specialization.message}</p>
            )}
          </div>
        </div>

        {/* Experience and Joining Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={groupClass}>
            <label htmlFor="experience" className={labelClass}>
              Experience (Years)
            </label>
            <input
              id="experience"
              type="number"
              placeholder="e.g., 5"
              {...register("experience", {
                required: "Experience is required",
              })}
              className={inputClass}
            />
            {errors.experience && (
              <p className={errorClass}>{errors.experience.message}</p>
            )}
          </div>
          <div className={groupClass}>
            <label htmlFor="joiningDate" className={labelClass}>
              Joining Date
            </label>
            <input
              id="joiningDate"
              type="date"
              {...register("joiningDate", {
                required: "Joining Date is required",
              })}
              className={inputClass}
            />
            {errors.joiningDate && (
              <p className={errorClass}>{errors.joiningDate.message}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className={groupClass}>
          <label htmlFor="address" className={labelClass}>
            Address
          </label>
          <textarea
            id="address"
            placeholder="Enter address"
            {...register("address", { required: "Address is required" })}
            className={inputClass}
          ></textarea>
          {errors.address && (
            <p className={errorClass}>{errors.address.message}</p>
          )}
        </div>

        {/* Class and Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={groupClass}>
            <label className={labelClass}>Assigned Class</label>
            <select
              {...register("assignedClass", { required: "Class is required" })}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={inputClass}
            >
              <option value="">Select Class</option>
              {classSectionData.map((cls) => (
                <option key={cls.class} value={cls.class}>
                  {cls.class}
                </option>
              ))}
            </select>
            {errors.assignedClass && (
              <p className={errorClass}>{errors.assignedClass.message}</p>
            )}
          </div>

          <div className={groupClass}>
            <label className={labelClass}>Assigned Section</label>
            <select
              {...register("assignedSection", {
                required: "Section is required",
              })}
              className={inputClass}
            >
              <option value="">Select Section</option>
              {classSectionData
                .find((cls) => cls.class === selectedClass)
                ?.sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
            </select>
            {errors.assignedSection && (
              <p className={errorClass}>{errors.assignedSection.message}</p>
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className={groupClass}>
          <label htmlFor="subjects" className={labelClass}>
            Subjects
          </label>
          <input
            id="subjects"
            type="text"
            placeholder="e.g., Math, Physics"
            {...register("subjects", { required: "Subjects are required" })}
            className={inputClass}
          />
          {errors.subjects && (
            <p className={errorClass}>{errors.subjects.message}</p>
          )}
        </div>
        <label className={labelClass}>Salary Paid (Select Month)</label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedMonthIndex(-1);
              setValue("salaryPaid", []); // Clear fees paid when None is selected
            }}
            className={`text-sm px-3 py-2 font-bold rounded-md border ${
              selectedMonthIndex === -1
                ? "bg-[black] text-white border-[black]"
                : "bg-white text-gray-700 border-gray-300"
            }`}
          >
            None
          </button>
          {months.map((month, index) => (
            <button
              type="button"
              key={month}
              onClick={() => {
                setSelectedMonthIndex(index);
                // Update SalaryPaid array with all months up to selected index
                const paidMonths = months.slice(0, index + 1);
                setValue("salaryPaid", paidMonths);
              }}
              className={`text-sm px-3 py-2 rounded-md border ${
                selectedMonthIndex >= 0 && index <= selectedMonthIndex
                  ? "bg-[black] text-white border-[black]"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {month}
            </button>
          ))}
          <input type="hidden" {...register("salaryPaid")} />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-black transition-colors"
        >
          Register Teacher
        </button>
      </form>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="font-semibold mb-4 text-center text-lg">
              Are you sure you want to submit new Teacher?
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

export default TeacherOnboardingForm;
