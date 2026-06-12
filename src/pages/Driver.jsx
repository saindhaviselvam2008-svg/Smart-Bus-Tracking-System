import { useState } from "react";
import { db } from "../firebase";
import { ref, set } from "firebase/database";

export default function Driver() {

  const [busNo, setBusNo] = useState("1");
  const [watchId, setWatchId] = useState(null);

  const startTracking = () => {

    if (!navigator.geolocation) {
      alert("GPS not supported");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {

        set(ref(db, `buses/${busNo}`), {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          time: Date.now()
        });

      },
      (err) => {
        alert("GPS permission denied");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>

      <h2>🚍 Driver GPS Tracker</h2>

      <select value={busNo} onChange={(e) => setBusNo(e.target.value)}>
        <option value="1">Bus 1</option>
        <option value="2">Bus 2</option>
        <option value="3">Bus 3</option>
        <option value="4">Bus 4</option>
      </select>

      <br /><br />

      <button onClick={startTracking} style={{ marginRight: "10px" }}>
        Start GPS
      </button>

      <button onClick={stopTracking}>
        Stop GPS
      </button>

    </div>
  );
}