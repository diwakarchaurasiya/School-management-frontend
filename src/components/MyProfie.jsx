import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { getImageUrl } from "../utils/getImageUrl";

const MyProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  // Get user from localStorage when component mounts
  useEffect(() => {
    const userDataRaw = localStorage.getItem("user");
    if (userDataRaw) {
      const parsedData = JSON.parse(userDataRaw);
      let actualUserData =
        parsedData.user ||
        parsedData.principal ||
        parsedData.student ||
        parsedData.parents ||
        {};

      // Fallback photo
      if (!actualUserData.photo && parsedData.photo) {
        actualUserData.photo = parsedData.photo;
      }

      setUserData({
        ...actualUserData,
        userType: parsedData.userType,
      });
    }
  }, []);

  const profileImage = userData?.photo
    ? getImageUrl(userData.photo)
    : "https://cdn-icons-png.flaticon.com/512/7162/7162728.png";

  const handleLogout = () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const type = storedUser.userType;

    switch (type) {
      case "principal":
        localStorage.removeItem("principal_token");
        break;
      case "teacher":
        localStorage.removeItem("teacher_token");
        break;
      case "student":
        localStorage.removeItem("student_token");
        break;
      case "parents":
        localStorage.removeItem("parents_token");
        break;
      default:
        break;
    }

    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  const renderFields = () => {
    switch (userData.userType) {
      case "teacher":
        return (
          <>
            <ProfileField label="Teacher ID" value={userData.teacherId} />
            <ProfileField
              label="Assigned Class"
              value={`${userData.assignedClass} - ${userData.assignedSection}`}
            />
            <ProfileField
              label="Specialization"
              value={userData.specialization}
            />
            <ProfileField label="Subjects" value={userData.subjects} />
            <ProfileField
              label="Qualification"
              value={userData.qualification}
            />
            <ProfileField
              label="Experience"
              value={`${userData.experience} years`}
            />
          </>
        );
      case "principal":
        return (
          <>
            <ProfileField label="Principal ID" value={userData.LoguserID} />
            <ProfileField label="Full Name" value={userData.fullName} />
            <ProfileField label="Email" value={userData.email} />
          </>
        );
      case "student":
        return (
          <>
            <ProfileField label="Student Name" value={userData.studentName} />
            <ProfileField label="Class" value={userData.class} />
            <ProfileField label="Section" value={userData.section} />
            <ProfileField label="Roll No" value={userData.rollNumber} />
          </>
        );
      case "parents":
        return (
          <>
            <ProfileField label="Parent Name" value={userData.fullName} />
            <ProfileField label="Email" value={userData.email} />
            <ProfileField label="Phone" value={userData.phone} />
          </>
        );
      default:
        return null;
    }
  };

  const renderCommonFields = () => (
    <>
      {userData.address && (
        <ProfileField label="Address" value={userData.address} />
      )}
      {userData.joiningDate && (
        <ProfileField
          label="Joining Date"
          value={new Date(userData.joiningDate).toLocaleDateString()}
        />
      )}
      {userData.dateOfBirth && (
        <ProfileField
          label="Date of Birth"
          value={new Date(userData.dateOfBirth).toLocaleDateString()}
        />
      )}
      {userData.createdAt && (
        <ProfileField
          label="Account Created"
          value={new Date(userData.createdAt).toLocaleDateString()}
        />
      )}
    </>
  );

  return (
    <div className="min-h-screen text-black">
      <div className="max-w-screen-md mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
          <img
            src={profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full border object-cover"
          />
          <div className="ml-6">
            <h2 className="text-xl font-bold">{userData.fullName}</h2>
            <p className="text-gray-600 capitalize">{userData.userType}</p>
            {userData.phone && (
              <p className="text-gray-600">Phone: {userData.phone}</p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white shadow-md rounded-lg p-6 mt-4 space-y-2">
          {renderFields()}
          {renderCommonFields()}
        </div>

        {/* Logout */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center p-2 rounded-lg hover:bg-[#F1F2F5] w-full transition-all"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
            <span className="ml-2">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value }) => (
  <p className="text-gray-600">
    <span className="font-semibold">{label}:</span> {value}
  </p>
);

export default MyProfile;
