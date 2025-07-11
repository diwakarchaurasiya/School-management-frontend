import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, School } from "lucide-react";

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    LoguserID: "",
    password: "",
    date_of_birth: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true when submission starts

    const requestBody = {
      LoguserID: formData.LoguserID,
      password:
        userType === "student" ? formData.date_of_birth : formData.password,
    };

    const apiEndpoints = {
      student: "https://api.jsic.in/api/auth/student/login",
      teacher: "https://api.jsic.in/api/auth/teacher/login",
      principal: "https://api.jsic.in/api/auth/principal/login",
      parents: "https://api.jsic.in/api/auth/parents/login", // Updated to match backend
    };

    try {
      const response = await fetch(apiEndpoints[userType], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        if (userType === "parents") {
          // Handle parent-specific response structure
          localStorage.setItem("parents_token", data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              token: data.token,
              user: {
                ...data.user,
                students: data.user.students || [], // Include students data
              },
              userType,
            })
          );
          setUser(data.user);
        } else if (userType === "principal") {
          // Handle principal-specific response structure
          localStorage.setItem("principal_token", data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              token: data.token,
              user: {
                ...data.user,
                schools: data.user.schools || [], // Schools data already included in user
              },
              schoolIds: data.schoolIds,
              userType,
            })
          );
          setUser(data.user);
        } else {
          // Handle other user types (existing code)
          localStorage.setItem(`${userType}_token`, data.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              token: data.token,
              user: {
                ...data.user,
                schools: [
                  {
                    id: data.school.id,
                    Schoolname: data.school.Schoolname,
                    subjects: data.school.subjects,
                  },
                ],
              },
              school: data.school,
              userType,
            })
          );
          setUser(data.user);
        }

        navigate(`/${userType}/dashboard`);
      } else {
        setError(data.error || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const groupClass = "mb-4";
  const errorMessageClass = "text-red-500 text-sm mt-2";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {/* Heading */}
        <h2 className="text-2xl text-center font-bold text-black mb-6 flex items-center justify-center gap-2">
          <School /> EduManage Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Type */}
          <div className={groupClass}>
            <label className={labelClass}>Login As</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className={inputClass}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="principal">Principal</option>
              <option value="parents">Parents</option>
            </select>
          </div>

          {/* LoguserID */}
          <div className={groupClass}>
            <label className={labelClass}>LoguserID</label>
            <input
              type="text"
              value={formData.LoguserID}
              onChange={(e) =>
                setFormData({ ...formData, LoguserID: e.target.value })
              }
              placeholder="Enter your LoguserID"
              className={inputClass}
              required
            />
          </div>

          {/* Password - Only for teachers and principals */}
          {userType !== "student" && (
            <div className={groupClass}>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                className={inputClass}
                required
              />
            </div>
          )}

          {/* Date of Birth - Only for students */}
          {userType === "student" && (
            <div className={groupClass}>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          )}

          {error && <div className={errorMessageClass}>{error}</div>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-900 transition-colors"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" /> Sign In
              </>
            )}
          </button>
        </form>
        {userType === "teacher" && (
          <div className="my-4">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
