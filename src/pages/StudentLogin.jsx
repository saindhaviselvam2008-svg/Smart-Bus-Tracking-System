import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import studentImg from "../assets/student-avatar.jpeg"; 

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === "manaswinig.aids2025@citchennai.net") {
      alert("Access Denied: This administrative account cannot be used for Student Login.");
      return;
    }
    // ... inside handleLogin ...
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user.emailVerified) {
        // Inside your Login screen code, when login succeeds:
localStorage.setItem("userEmail", email); 
        
        navigate("/dashboard");
      } else {
        alert("Please verify your email first.");
        navigate("/verify-email");
      }
    }catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.header}>Student Login</h2>

        {/* IMAGE AT TOP - HALF SIZE */}
        <div style={styles.imageWrapper}>
          <img src={studentImg} alt="Student" style={styles.img} />
        </div>

        <div style={styles.form}>
          <input 
            style={styles.input} 
            placeholder="Email Address" 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            style={styles.input} 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
          />

          <div style={styles.forgotRow}>
            <span 
              onClick={() => navigate("/forgot-password")} 
              style={styles.forgotLink}
            >
              Forgot Password?
            </span>
          </div>

          <button style={styles.loginBtn} onClick={handleLogin}>Login</button>

          <p style={styles.footerText}>
            New user? <span onClick={() => navigate("/register1")} style={styles.linkBold}>Register Now</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { height: "100vh", background: "#0f0621", display: "flex", justifyContent: "center", alignItems: "center" },
  container: { width: "100%", maxWidth: "400px", textAlign: "center", padding: "20px" },
  header: { fontSize: "32px", color: "#4d1892", fontWeight: "bold", marginBottom: "20px" },
  imageWrapper: { width: "350px", height: "300px", borderRadius: "25px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", margin: "0 auto 25px auto", backgroundColor: "white" },
  img: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" },
  form: { display: "flex", flexDirection: "column", gap: "18px", width: "100%" },
  input: { padding: "18px", borderRadius: "15px", border: "1px solid #D1E3F8", backgroundColor: "#F0F7FF", fontSize: "16px", outline: "none" },
  forgotRow: { textAlign: "right", marginTop: "-10px" },
  forgotLink: { fontSize: "14px", color: "#1E88E5", cursor: "pointer", fontWeight: "600" },
  loginBtn: { padding: "18px", background: "#4d1892", color: "white", border: "none", borderRadius: "15px", fontSize: "20px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 8px 15px rgba(33, 150, 243, 0.3)" },
  footerText: { marginTop: "20px", color: "#546E7A", fontSize: "15px" },
  linkBold: { color: "#1E88E5", fontWeight: "bold", cursor: "pointer" }
};