import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, push, set, onValue } from "firebase/database";
import { getLostItems, saveLostItems } from "../utils/lostFoundStorage";

function StudentDashboard() {
  const [page, setPage] = useState("home");

  // LOST & FOUND STATE
  const [lostItems, setLostItems] = useState(getLostItems());
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [area, setArea] = useState("");
  const [contact, setContact] = useState("");

  // SLEEP ALERT STATE
  const [destination, setDestination] = useState("");
  const [alertTime, setAlertTime] = useState(5);
  const [sleepAlertStarted, setSleepAlertStarted] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState(null);
  const [sleepIntervalId, setSleepIntervalId] = useState(null);

  // ATTENDANCE STATES
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceMessage, setAttendanceMessage] = useState("");
  const [selectedRouteId, setSelectedRouteId] = useState(""); 

  // LIVE REALTIME BUS STATE
  const [searchText, setSearchText] = useState("");
  const [busRoutes, setBusRoutes] = useState([]);

  // 🔄 REALTIME FIREBASE SYNC & AUTO 3-HOUR CLEAR CHECKER
  useEffect(() => {
    const routesRef = ref(db, "bus_routes");
    
    const unsubscribe = onValue(routesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const currentTime = Date.now();
        const threeHours = 3 * 60 * 60 * 1000; 

        const formattedRoutes = Object.keys(data).map((key) => {
          const item = data[key];

          // 🕒 Seat Auto-Reset Evaluator
          if (item.occupiedSeats > 0 && item.lastUpdated && (currentTime - item.lastUpdated > threeHours)) {
            const seatRef = ref(db, `bus_routes/${key}/occupiedSeats`);
            set(seatRef, 0);
            item.occupiedSeats = 0;
          }
          
          return {
            id: key,
            routeNo: item.routeNo || key.replace("route_", ""),
            driverName: item.driverName || "Not Assigned",
            driverNo: item.driverNo || "N/A",
            routePath: item.routePath || "Not Specified",
            destination: item.destination || "N/A",
            occupiedSeats: item.occupiedSeats !== undefined ? Number(item.occupiedSeats) : 0,
            totalSeats: item.totalSeats !== undefined ? Number(item.totalSeats) : 40,
            lastUpdated: item.lastUpdated || currentTime
          };
        });

        formattedRoutes.sort((a, b) => {
          const numA = parseInt(String(a.routeNo).replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(String(b.routeNo).replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });

        setBusRoutes(formattedRoutes);

        if (formattedRoutes.length > 0) {
          const stillExists = formattedRoutes.some(r => r.id === selectedRouteId);
          if (!selectedRouteId || !stillExists) {
            setSelectedRouteId(formattedRoutes[0].id);
          }
        } else {
          setSelectedRouteId("");
        }
      } else {
        setBusRoutes([]);
        setSelectedRouteId("");
      }
    });

    return () => unsubscribe();
  }, [selectedRouteId]);

  // AUTO REFRESH LOST ITEMS
  useEffect(() => {
    const interval = setInterval(() => {
      setLostItems(getLostItems());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // CAMPUS MAP AUTO-DELETE AT 5 PM
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      if (now.getHours() === 17 && now.getMinutes() === 0) {
        localStorage.removeItem("campusMap");
      }
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // AUTO RECEIVED RETENTION CLEANER
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      const filteredItems = getLostItems().filter((item) => {
        if (item.status === "Received" && item.receivedTime) {
          const hoursPassed = (currentTime - item.receivedTime) / (1000 * 60 * 60);
          return hoursPassed < 24;
        }
        return true;
      });
      setLostItems(filteredItems);
      saveLostItems(filteredItems);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // UPLOAD LOST ITEMS
  const addItem = () => {
    if (!desc || !area || !contact) {
      alert("Fill all fields");
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem = {
          id: Date.now(),
          desc,
          area,
          contact,
          image: reader.result,
          status: "Not Received",
          receivedTime: null,
        };
        const updated = [newItem, ...lostItems];
        setLostItems(updated);
        saveLostItems(updated);
      };
      reader.readAsDataURL(file);
    }
    setDesc("");
    setArea("");
    setContact("");
    setFile(null);
  };

  const toggleReceived = (id) => {
    const updated = lostItems.map((item) => {
      if (item.id === id) {
        if (item.status !== "Received") {
          return { ...item, status: "Received", receivedTime: Date.now() };
        }
        return { ...item, status: "Not Received", receivedTime: null };
      }
      return item;
    });
    setLostItems(updated);
    saveLostItems(updated);
  };

  // SLEEP ALERT CONFIGURATION ENGINE
  const startBackgroundAlert = (startMinutes, selectedAlertTime, selectedDestination) => {
    if (sleepIntervalId) clearInterval(sleepIntervalId);
    let eta = startMinutes;
    const interval = setInterval(() => {
      eta--;
      setRemainingMinutes(eta);
      localStorage.setItem(
        "sleepAlert",
        JSON.stringify({
          destination: selectedDestination,
          alertTime: selectedAlertTime,
          remainingMinutes: eta,
        })
      );

      if (eta === selectedAlertTime) {
        if (!window.sleepAudio) {
          window.sleepAudio = new Audio(
            "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
          );
        }
        window.sleepAudio.loop = true;
        window.sleepAudio.play();
      }

      if (eta <= 0) clearInterval(interval);
    }, 60000);
    setSleepIntervalId(interval);
  };

  useEffect(() => {
    const savedAlert = JSON.parse(localStorage.getItem("sleepAlert"));
    if (savedAlert) {
      setDestination(savedAlert.destination);
      setAlertTime(savedAlert.alertTime);
      setSleepAlertStarted(true);
      setRemainingMinutes(savedAlert.remainingMinutes);
      startBackgroundAlert(
        savedAlert.remainingMinutes,
        savedAlert.alertTime,
        savedAlert.destination
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // TWILIO EMERGENCY SMS DISPATCH
  const sendSOS = async () => {
    const loggedInEmail = localStorage.getItem("userEmail");
    if (!loggedInEmail) {
      alert("❌ Student session not detected.");
      return;
    }
    const currentEmail = loggedInEmail.toLowerCase().trim();

    let displayName = "";
    if (currentEmail === "ksrakshni.cse2025@citchennai.net") {
      displayName = "Rakshni";
    } else if (currentEmail === "saindhavis.cse2025@citchennai.net") {
      displayName = "Saindhavi";
    } else {
      displayName = currentEmail.split(".")[0]; 
    }

    try {
      let parentMobileNumber = localStorage.getItem("parentPhone") || "";
      let cleanPhone = parentMobileNumber.trim();

      if (!cleanPhone || cleanPhone === "") {
        cleanPhone = "8807259014"; 
      }
      if (!cleanPhone.startsWith("+")) {
        cleanPhone = `+91${cleanPhone}`;
      }

      const sosRef = ref(db, "sos_alerts");
      await push(sosRef, {
        name: displayName,
        email: currentEmail,
        parentPhone: cleanPhone, 
        status: "🚨 EMERGENCY ALERT ACTIVE",
        time: new Date().toLocaleString(),
        timestamp: Date.now(),
        orderIndex: -1 * Date.now()
      });

      const accountSid = ""; 
      const authToken = "";   
      const twilioNumber = ""; 

      const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const smsData = new URLSearchParams();
      smsData.append("To", cleanPhone);
      smsData.append("From", twilioNumber);
      smsData.append("Body", `🚨 WAYPOINT EMERGENCY ALERT: ${displayName.toUpperCase()} triggered active SOS.`);

      const response = await fetch(twilioApiUrl, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: smsData.toString()
      });

      if (response.ok) {
        alert(`✅ SOS Dispatched successfully!`);
      } else {
        alert(`⚠️ Alert logged, but SMS transmission failed.`);
      }
    } catch (error) {
      console.error(error);
      alert("🚨 Network dispatch pipeline failure.");
    }
  };

  // BIOMETRIC ATTENDANCE SCANNER
  const markAttendance = async () => {
    if (!selectedRouteId) {
      alert("❌ Please pick an active Bus Route first.");
      return;
    }

    try {
      setAttendanceLoading(true);
      setAttendanceMessage("Opening camera...");

      const response = await fetch("http://127.0.0.1:5001/face-login");
      const data = await response.json();

      if (data.name === "Unknown" || !data.name) {
        setAttendanceMessage("❌ Face Not Recognized");
        return;
      }

      const attendanceRef = ref(db, "attendance/" + data.name);
      await set(attendanceRef, {
        name: data.name,
        status: "Present",
        time: new Date().toLocaleString(),
        busRouteId: selectedRouteId
      });

      const targetBus = busRoutes.find(b => b.id === selectedRouteId);
      if (targetBus) {
        const busRouteRef = ref(db, `bus_routes/${selectedRouteId}`);
        const maxCapacity = targetBus.totalSeats;
        const currentOccupied = targetBus.occupiedSeats;

        const updatedOccupied = currentOccupied < maxCapacity ? currentOccupied + 1 : maxCapacity;
        
        // 🌟 Increment seats and set timestamp for 3-hour expiry
        await set(busRouteRef, {
          ...targetBus,
          occupiedSeats: updatedOccupied,
          lastUpdated: Date.now() 
        });

        setAttendanceMessage(`✅ Attendance Checked In! Bus Route ${targetBus.routeNo} Seat allocated for ${data.name}.`);
      }
    } catch (error) {
      console.error(error);
      setAttendanceMessage("❌ Attendance Processing Pipeline Failed");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const currentSelectedBus = busRoutes.find(b => b.id === selectedRouteId);

  return (
    <div className="min-h-screen flex bg-[#0f0f1a] text-white flex-col">
      <div className="flex flex-1">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-72 bg-[#18182a] p-6 border-r border-violet-900 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-violet-300 mb-8">WayPoint Student</h1>
            <div className="space-y-3">
              <button onClick={() => setPage("home")} className={`w-full text-left p-3 rounded-xl transition-all ${page === "home" ? "bg-violet-700 text-white" : "hover:bg-violet-800 text-gray-300"}`}>🏠 Dashboard</button>
              <button onClick={() => (window.location.href = "/tracking")} className="w-full text-left p-3 rounded-xl hover:bg-violet-800 text-gray-300">📍 Live Tracking</button>
              <button onClick={() => setPage("lost")} className={`w-full text-left p-3 rounded-xl transition-all ${page === "lost" ? "bg-violet-700 text-white" : "hover:bg-violet-800 text-gray-300"}`}>📦 Lost & Found</button>
              <button onClick={() => setPage("map")} className={`w-full text-left p-3 rounded-xl transition-all ${page === "map" ? "bg-violet-700 text-white" : "hover:bg-violet-800 text-gray-300"}`}>🗺 Campus Map</button>
              <button onClick={() => setPage("sleep")} className={`w-full text-left p-3 rounded-xl transition-all ${page === "sleep" ? "bg-violet-700 text-white" : "hover:bg-violet-800 text-gray-300"}`}>😴 Sleep Alert</button>
              <button onClick={() => setPage("attendance")} className={`w-full text-left p-3 rounded-xl transition-all ${page === "attendance" ? "bg-violet-700 text-white" : "hover:bg-violet-800 text-gray-300"}`}>📸 Attendance</button>
            </div>
          </div>
          <div className="flex justify-center mt-8 mb-4">
            <button onClick={sendSOS} className="w-28 h-28 rounded-full bg-red-600 text-white text-2xl font-bold shadow-[0_0_40px_rgba(255,0,0,0.9)] animate-pulse hover:scale-105 transition-all duration-300">SOS</button>
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 p-8 overflow-auto">
          
          {/* HOME PANEL */}
          {page === "home" && (
            <div className="mt-4">
              <h1 className="text-4xl text-violet-300 font-bold mb-2">🚌 Bus Management</h1>
              <p className="text-gray-400 mb-8">Live updates fetched instantly from the database syncing all routes dynamically.</p>
              
              <div className="bg-[#18182a] p-4 rounded-2xl max-w-xl mb-8 border border-violet-950">
                <input
                  type="text"
                  placeholder="Enter Route Number, Destination, or Driver Name"
                  className="w-full p-4 rounded-xl bg-[#0f0f1a] text-white border border-violet-900 focus:outline-none"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {busRoutes.length === 0 ? (
                <div className="text-center p-12 bg-[#18182a] rounded-2xl border border-dashed border-violet-900 text-gray-400">
                  📭 No active bus nodes found in database. Add details inside Admin Panel.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                  {busRoutes
                    .filter((route) => {
                      const s = searchText.toLowerCase();
                      return (
                        String(route.routeNo).toLowerCase().includes(s) || 
                        String(route.routePath).toLowerCase().includes(s) || 
                        String(route.destination).toLowerCase().includes(s) ||
                        String(route.driverName).toLowerCase().includes(s)
                      );
                    })
                    .map((route) => (
                      <div key={route.id} className="bg-[#18182a] p-6 rounded-2xl border border-violet-950 flex flex-col justify-between shadow-lg">
                        <div>
                          <h2 className="text-2xl font-bold text-violet-300 mb-4 pb-2 border-b border-violet-900/40">
                            Route {String(route.routeNo).toUpperCase()} Details
                          </h2>
                          <div className="space-y-2 text-base text-gray-200">
                            <p><span className="text-violet-400 font-medium">👨 Driver Name:</span> {route.driverName}</p>
                            <p><span className="text-violet-400 font-medium">📞 Driver Number:</span> {route.driverNo}</p>
                            <p><span className="text-violet-400 font-medium">📍 Route Path:</span> {route.routePath}</p>
                            <p><span className="text-violet-400 font-medium">🎯 Destination:</span> {route.destination}</p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-violet-900/40 flex justify-between text-sm text-gray-400">
                          <span>Capacity status:</span>
                          <span className="font-bold text-violet-300">{route.occupiedSeats} / {route.totalSeats} Active</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE INTERFACE */}
          {page === "attendance" && (
            <div>
              <h1 className="text-4xl text-violet-300 font-bold mb-6">📸 Smart Attendance</h1>
              <div className="bg-[#18182a] p-8 rounded-2xl max-w-2xl border border-violet-950 shadow-xl">
                
                <div className="mb-6">
                  <label className="block text-violet-300 font-bold mb-3 text-lg">Choose Bus Route Number:</label>
                  {busRoutes.length === 0 ? (
                    <p className="text-red-400 text-sm">⚠️ Loading active routes configuration matrix...</p>
                  ) : (
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full p-4 rounded-xl bg-[#0f0f1a] text-white border border-violet-900 font-semibold text-lg focus:outline-none"
                    >
                      {busRoutes.map((route) => (
                        <option key={route.id} value={route.id}>
                          Route {String(route.routeNo).toUpperCase()} — {route.destination}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {currentSelectedBus && (
                  <div className="mb-8 p-5 bg-[#0f0f1a] rounded-xl border border-violet-900 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-400 tracking-wider block mb-1">💺 BUS SEAT STATUS (LIVE)</span>
                      <span className="text-lg text-white">
                        Seats Occupied: <span className="text-violet-400 font-black text-2xl">{currentSelectedBus.occupiedSeats}</span> / {currentSelectedBus.totalSeats}
                      </span>
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded-full text-xs font-black border bg-black/40"
                            style={{ 
                              borderColor: currentSelectedBus.occupiedSeats >= currentSelectedBus.totalSeats ? "#ef4444" : "#10b981",
                              color: currentSelectedBus.occupiedSeats >= currentSelectedBus.totalSeats ? "#ef4444" : "#10b981"
                            }}>
                        {currentSelectedBus.occupiedSeats >= currentSelectedBus.totalSeats ? "FULL" : "AVAILABLE"}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-gray-300 mb-6 text-base">Make sure the selection matches your bus, then scan face profile to log seating metrics.</p>
                
                <button 
                  disabled={attendanceLoading || busRoutes.length === 0} 
                  onClick={markAttendance} 
                  className="w-full bg-violet-700 hover:bg-violet-800 disabled:bg-gray-800 text-white p-4 rounded-xl text-lg font-bold transition-all shadow-md"
                >
                  {attendanceLoading ? "Processing Face login scan..." : "Start Attendance"}
                </button>

                {attendanceMessage && (
                  <div className="mt-6 bg-[#0f0f1a] p-5 rounded-xl border border-violet-900">
                    <p className="text-violet-300 text-lg font-bold">{attendanceMessage}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LOST & FOUND */}
          {page === "lost" && (
            <div>
              <h1 className="text-3xl text-violet-300 mb-6">Lost & Found</h1>
              <div className="bg-[#18182a] p-6 rounded-2xl max-w-xl mb-8 space-y-4">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Item Name" className="w-full p-3 rounded-xl bg-[#0f0f1a]" />
                <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Lost Area" className="w-full p-3 rounded-xl bg-[#0f0f1a]" />
                <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact Number" className="w-full p-3 rounded-xl bg-[#0f0f1a]" />
                <button onClick={addItem} className="w-full bg-violet-700 p-3 rounded-xl">Upload Item</button>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {lostItems.map((item) => (
                  <div key={item.id} className="bg-[#18182a] p-4 rounded-2xl">
                    {item.image && <img src={item.image} alt={item.desc} className="w-full h-40 object-cover rounded-xl mb-3" />}
                    <p className="text-violet-300 font-bold text-lg">{item.desc}</p>
                    <p className="mt-2">📍 {item.area}</p>
                    <p>📞 {item.contact}</p>
                    <p className={`mt-3 font-bold ${item.status === "Received" ? "text-green-400" : "text-red-400"}`}>{item.status}</p>
                    <button onClick={() => toggleReceived(item.id)} className="mt-4 w-full bg-violet-700 hover:bg-violet-800 p-3 rounded-xl">
                      {item.status === "Received" ? "Mark as Not Received" : "Confirm Received"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAMPUS MAP */}
          {page === "map" && (
            <div>
              <h1 className="text-3xl text-violet-300 mb-6">Campus Map</h1>
              <div className="bg-[#18182a] p-6 rounded-2xl">
                {localStorage.getItem("campusMap") ? (
                  <img src={localStorage.getItem("campusMap")} alt="Campus Map" className="w-full rounded-2xl" />
                ) : (
                  <div className="text-center p-10 text-gray-400">No Campus Map Uploaded</div>
                )}
              </div>
            </div>
          )}

          {/* SLEEP ALERT */}
          {page === "sleep" && (
            <div>
              <h1 className="text-4xl text-violet-300 mb-6">😴 Sleep Alert</h1>
              <div className="bg-[#18182a] p-6 rounded-2xl max-w-xl">
                <input type="text" placeholder="Enter Destination" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-4 rounded-xl bg-[#0f0f1a] mb-5" />
                <p className="mb-3 font-bold">Alert Before:</p>
                <div className="flex gap-4 mb-6">
                  {[5, 10, 15, 19].map((mins) => (
                    <button key={mins} onClick={() => setAlertTime(mins)} className={`px-5 py-3 rounded-xl ${alertTime === mins ? "bg-violet-700" : "bg-gray-700"}`}>
                      {mins} Min
                    </button>
                  ))}
                </div>
                <button onClick={() => { setSleepAlertStarted(true); setRemainingMinutes(20); localStorage.setItem("sleepAlert", JSON.stringify({ destination, alertTime, remainingMinutes: 20 })); startBackgroundAlert(20, alertTime, destination); }} className="w-full bg-violet-700 p-4 rounded-xl font-bold mb-4">▶ Start Sleep Alert</button>
                <button onClick={() => { localStorage.removeItem("sleepAlert"); setSleepAlertStarted(false); setRemainingMinutes(null); if (sleepIntervalId) clearInterval(sleepIntervalId); if (window.sleepAudio) { window.sleepAudio.pause(); window.sleepAudio.currentTime = 0; } alert("Sleep Alert Turned OFF"); }} className="w-full bg-red-600 p-4 rounded-xl font-bold">⏹ Turn OFF Alert</button>
                {sleepAlertStarted && (
                  <div className="mt-6">
                    <p className="text-violet-300 font-bold text-lg">Destination: {destination}</p>
                    <p className="mt-2">Alert before {alertTime} mins</p>
                    <p className="mt-2 text-green-400 font-bold">Remaining ETA: {remainingMinutes} mins</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;