import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };
  const userType = location.pathname.split("/")[1];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <Sidebar
        isExpanded={isExpanded}
        toggleSidebar={toggleSidebar}
        userType={userType}
      />
      <div
        className={`md:flex-1 flex-none ${
          isExpanded ? "ml-64" : "ml-24"
        } transition-all duration-300 bg-[#f9f8f8]`}
      >
        <Navbar toggleSidebar={toggleSidebar} />

        <div className="p-10">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
