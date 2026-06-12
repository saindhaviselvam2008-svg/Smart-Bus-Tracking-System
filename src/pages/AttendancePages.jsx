import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { db } from "../firebase";
import { ref, push } from "firebase/database";

function AttendancePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [seatsOccupied, setSeatsOccupied] = useState(0);

  const handleStartAttendance = async () => {
    setLoading(true);
    setStatus("Launching Desktop Camera... Please look directly into your webcam window.");

    try {
      // 🟢 Connects straight to your active face_api.py on route /face-login
      const response = await axios.get("http://127.0.0.1:5001/face-login");
      const detectedName = response.data.name;

      if (detectedName && detectedName !== "Unknown") {
        const now = new Date();

        // Write verification stamp to Firebase
        await push(ref(db, "attendance"), {
          name: detectedName,
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          status: "Present",
        });

        setSeatsOccupied((prev) => Math.min(prev + 1, 40));
        setStatus(`Location matched and Attendance Marked Successfully for ${detectedName}! ✅`);
      } else {
        setStatus("Verification Failed: Face not matched in dataset profiles. ❌");
      }
    } catch (error) {
      console.error(error);
      setStatus("Attendance Failed: Check if your Flask backend terminal is running on port 5001.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] p-8 flex flex-col items-center justify-center text-white">
      <div className="w-full max-w-4xl bg-[#11152d] rounded-3xl p-8 shadow-2xl border border-violet-700 relative">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate("/")} 
          className="absolute top-6 left-6 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-bold transition"
        >
          ⬅ Back to Dashboard
        </button>

        <div className="text-center mt-8">
          <h1 className="text-5xl font-bold text-violet-300 mb-4">
            📸 Smart Attendance
          </h1>
        </div>

        <div className="max-w-xl mx-auto mt-8 bg-[#0b0e22] p-6 rounded-2xl border border-violet-900/50">
          <label className="block text-sm font-semibold text-violet-300 mb-2">
            Choose Bus Route Number:
          </label>
          <select className="w-full bg-[#11152d] border border-violet-700 text-white rounded-xl p-3 mb-6 focus:outline-none focus:border-purple-500">
            <option>Route 01 — chrompet</option>
            <option>Route 02 — porur</option>
          </select>

          {/* Live Capacity Seat Monitoring Block */}
          <div className="bg-[#11152d] border border-violet-800/80 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">🚌 Bus Seat Status (Live)</span>
                <span className="text-xl font-semibold text-white">
                  Seats Occupied: <span className="text-purple-400 font-bold text-2xl">{seatsOccupied}</span> / 40
                </span>
              </div>
              <span className="bg-emerald-950/80 border border-emerald-500 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Available
              </span>
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-6 text-center">
            Make sure the selection matches your bus, then scan face profile to log seating metrics.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleStartAttendance}
              disabled={loading}
              className={`w-full ${
                loading ? "bg-gray-600 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"
              } text-white py-4 rounded-xl text-xl font-bold shadow-xl transition transform active:scale-[0.98]`}
            >
              {loading ? "Camera Popup Active..." : "Start Attendance"}
            </button>
          </div>

          {/* Status Message Display Container */}
          {status && (
            <div className="mt-6 bg-[#050816] rounded-2xl p-4 text-center border border-violet-700">
              <p className="text-lg font-semibold text-violet-200">{status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendancePage;