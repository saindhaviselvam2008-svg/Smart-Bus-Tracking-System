import { useNavigate } from "react-router-dom";
import heroBus from "../assets/hero.jpeg"; 

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* 3/4 TOP SECTION */}
      <div style={styles.topSection}>
        <div style={styles.titleBox}>
          <h1 style={styles.appName}>WayPoint</h1>
          <p style={styles.tagline}>Smart College Bus Tracking System</p>
        </div>

        <div style={styles.imageContainer}>
          <img src={heroBus} alt="Bus" style={styles.image} />
        </div>
      </div>

      {/* 1/4 BOTTOM PANEL */}
      <div style={styles.bottomCard}>
        <button style={styles.studentBtn} onClick={() => navigate("/student-login")}>
          👤 Student Login
        </button>

        <button style={styles.adminBtn} onClick={() => navigate("/admin-login")}>
          🧑‍💼 Admin Login
        </button>
        
        <p style={styles.footerText}>Version 1.0 • WayPoint</p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#0f0621",
    margin: 0,
    overflow: "hidden", // Prevents scrolling on the welcome page
  },

  topSection: {
    flex: 4, // This takes up 3 parts (75%) of the screen
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: "40px",
  },

  titleBox: {
    textAlign: "center",
    marginBottom: "20px",
  },

  appName: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#56418c",
    margin: 0,
    letterSpacing: "1px",
  },

  tagline: {
    fontSize: "14px",
    marginTop: "5px",
    color:"#b2a6d2"
  },

  imageContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "0px",
  },

  image: {
    width: "100%", 
    maxWidth: "600px", // Limits width on desktop, full width on mobile
    height: "auto",
    objectFit: "contain",
    marginTop: "0px",
    borderRadius: "25px",   // Increase this number for even smoother/rounder corners
    overflow: "hidden",
    filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.15))", // Makes the bus "pop"
  },

  bottomCard: {
    flex: 0.8, // This takes up 1 part (25%) of the screen
    background:  "#0f0f1a",
    borderTopLeftRadius: "35px",
    borderTopRightRadius: "35px",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    alignItems: "center",
    boxShadow: "0 -10px 40px rgba(0,0,0,0.08)",
  },

  studentBtn: {
    width: "90%",
    padding: "16px",
    borderRadius: "15px",
    border: "2px solid #a24fda",
    background: "transparent",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(30, 136, 229, 0.3)",
  },

  adminBtn: {
    width: "90%",
    padding: "16px",
    borderRadius: "15px",
    border: "2px solid #a24fda",
    background: "transparent",
    color: "#fbfbfb",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  footerText: {
    fontSize: "12px",
    color: "#BDBDBD",
    marginTop: "10px",
  }
};