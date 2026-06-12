import { useState } from "react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // Toggle to help routing
  const navigate = useNavigate();

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Reset link sent! Please check your inbox (and spam folder).");
      
      // If Admin, go back to Admin Login. If Student, go to Verification page.
      if (isAdmin) {
        navigate("/admin-login");
      } else {
        navigate("/verify-email");
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={{ fontSize: "50px" }}>🔑</span>
        </div>

        <h2 style={styles.heading}>Reset Password</h2>
        <p style={styles.text}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleResetRequest}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <div style={styles.toggleContainer}>
            <label style={styles.label}>
              <input 
                type="checkbox" 
                checked={isAdmin} 
                onChange={() => setIsAdmin(!isAdmin)} 
              />
              <span style={{ marginLeft: "8px" }}>I am an Admin</span>
            </label>
          </div>

          <button 
            type="submit" 
            style={styles.primaryBtn} 
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p 
          style={styles.backLink} 
          onClick={() => navigate(-1)}
        >
          ← Go Back
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    background: "#19112c",
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
    borderRadius: "30px",
    textAlign: "center",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
  },
  iconContainer: {
    marginBottom: "20px",
  },
  heading: {
    fontSize: "24px",
    color: "#6c1fab",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  text: {
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "25px",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "12px",
    border: "1px solid #CFD8DC",
    fontSize: "16px",
    boxSizing: "border-box",
    outlineColor: "#1E88E5",
  },
  toggleContainer: {
    textAlign: "left",
    marginBottom: "20px",
    paddingLeft: "5px",
  },
  label: {
    fontSize: "14px",
  
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  primaryBtn: {
    width: "100%",
    padding: "16px",
    background: "#3d357d",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },
  backLink: {
    marginTop: "25px",
    fontSize: "14px",
   
    cursor: "pointer",
    fontWeight: "500",
  },
};