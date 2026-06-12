import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import adminImg from "../assets/admin-avatar.jpeg"; 

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STRICT RULE: Only this specific email address is allowed on this page
  const validateAdminEmail = (emailStr) => {
    return emailStr.trim().toLowerCase() === "manaswinig.aids2025@citchennai.net";
  };

  // 1. SIGN IN LOGIC
  const handleLogin = async () => {
    const formattedEmail = email.trim().toLowerCase();

    if (!validateAdminEmail(formattedEmail)) {
      alert("Access Denied: This email address is not authorized for Administrative access.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formattedEmail, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        navigate("/admin-dashboard");
      } else {
        await sendEmailVerification(user);
        alert("Please verify your email address. A verification link has been sent.");
        navigate("/admin-verify");
      }
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        alert("No Admin account exists. If this is your first time, click 'Create Admin Password' below!");
      } else if (err.code === "auth/wrong-password") {
        alert("Incorrect password. If you forgot it, use the password reset link.");
      } else {
        alert("Login Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. PASSWORD CREATION LOGIC WITH STRONGER VALIDATION
  const handleCreatePassword = async () => {
    const formattedEmail = email.trim().toLowerCase();

    if (!formattedEmail || !password) {
      alert("Please enter both your Admin Email and your desired Password into the inputs first, then click 'Create Admin Password'.");
      return;
    }

    if (!validateAdminEmail(formattedEmail)) {
      alert("Access Denied: You cannot create an admin password for this email address.");
      return;
    }

    // Strict regex validation for uppercase, lowercase, numbers, and special characters
    // Use RegExp constructor to avoid unnecessary-escape lint issues with the '/' character
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_\\-+={[}\\]|:;\"'<,>.?/]).{8,}$");
    
    if (!passwordRegex.test(password)) {
      alert("Security Requirement Fail: Your new account password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and at least one special character (e.g., !, @, #, $, %, ^, &, *).");
      return;
    }

    const confirmSetup = window.confirm(`Do you want to create/initialize the admin password for ${formattedEmail}?`);
    if (!confirmSetup) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formattedEmail, password);
      await sendEmailVerification(userCredential.user);
      alert("Admin password created successfully! A verification email has been sent. Please verify it before logging in.");
      navigate("/admin-verify");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("This admin account password has already been created! If it's saying incorrect password, use 'Forgot Password' to reset it.");
      } else {
        alert("Setup Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.header}>Admin Login</h2>

        {/* ORIGINAL RECTANGULAR BOX RENDERED UNCHANGED */}
        <div style={styles.imageWrapper}>
          <img src={adminImg} alt="Admin" style={styles.img} />
        </div>

        <div style={styles.form}>
          <input 
            style={styles.input} 
            placeholder="Admin Email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            style={styles.input} 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
          />

          <div style={styles.forgotRow}>
            <span 
              onClick={() => navigate("/forgot-password", { state: { from: "admin" } })} 
              style={styles.linkSmall}
            >
              Forgot Password?
            </span>
          </div>
          
          <button 
            onClick={handleLogin} 
            disabled={loading} 
            style={styles.loginBtn}
          >
            {loading ? "Verifying..." : "Login"} 
          </button>

          <p style={styles.footerText}>
            First time using this admin email?{" "}
            <span onClick={handleCreatePassword} style={styles.linkCreate}>
              Create Admin Password
            </span>
          </p>

          <p style={styles.footerText}>
            Not an Admin? <span onClick={() => navigate("/student-login")} style={styles.linkBold}>Student Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// YOUR EXACT ORIGINAL CSS SPECIFICATIONS
const styles = {
  page: { 
    height: "100vh", 
    background: "#0f0f1a", // Exact core dark background color used in the dashboard panels
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    margin: 0,
    padding: "20px"
  },
  container: { width: "100%", maxWidth: "400px", textAlign: "center", padding: "20px" },
  header: { fontSize: "30px", color: "#8b6dc2", fontWeight: "bold", marginBottom: "20px" },
  imageWrapper: { width: "350px", height: "300px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 20px rgba(0,0,0,0.1)", margin: "0 auto 25px auto", backgroundColor: "white" },
  img: { width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: { padding: "16px", borderRadius: "12px", border: "1px solid #D1E3F8", backgroundColor: "#F0F7FF", fontSize: "16px", outline: "none" },
  forgotRow: { textAlign: "right", marginTop: "-5px" },
  linkSmall: { fontSize: "14px", color: "#1E88E5", cursor: "pointer", fontWeight: "600" },
  loginBtn: { padding: "16px", color: "white", background: "#724dbd", border: "none", borderRadius: "12px", fontSize: "18px", fontWeight: "bold", cursor: "pointer" },
  footerText: { marginTop: "10px", color: "#546E7A", fontSize: "14px" },
  linkBold: { color: "#0D47A1", fontWeight: "bold", cursor: "pointer" },
  linkCreate: { color: "#1E88E5", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }
};