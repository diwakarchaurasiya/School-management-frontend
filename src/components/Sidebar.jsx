import { Link, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom"; // Import for navigation

import {
  Home,
  Users,
  School,
  UserPlus,
  Bell,
  FileText,
  ClipboardList,
  GraduationCap,
  ChevronDown,
  Search,
  PackageSearch,
  LogOut,
  FileTextIcon,
  FileSignature,
  BadgeCheck,
  User,
  RecycleIcon,
  GalleryHorizontalEndIcon,
  NotebookIcon,
} from "lucide-react";
import { useState } from "react";
import { LuIdCard } from "react-icons/lu";
import { BiIdCard, BiMoney, BiMoneyWithdraw } from "react-icons/bi";
import { FiFileText } from "react-icons/fi";
import { GiRupee } from "react-icons/gi";
import { FaRupeeSign, FaUber } from "react-icons/fa";
import { path } from "framer-motion/client";


const Sidebar = ({ isExpanded, toggleSidebar, userType }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };
  const navigate = useNavigate();
  // Logout function
  const handleLogout = () => {
    localStorage.removeItem(`principal_token`); // Remove principal_token from storage
    localStorage.removeItem(`student_token`); // Remove student_token from storage
    localStorage.removeItem(`teacher_token`); // Remove teacher_token from storage
    localStorage.removeItem(`parents_token`); // Remove teacher_token from storage
    navigate("/login"); // Redirect to login page
  };

  const menuItems = () => {
    switch (userType) {
      case "principal":
        return [
          {
            name: "Dashboard",
            path: "/principal/dashboard",
            icon: <Home className="w-6 h-6" />,
          },
          {
            name: "promote",
            path: "/principal/promote",
            icon: <GiRupee className="w-6 h-6" />,
          },
          {
            name: "DropBox",
            path: "/principal/dropbox",
            icon: <RecycleIcon className="w-6 h-6" />,
          },
          {
            name: "Gallary",
            path: "/principal/SchoolGallary",
            icon: <GalleryHorizontalEndIcon className="w-6 h-6" />,
          },
          {
            name: "Teachers",
            icon: <Users className="w-6 h-6" />,
            subItems: [
              {
                name: "All Teachers",
                path: "/principal/teachers",
                icon: <Users className="w-4 h-4" />,
              },
              {
                name: "Register Teacher",
                path: "/principal/register-teacher",
                icon: <UserPlus className="w-4 h-4" />,
              },
              {
                name: "Teacher ID Card",
                path: "/principal/teacher-id-card",
                icon: <LuIdCard className="w-4 h-4" />, // IdCard is a direct match here
              },
            ],
          },
          {
            name: "Admissions",
            icon: <School className="w-6 h-6" />,
            subItems: [
              {
                name: "All Admissions",
                path: "/principal/admissions",
                icon: <Users className="w-4 h-4" />,
              },
              {
                name: "Register Student",
                path: "/principal/register-student",
                icon: <UserPlus className="w-4 h-4" />,
              },
            ],
          },
          {
            name: "Fees Management",
            path: "School-Fees-Management",
            icon: <BiMoney className="w-6 h-6" />,
          },
           {
            name: "Attendance",
            path: "Attendance-Report",
            icon: <NotebookIcon className="w-6 h-6" />,
          },
          {
            name: "Salary Management",
            path: "salary-management",
            icon: <FaRupeeSign className="w-6 h-6" />,
          },
          {
            name: "Enquiries",
            path: "enquiries",
            icon: <FaUber className="w-6 h-6" />,
          },
          {
            name: "Notice Board",
            path: "/principal/add-notice",
            icon: <Bell className="w-6 h-6" />,
          },
          {
            name: "Certificates",
            icon: <FileTextIcon className="w-6 h-6" />,
            subItems: [
              {
                name: "Results Upload",
                path: "/principal/upload-results",
                icon: <FiFileText className="w-4 h-4" />, // Document-related icon is good for results
              },
              {
                name: "result-publish",
                path: "/principal/result-publish",
                icon: <FiFileText className="w-4 h-4" />, // Document-related icon is good for results
              },
              // {
              //   name: "Admit card",
              //   path: "Admit-card",
              //   icon: <BadgeCheck className="w-4 h-4" />, // BadgeCheck fits for admit cards/pass
              // },
              {
                name: "Transfer Certificate",
                path: "transferCertificate",
                icon: <FileSignature className="w-4 h-4" />, // Signature icon fits certificate/official docs
              },
              {
                name: "Generate Id Card",
                path: "StudentIdCard",
                icon: <BiIdCard className="w-4 h-4" />, // IdCard is a direct match here
              },
            ],
          },
          // {
          //   name: "Results",
          //   path: "/principal/upload-results",
          //   icon: <FileText className="w-6 h-6" />,
          // },
          // {
          //   name: "Admit card",
          //   path: "Admit-card",
          //   icon: <FileText className="w-6 h-6" />,
          // },
          // {
          //   name: "Transfer Certificate",
          //   path: "transferCertificate",
          //   icon: <FileTextIcon className="w-6 h-6" />,
          // },
          // {
          //   name: "Generate Id Card",
          //   path: "StudentIdCard",
          //   icon: <LuIdCard className="w-6 h-6" />,
          // },
        ];
      case "teacher":
        return [
          {
            name: "Dashboard",
            path: "/teacher/dashboard",
            icon: <Home className="w-6 h-6" />,
          },
          {
            name: "Attendance",
            path: "/teacher/attendance",
            icon: <ClipboardList className="w-6 h-6" />,
          },
          {
            name: "Teacher-Attendance",
            path: "/teacher/Teacher-Attendance",
            icon: <User className="w-6 h-6" />,
          },
          {
            name: "Notices",
            path: "/teacher/notices",
            icon: <Bell className="w-6 h-6" />,
          },
          {
            name: "Upload Results",
            path: "/teacher/upload-results",
            icon: <FileText className="w-6 h-6" />,
          },
        ];
      case "student":
        return [
          {
            name: "Dashboard",
            path: "/student/dashboard",
            icon: <Home className="w-6 h-6" />,
          },
          {
            name: "Notices",
            path: "/student/notices",
            icon: <Bell className="w-6 h-6" />,
          },
          {
            name: "Results",
            path: "/student/results",
            icon: <FileText className="w-6 h-6" />,
          },
          // {
          //   name: "Admit Card",
          //   path: "/student/admit-card",
          //   icon: <GraduationCap className="w-6 h-6" />,
          // },
        ];

      case "parents":
        return [
          {
            name: "Dashboard",
            path: "/parents/dashboard",
            icon: <Home className="w-6 h-6" />,
          },
          {
            name: "Academic",
            path: "/parents/academic",
            icon: <Bell className="w-6 h-6" />,
          },
          {
            name: "Activities",
            path: "/parents/activities",
            icon: <FileText className="w-6 h-6" />,
          },
          {
            name: "Attendance",
            path: "/parents/attendance",
            icon: <GraduationCap className="w-6 h-6" />,
          },
          {
            name: "FeesPayments",
            path: "/parents/fees",
            icon: <GraduationCap className="w-6 h-6" />,
          },
          {
            name: "TimeTable",
            path: "/parents/timetable",
            icon: <GraduationCap className="w-6 h-6" />,
          },
          {
            name: "TransportDetails",
            path: "/parents/transport",
            icon: <GraduationCap className="w-6 h-6" />,
          },
        ];
      default:
        return [];
    }
  };

  const items = menuItems();

  return (
    <div
      className={`bg-white text-black h-screen fixed left-0 top-0 p-4 transition-all duration-300 ease-in-out z-50 overflow-auto hide-scrollbar ${
        isExpanded ? "w-64" : "w-24"
      }`}
    >
      {/* Logo */}
      <Link
        to={items[0]?.path}
        className="flex items-center justify-center mb-4"
        title="Home"
      >
        <PackageSearch className="inline-block" />
        {isExpanded && (
          <h1 className="text-2xl font-bold inline-block ml-2">School Panel</h1>
        )}
      </Link>

      {/* Search bar */}
      {isExpanded && (
        <div className="relative mb-4 border border-[#d2d2d2] rounded-md">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-md text-primary outline-none"
          />
          <Search className="absolute right-3 top-2 w-5 h-5 text-[#4e4e4e]" />
        </div>
      )}

      {/* Menu Items */}
      <nav>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.name} className="relative group">
              {item.subItems ? (
                <>
                  {/* Parent Item */}
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center font-semibold ${
                      isExpanded ? "justify-between" : "justify-center"
                    } w-full p-2 rounded-md bg-[#F1F2F5] hover:bg-[#E5E5E5] transition-all`}
                    title={item.name}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {isExpanded && <span className="ml-2">{item.name}</span>}
                    </div>
                    {isExpanded && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openDropdown === item.name ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>

                  {/* Dropdown */}
                  {openDropdown === item.name && (
                    <ul className="ml-4 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.name} className="my-2">
                          <NavLink
                            to={subItem.path}
                            className={({ isActive }) =>
                              `flex items-center w-full p-2 rounded-md transition-all  
                              ${
                                isActive
                                  ? "bg-black text-white"
                                  : "bg-[#F1F2F5] hover:hover:bg-[#E5E5E5]"
                              } ${
                                isExpanded ? "justify-start" : "justify-center"
                              }`
                            }
                            title={subItem.name}
                          >
                            {subItem.icon}
                            {isExpanded && (
                              <span className="ml-2">{subItem.name}</span>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center ${
                      isExpanded ? "justify-start" : "justify-center"
                    } p-2 rounded-md transition-all ${
                      isActive ? "bg-[#000] text-white" : "hover:bg-[#F1F2F5]"
                    }`
                  }
                  title={item.name}
                >
                  {item.icon}
                  {isExpanded && <span className="ml-2">{item.name}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mt-8">
        <button
          onClick={handleLogout}
          className={`flex items-center p-2 rounded-lg hover:bg-[#F1F2F5] w-full transition-all ${
            isExpanded ? "justify-start" : "justify-center"
          }`}
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
          {isExpanded && <span className="ml-2">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
