import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import logo from "../assets/bus app logo.jpeg";

export default function StudentRegisterStep1() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleNext = async () => {
    if (!name || !dept || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    // Alphabetic validation: Allows only uppercase, lowercase letters, and single space separators
    const alphaRegex = /^[A-Za-z\s]+$/;

    if (!alphaRegex.test(name.trim())) {
      alert("Registration Denied: Full Name must contain only alphabet letters and spaces.");
      return;
    }

    if (!alphaRegex.test(dept.trim())) {
      alert("Registration Denied: Department must contain only alphabet letters and spaces (e.g., CSE).");
      return;
    }

    if (!email.toLowerCase().endsWith("@citchennai.net")) {
      alert("Access Denied: Please use your official @citchennai.net email ID.");
      return;
    }

    // Passphrase validation criteria:
    // - At least 8 characters long (?=.{8,})
    // - Contains at least one lowercase letter (?=.*[a-z])
    // - Contains at least one uppercase letter (?=.*[A-Z])
    // - Contains at least one numeric value (?=.*[0-9])
    // - Contains at least one unique special symbol character (?=.*[!@#$%^&*])
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!strongPasswordRegex.test(password)) {
      alert(
        "Security Requirement Fail: Your new account password must be at least 8 characters long and contain a mix of uppercase letters, lowercase letters, numbers, and at least one special character (e.g., !, @, #, $, %, ^, &, *)."
      );
      return;
    }

    try {
      // Creates the user in Firebase Auth using the secure newly formulated password
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Store Step 1 data for Step 2
      const step1Data = { name: name.trim(), dept: dept.trim(), email: email.trim() };
      localStorage.setItem("tempStudentData", JSON.stringify(step1Data));
      
      // Navigate to Step 2
      navigate("/register2");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="Logo" style={styles.logoImage} />
        </div>
        <h2 style={styles.header}>Step 1</h2>
        <p style={styles.subHeader}>Basic Information</p>
        <div style={styles.inputGroup}>
          <input style={styles.input} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Department" value={dept} onChange={(e) => setDept(e.target.value)} />
          <input style={styles.input} placeholder="College Email (@citchennai.net)" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button style={styles.btn} onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

const styles = {
  bg: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0621" },
  card: { position: "relative", width: "85%", maxWidth: "380px", padding: "60px 25px 30px 25px", background: "white", borderRadius: "30px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" },
  logoContainer: { width: "110px", height: "110px", borderRadius: "50%", position: "absolute", top: "-55px", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", border: "5px solid #3e1578", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
  logoImage: { width: "200px", height: "130px", objectFit: "cover" },
  header: { fontSize: "26px", color: "#4d1892", fontWeight: "800", marginBottom: "5px" },
  subHeader: { fontSize: "14px", color: "#546E7A", marginBottom: "25px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "12px" },
  input: { width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #CFD8DC", backgroundColor: "#F8F9FB", fontSize: "15px", outline: "none", boxSizing: "border-box" },
  btn: { width: "100%", padding: "16px", marginTop: "20px", background: "#4d1892", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)" }
};