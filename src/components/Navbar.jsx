import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Globe,
  Expand,
  Menu,
  PackageSearch,
  MoonIcon,
  Search,
} from "lucide-react";
import { getImageUrl } from "../utils/getImageUrl";

const Navbar = ({ toggleSidebar }) => {
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [schoolName, setSchoolName] = useState("");

  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // Extract schoolIds and schoolName from user.schools
  const schools = user?.user?.schools || user?.schools || [];
  const schoolId = schools[0]?.id || null;
  const schoolNameFromUser =
    schools[0]?.Schoolname || schools[0]?.schoolName || "";

  useEffect(() => {
    if (!schoolId) return;
    const fetchLogo = async () => {
      try {
        const res = await fetch(
          `http://localhost:5002/api/newSchool/school-assets/by-school/${schoolId}`
        );
        const data = await res.json();
        setSchoolLogo(data.schoolLogo || null);
      } catch (err) {
        setSchoolLogo(null);
      }
    };
    fetchLogo();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    const fetchSchoolName = async () => {
      try {
        const res = await fetch(
          `http://localhost:5002/api/newSchool/schools/${schoolId}`
        );
        const data = await res.json();
        setSchoolName(data.name || "");
      } catch {
        setSchoolName("");
      }
    };
    fetchSchoolName();
  }, [schoolId]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-black shadow-md px-6 py-4 flex justify-between items-center">
      {/* Left Side - Logo & Menu */}
      <div className="flex items-center space-x-4">
        <Menu
          className="text-white w-6 h-6 cursor-pointer"
          onClick={toggleSidebar}
        />
        {schoolLogo && (
          <img
            src={getImageUrl(schoolLogo)}
            alt="School Logo"
            className="h-10 w-10 object-contain bg-white rounded mr-2"
            style={{ maxWidth: 40, maxHeight: 40 }}
          />
        )}
        <h1 className="text-white">
          Welcome {schoolNameFromUser ? schoolNameFromUser : "to EduManage"}
        </h1>
      </div>

      {/* Right Side - Navigation & Icons */}
      <div className="flex items-center space-x-6">
        <Expand
          onClick={toggleFullScreen}
          className="text-white w-6 h-6 cursor-pointer rounded"
        />
        <Link to="/principal/notifications">
          <div className="relative">
            <Bell className="text-white w-6 h-6 cursor-pointer" />
            <span className="absolute -top-1 -right-2 bg-white text-primary text-xs rounded-full px-1">
              99+
            </span>
          </div>
        </Link>
        <Link to="myprofile">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="MerchantMind"
            className="h-8"
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
