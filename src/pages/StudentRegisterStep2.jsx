import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/bus app logo.jpeg";

export default function RegisterStep2() {
  const navigate = useNavigate();

  // Input states
  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const areNumbersIdentical = studentPhone && parentPhone && studentPhone === parentPhone;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleProceed = (e) => {
    e.preventDefault();

    if (areNumbersIdentical) {
      setErrorMessage("Validation Error: Student phone number and Parent phone number cannot be the same!");
      return;
    }

    if (!relationship) {
      setErrorMessage("Please select a parent/guardian relationship option.");
      return;
    }

    setErrorMessage("");

    // 🌟 SUCCESS PIPELINE: Save values to browser memory for the StudentDashboard
    localStorage.setItem("studentPhone", studentPhone);
    localStorage.setItem("parentPhone", parentPhone);
    
    navigate("/verify-otp", { 
      state: { 
        studentPhone, 
        parentPhone, 
        relationship,
        profilePhoto 
      } 
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        <div style={styles.logoContainer}>
          <img src={logo} alt="WayPoint Logo" style={styles.logoImage} />
        </div>

        <h2 style={styles.header}>Profile Information</h2>
        <p style={styles.subHeader}>Please enter your contact and profile details</p>

        {areNumbersIdentical && (
          <div style={styles.errorBanner}>
            <strong>Validation Error:</strong> Student and Parent phone numbers cannot be identical!
          </div>
        )}

        {errorMessage && !areNumbersIdentical && (
          <div style={styles.errorBanner}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleProceed}>
          <div style={styles.inputGroup}>
            
            {/* Student Phone Input */}
            <input
              type="text"
              required
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value.replace(/[^0-9]/g, ""))}
              style={styles.input}
              placeholder="Student Phone Number"
            />

            {/* Parent Phone Input */}
            <input
              type="text"
              required
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value.replace(/[^0-9]/g, ""))}
              style={styles.input}
              placeholder="Parent Phone Number"
            />

            {/* Relationship Dropdown Selection */}
            <select
              required
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              style={styles.input}
            >
              <option value="">-- Select Relationship --</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Guardian">Guardian</option>
            </select>

            {/* NEW: CUSTOM FILE UPLOAD BOX */}
            <label style={styles.fileUploadBox}>
              <span style={{ color: profilePhoto ? "#0D47A1" : "#757575" }}>
                {profilePhoto ? `Selected: ${profilePhoto.name}` : "Upload Profile Photo"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={styles.hiddenFileInput} 
              />
            </label>

          </div>

          <button
            type="submit"
            disabled={areNumbersIdentical}
            style={{
              ...styles.btn,
              opacity: areNumbersIdentical ? 0.6 : 1,
              cursor: areNumbersIdentical ? "not-allowed" : "pointer"
            }}
          >
            Proceed to OTP Verification
          </button>
        </form>

      </div>
    </div>
  );
}

const styles = {
  page: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0621" },
  card: { position: "relative", width: "85%", maxWidth: "380px", padding: "65px 25px 35px 25px", background: "white", borderRadius: "30px", textAlign: "center", boxShadow: "0 15px 35px rgba(0,0,0,0.1)", boxSizing: "border-box" },
  logoContainer: { width: "110px", height: "110px", borderRadius: "50%", position: "absolute", top: "-55px", left: "50%", transform: "translateX(-50%)", backgroundColor: "white", border: "5px solid  #3e1578", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
  logoImage: { width: "200px", height: "130px", objectFit: "cover" },
  header: { fontSize: "26px", color: "#4d1892", fontWeight: "800", marginBottom: "5px" },
  subHeader: { fontSize: "14px", color: "#546E7A", marginBottom: "30px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "18px" },
  input: { width: "100%", padding: "16px", borderRadius: "12px", border: "1px solid #CFD8DC", backgroundColor: "#F8F9FB", fontSize: "15px", outline: "none", boxSizing: "border-box" },
  fileUploadBox: { 
    width: "100%", 
    padding: "16px", 
    borderRadius: "12px", 
    border: "1px solid #CFD8DC", 
    backgroundColor: "#F8F9FB", 
    fontSize: "15px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer", 
    boxSizing: "border-box",
    textAlign: "center"
  },
  hiddenFileInput: { display: "none" }, 
  btn: { width: "100%", padding: "16px", marginTop: "24px", background: "#4d1892", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "bold", boxShadow: "0 6px 20px rgba(25, 118, 210, 0.3)" },
  errorBanner: { backgroundColor: "#ffeef0", color: "#d92534", padding: "12px", borderRadius: "12px", fontSize: "13px", marginBottom: "16px", textAlign: "left", borderLeft: "4px solid #d92534" }
};