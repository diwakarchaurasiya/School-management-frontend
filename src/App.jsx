import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard.jsx";
import StudentResults from "./pages/student/Results";
import StudentAdmitCard from "./pages/student/AdmitCard";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import PrincipalDashboard from "./pages/principal/Dashboard";
import Admissions from "./pages/principal/Admissions";
import UploadResults from "./pages/principal/UploadResults";
import Layout from "./components/Layout";
import TeacherOnboard from "./pages/principal/TeacherOnboard.jsx";
import StudentOnboardingForm from "./pages/principal/StudentOnboardingForm.jsx";
import ShowNotice from "./pages/student/ShowNotice.jsx";
import AddNotice from "./pages/principal/AddNotice.jsx";
import Teachers from "./pages/principal/ShowTeacher.jsx";
import TransferCertificate from "./pages/principal/transferCertificate.jsx";
import IDCard from "./pages/principal/IDcard.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdmitCard from "./pages/principal/AdmitCard";
import TeacherSalaryManagement from "./pages/principal/TeacherSalaryManagement.jsx";
import MyProfile from "./components/MyProfie.jsx";
import LandingPage from "./components/LandingPage.jsx";
import ProtectedRoute from "./Auth/ProtectedRoute.jsx";
import TeacherUploadResults from "./pages/teacher/resultupload.jsx";
import Attendance from "./pages/teacher/Attendance";
import Dashboard from "./pages/parents/Dashboard";
import Activities from "./pages/parents/Activities.jsx";
import ParentsAttendance from "./pages/parents/Attendance";
import Academic from "./pages/parents/AcademicReports.jsx";
import FeePayments from "./pages/parents/FeesPayments.jsx";
import TimeTable from "./pages/parents/TimeTable.jsx";
import Transport from "./pages/parents/TransportDetails.jsx";
import Promotion from "./pages/principal/promotion.jsx";
import NotificationListing from "./components/NotificationListing.jsx";
import TeachermarkAttendance from "./pages/teacher/teacherattendance.jsx";
import { Toaster } from "react-hot-toast";
import ResultPublish from "./pages/principal/resultPublish.jsx";
import TeacherIDCard from "./pages/principal/teacherIDcard.jsx";
import DropBox from "./pages/principal/dropbox.jsx";
import SchoolGallary from "./pages/principal/SchoolGallary.jsx";
import ForgotPassword from "./pages/teacher/ForgetPassword.jsx";
import ResetPassword from "./pages/teacher/ResetPassword.jsx";
import FeeManagementSystem from "./pages/principal/FeeManagementSystem.jsx";
import EnquiryManagement from "./pages/principal/EnquiryManagement.jsx";
import DailyAttendanceSummary from "./pages/principal/DailyAttendanceSummary.jsx";
import AdmissionPublic from "./components/AdmissionPublic.jsx";

function App() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : {});
  }, []);

  return (
    <>
      <ToastContainer />
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/public/register-student"
            element={<AdmissionPublic />}
          />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute userType="student">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="results" element={<StudentResults />} />
                    <Route path="admit-card" element={<StudentAdmitCard />} />
                    <Route path="notices" element={<ShowNotice />} />
                    <Route
                      path="myprofile"
                      element={<MyProfile profile={user} />}
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute userType="teacher">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="attendance" element={<TeacherAttendance />} />
                    <Route
                      path="Teacher-Attendance"
                      element={<TeachermarkAttendance />}
                    />
                    <Route path="notices" element={<ShowNotice />} />
                    <Route
                      path="upload-results"
                      element={<TeacherUploadResults />}
                    />
                    <Route
                      path="myprofile"
                      element={<MyProfile profile={user} />}
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Principal Routes */}
          <Route
            path="/principal/*"
            element={
              <ProtectedRoute userType="principal">
                <Layout>
                  <Routes>
                    <Route path="teachers" element={<Teachers />} />
                    <Route path="dashboard" element={<PrincipalDashboard />} />
                    <Route path="admissions" element={<Admissions />} />
                    <Route path="promote" element={<Promotion />} />
                    <Route
                      path="register-teacher"
                      element={<TeacherOnboard />}
                    />
                    <Route path="add-notice" element={<AddNotice />} />
                    <Route
                      path="register-student"
                      element={<StudentOnboardingForm />}
                    />
                    <Route path="upload-results" element={<UploadResults />} />
                    <Route path="attendance" element={<Attendance />} />
                    <Route path="result-publish" element={<ResultPublish />} />
                    <Route
                      path="transferCertificate"
                      element={<TransferCertificate />}
                    />
                    <Route path="StudentIdCard" element={<IDCard />} />
                    <Route path="Admit-card" element={<AdmitCard />} />
                    {/* <Route
                      path="fees-management"
                      element={<StudentFeesManagement />}
                    /> */}
                    <Route
                      path="salary-management"
                      element={<TeacherSalaryManagement />}
                    />
                    <Route
                      path="Attendance-Report"
                      element={<DailyAttendanceSummary />}
                    />
                    <Route
                      path="myprofile"
                      element={<MyProfile profile={user} />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationListing />}
                    />
                    <Route path="teacher-id-card" element={<TeacherIDCard />} />
                    <Route path="DropBox" element={<DropBox />} />
                    <Route path="SchoolGallary" element={<SchoolGallary />} />
                    <Route path="enquiries" element={<EnquiryManagement />} />
                    <Route
                      path="School-Fees-Management"
                      element={<FeeManagementSystem />}
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Parents Page */}

          <Route
            path="/parents/*"
            element={
              <ProtectedRoute userType="parents">
                <Layout>
                  <Routes>
                    <Route path="academic" element={<Academic />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="activities" element={<Activities />} />
                    <Route path="attendance" element={<ParentsAttendance />} />
                    <Route path="fees" element={<FeePayments />} />
                    <Route path="timetable" element={<TimeTable />} />
                    <Route path="transport" element={<Transport />} />
                    <Route
                      path="myprofile"
                      element={<MyProfile profile={user} />}
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
