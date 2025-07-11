import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, userType }) => {
  const token = localStorage.getItem(`${userType}_token`);

  if (!token) {
    // Redirect to login if no token is found
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
