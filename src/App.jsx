import { Routes, Route } from "react-router-dom";

// EXISTING IMPORTS
import Welcome from "./pages/Welcome.jsx";
import StudentLogin from "./pages/StudentLogin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";

import StudentRegisterStep1 from "./pages/StudentRegisterStep1.jsx";
import StudentRegisterStep2 from "./pages/StudentRegisterStep2.jsx";

import Dashboard from "./pages/StudentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

import Tracking from "./pages/AdminTracking.jsx";
import StudentTracking from "./pages/StudentTracking.jsx";

import Driver from "./pages/Driver";

import AttendancePage from "./pages/AttendancePages.jsx";

// VERIFICATION + PASSWORD
import EmailVerification from "./pages/EmailVerification.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import AdminVerify from "./pages/AdminVerify.jsx";
import OtpVerification from "./components/OtpVerification.jsx"
function App() {

  return (

    <Routes>

      {/* LANDING PAGE */}
      <Route
        path="/"
        element={<Welcome />}
      />

      {/* STUDENT AUTH */}
      <Route
        path="/student-login"
        element={<StudentLogin />}
      />

      <Route
        path="/register1"
        element={<StudentRegisterStep1 />}
      />

      <Route
        path="/register2"
        element={<StudentRegisterStep2 />}
      />

      <Route
        path="/verify-email"
        element={<EmailVerification />}
      />
      <Route
        path="/verify-otp"
        element={<OtpVerification />}
      />

      {/* ADMIN AUTH */}
      <Route
        path="/admin-login"
        element={<AdminLogin />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/admin-verify"
        element={<AdminVerify />}
      />

      {/* DASHBOARDS */}
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/student-dashboard"
        element={<Dashboard />}
      />

      <Route
        path="/admin-dashboard"
        element={<AdminDashboard />}
      />

      {/* TRACKING */}
      <Route
        path="/tracking"
        element={<Tracking />}
      />

      <Route
        path="/student-tracking"
        element={<StudentTracking />}
      />
      <Route path="/attendance" element={<AttendancePage />} />

      {/* DRIVER */}
      <Route
        path="/driver"
        element={<Driver />}
      />

    </Routes>

  );
}

export default App;