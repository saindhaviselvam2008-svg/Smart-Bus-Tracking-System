import  { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/bus app logo.jpeg"; 

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const DEVELOPER_NUMBER = "916369055460"; 

  // Capture the numbers from Step 2 state safely
  const studentPhone = location.state?.studentPhone || "";
  const parentPhone = location.state?.parentPhone || "";
  const relationship = location.state?.relationship || "";

  const [otpInput, setOtpInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ROUTE GUARD: Prevent manual URL access
  useEffect(() => {
    if (!location.state?.studentPhone) {
      navigate("/verify-otp", { replace: true });
    }
  }, [location.state, navigate]);

  // Stable OTP generation
  const [generatedOtp] = useState(() => {
    const phone = location.state?.studentPhone || "";
    const salt = phone ? parseInt(phone.slice(-4)) : 1234;
    return String(((Math.floor(100000 + Math.random() * 900000) + salt) % 900000) + 100000);
  });

  const isSimulationMode = studentPhone !== DEVELOPER_NUMBER;

  // WhatsApp API Logic
  const triggerWhatsAppSms = async (number, code) => {
    try {
      await fetch("https://vy1mnv.api.infobip.com/whatsapp/1/message/template", {
        method: "POST",
        headers: {
          "Authorization": "b693c65e27601698878794f0f9c97e96-b7885c05-d0b8-4984-93bf-af730d7c45b5 ",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{
            from: "447860088970",
            to: number,
            content: {
              templateName: "test_whatsapp_template_en",
              templateData: { body: { placeholders: ["Student", code] } },
              language: "en"
            }
          }]
        })
      });
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    if (studentPhone === DEVELOPER_NUMBER) {
      triggerWhatsAppSms(DEVELOPER_NUMBER, generatedOtp);
    }
  }, [studentPhone, generatedOtp]);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpInput === generatedOtp) {
      setErrorMessage("");
      setSuccessMessage("OTP Verified! Redirecting...");
      setTimeout(() => {
        // Navigate to your Email Verification page
        navigate("/verify-email", { state: { studentPhone, parentPhone, relationship } });
      }, 1500);
    } else {
      setErrorMessage("Invalid verification code.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        {/* FLOATING LOGO */}
        <div style={styles.logoContainer}>
          <img src={logo} alt="Logo" style={styles.logoImage} />
        </div>

        <h2 style={styles.header}>Verify OTP</h2>
        <p style={styles.subHeader}>We sent a code to +{studentPhone}</p>

        {/* FEEDBACK MESSAGES */}
        {errorMessage && <div style={styles.errorBanner}>{errorMessage}</div>}
        {successMessage && <div style={styles.successBanner}>{successMessage}</div>}

        {/* SANDBOX BOX: Only shows if it's NOT your number */}
        {isSimulationMode && (
          <div style={styles.sandboxBox}>
            <p style={{ margin: 0, fontWeight: "600", color: "#B71C1C" }}>Testing Code:</p>
            <p style={{ fontSize: "20px", fontWeight: "800", margin: "5px 0" }}>{generatedOtp}</p>
            <p style={{ fontSize: "11px", margin: 0 }}>Type this code in the box below</p>
          </div>
        )}

        <form onSubmit={handleVerifyOtp}>
          <div style={styles.inputGroup}>
            <input
              type="text"
              maxLength="6"
              required
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/[^0-9]/g, ""))}
              style={styles.otpInput}
              placeholder="000000"
            />
          </div>

          <button type="submit" style={styles.btn}>
            Verify and Continue
          </button>
        </form>

      </div>
    </div>
  );
}

// CONSISTENT STYLING OBJECT
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "#0f0621"
  },

  card: {
    width: "90%",
    maxWidth: "400px",
    background: "white",
    borderRadius: "30px",
    padding: "80px 25px 30px",
    textAlign: "center",
    position: "relative",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)"
  },

  logoContainer: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    overflow: "hidden",
    position: "absolute",
    top: "-55px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "white",
    border:"5px solid #0f0621",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
  },

  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
    
  },

  header: {
    color: "#4d1892",
    fontSize: "28px",
    fontWeight: "bold"
  },

  subHeader: {
    color: "#546E7A",
    marginTop: "10px"
  },

  sandboxBox: {
    background: "#FFF8E1",
    padding: "15px",
    borderRadius: "15px",
    marginTop: "20px",
    marginBottom: "20px"
  },

  otpInput: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    textAlign: "center",
    fontSize: "20px",
    marginBottom: "20px",
    boxSizing: "border-box"
  },

  btn: {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "12px",
    background: "#4d1892",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  errorBanner: {
    background: "#ffebee",
    color: "#c62828",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "15px"
  },

  successBanner: {
    background: "#e8f5e9",
    color: "#2e7d32",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "15px"
  }
};