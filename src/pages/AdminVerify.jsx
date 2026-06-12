import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { sendEmailVerification, reload } from "firebase/auth";

export default function AdminVerify() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          alert("Verification successful! Welcome, Admin.");
          navigate("/admin-dashboard");
        } else {
          alert("We haven't detected the verification yet. Please click the link in your email.");
        }
      }
    } catch (error) {
      alert("Error checking status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      alert("A new verification link has been sent to your email.");
    } catch (error) {
      alert("Error sending email: " + error.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={{ fontSize: "50px" }}>📧</span>
        </div>
        
        <h2 style={styles.header}>Verify Your Email</h2>
        <p style={styles.subText}>
          A verification link has been sent to:<br />
          <strong style={{ color: "#0D47A1" }}>{auth.currentUser?.email}</strong>
        </p>

        <div style={styles.infoBox}>
          Check your <strong>Spam</strong> folder if you don't see it in your inbox.
        </div>

        <button 
          style={styles.verifyBtn} 
          onClick={handleCheckVerification}
          disabled={loading}
        >
          {loading ? "Checking..." : "I have clicked the link"}
        </button>

        <button 
          style={styles.resendBtn} 
          onClick={handleResendEmail}
          disabled={resending}
        >
          {resending ? "Sending..." : "Resend verification email"}
        </button>

        <p 
          style={styles.backLink} 
          onClick={() => navigate("/admin-login")}
        >
          ← Back to Admin Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { height: "100vh", background: "#0f0621", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  card: { width: "90%", maxWidth: "400px", background: "white", padding: "40px 30px", borderRadius: "30px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" },
  iconContainer: { marginBottom: "20px" },
  header: { fontSize: "24px", color: "#4d1892", fontWeight: "bold", marginBottom: "10px" },
  subText: { fontSize: "15px", color: "#546E7A", lineHeight: "1.5", marginBottom: "20px" },
  infoBox: { background: "#FFF9C4", padding: "12px", borderRadius: "10px", fontSize: "13px", color: "#827717", marginBottom: "25px" },
  verifyBtn: { width: "100%", padding: "16px", background: "#4d1892", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginBottom: "15px" },
  resendBtn: { background: "none", border: "none", color: "#4d1892", fontSize: "14px", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
  backLink: { marginTop: "25px", fontSize: "14px", color: "#90A4AE", cursor: "pointer" }
};