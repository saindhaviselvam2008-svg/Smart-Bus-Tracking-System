import { useState } from "react";
import { auth } from "../firebase"; // Ensure this path is correct
import { reload, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const StudentVerify = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if student clicked the link in their email
  // ... inside handleCheckStatus ...
  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          alert("Email Verified! You can now access your dashboard.");
          navigate("/student-login");
        } else {
          alert("Verification pending. Please check your student email inbox.");
        }
      } else {
        // Handle logic for Forgot Password flow where currentUser might be null
        alert("Please ensure you've followed the link in your email, then login with your credentials.");
        navigate("/student-login");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend link if they didn't get it
  const handleResendLink = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        alert("A new verification link has been sent to your student email.");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Student Verification</h2>
        <div style={styles.icon}>📩</div>
        <p style={styles.text}>
          We've sent a verification link to:<br />
          <strong>{auth.currentUser?.email || "your registered email"}</strong>
        </p>
        
        <p style={styles.subText}>
          Please verify your email to complete your registration and track your bus.
        </p>

        <button 
          onClick={handleCheckStatus} 
          disabled={loading} 
          style={styles.primaryBtn}
        >
          {loading ? "Checking..." : "I've Verified My Email"}
        </button>

        <button onClick={handleResendLink} style={styles.secondaryBtn}>
          Resend Email
        </button>

        <div style={styles.footer}>
          <button 
            onClick={() => navigate("/student-login")} 
            style={styles.backBtn}
          >
            ← Back to Student Login
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    // Matches your Student/Admin login gradient background
    background: " #0f0621",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "90%",
    maxWidth: "400px",
    background: "white",
    padding: "40px 30px",
    // 30px radius matches your existing UI
    borderRadius: "30px", 
    textAlign: "center",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  },
  icon: {
    fontSize: "80px",
    marginBottom: "20px",
    display: "block"
  },
  heading: {
    fontSize: "24px",
    color: "#4d1892", // Your theme's primary dark blue
    fontWeight: "bold",
    marginBottom: "15px",
  },
  text: {
    fontSize: "15px",
    
    lineHeight: "1.6",
    marginBottom: "20px",
  },
  subText: {
    background: "#825cb5",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "13px",
    color: "#ffffff",
    marginBottom: "25px",
  },
  primaryBtn: {
    width: "100%",
    padding: "16px",
    background: "#4d1892",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "15px",
    transition: "0.3s",
  },
  secondaryBtn: {
    background: "none",
    border: "none",
    color: "#1E88E5",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  footer: {
    marginTop: "25px",
    borderTop: "1px solid #ECEFF1",
    paddingTop: "20px",
  },
  backBtn: {
    background: "none",
    border: "none",
    
    cursor: "pointer",
    fontSize: "14px",
  }
};
export default StudentVerify;