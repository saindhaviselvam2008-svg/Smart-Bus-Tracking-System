import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue, remove, set } from "firebase/database"; 
import AdminTracking from "./AdminTracking";

import {
  getLostItems,
  saveLostItems
} from "../utils/lostFoundStorage";

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState("dashboard");
  
  // SOS ALERTS STATE
  const [sosAlerts, setSosAlerts] = useState([]);

  // LOST & FOUND STATE
  const [lostItems, setLostItems] = useState(getLostItems());
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [area, setArea] = useState("");
  const [contact, setContact] = useState("");

  // CAMPUS MAP STATE
  const [campusMap, setCampusMap] = useState(
    localStorage.getItem("campusMap") || null
  );

  // BUS ROUTE MANAGEMENT STATE
  const [routeNo, setRouteNo] = useState("");
  const [busRoutes, setBusRoutes] = useState([]); 
  const [newRoute, setNewRoute] = useState({
    routeNo: "",
    driverName: "",
    driverNo: "",
    routePath: "",
    destination: ""
  });

  // AUTO REFRESH LOST ITEMS
  useEffect(() => {
    const interval = setInterval(() => {
      setLostItems(getLostItems());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🚨 FIREBASE LISTENER FOR SOS ALERTS
  useEffect(() => {
    const sosRef = ref(db, "sos_alerts");
    const unsubscribe = onValue(sosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activeAlerts = Object.keys(data).map((key) => ({
          id: key,
          studentName: data[key].name || "Unknown Student",
          studentEmail: data[key].email || "No Email Provided",
          message: data[key].status || "🚨 EMERGENCY ALERT ACTIVE",
          time: data[key].time || new Date().toLocaleString()
        }));
        setSosAlerts(activeAlerts.reverse());
      } else {
        setSosAlerts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🚌 FIREBASE LISTENER FOR REALTIME BUS ROUTES (With automatic 3-hour seat reset)
  useEffect(() => {
    const routesRef = ref(db, "bus_routes");
    const unsubscribe = onValue(routesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const currentTime = Date.now();
        const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

        const formattedRoutes = Object.keys(data).map((key) => {
          const item = data[key];
          
          // 🕒 Check if the 3-hour seat window has expired
          if (item.occupiedSeats > 0 && item.lastUpdated && (currentTime - item.lastUpdated > threeHours)) {
            // Automatically clear seats in the database backend
            const seatRef = ref(db, `bus_routes/${key}/occupiedSeats`);
            set(seatRef, 0);
            item.occupiedSeats = 0; 
          }

          return {
            id: key,
            routeNo: item.routeNo || key,
            driverName: item.driverName || "Not Assigned",
            driverNo: item.driverNo || "N/A",
            routePath: item.routePath || "Not Specified",
            destination: item.destination || "N/A",
            occupiedSeats: item.occupiedSeats !== undefined ? Number(item.occupiedSeats) : 0,
            totalSeats: item.totalSeats !== undefined ? Number(item.totalSeats) : 40
          };
        });

        // Numerical Sorting
        formattedRoutes.sort((a, b) => {
          const numA = parseInt(String(a.routeNo).replace(/\D/g, ""), 10) || 0;
          const numB = parseInt(String(b.routeNo).replace(/\D/g, ""), 10) || 0;
          return numA - numB;
        });

        setBusRoutes(formattedRoutes);
      } else {
        setBusRoutes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🗑️ REMOVE AN ALERT FROM FIREBASE
  const deleteSOS = async (alertId) => {
    const confirmDelete = window.confirm("Are you sure you want to clear this emergency alert?");
    if (!confirmDelete) return;
    try {
      const alertRef = ref(db, `sos_alerts/${alertId}`);
      await remove(alertRef);
      alert("✅ SOS Alert cleared successfully.");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to clear the alert.");
    }
  };

  // AUTO DELETE LOST ITEMS AFTER 24 HOURS
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

  // LOST & FOUND ACTIONS
  const addItem = () => {
    if (!desc || !area || !contact) {
      alert("Fill all fields");
      return;
    }
    const createAndSaveItem = (imgResult = null) => {
      const newItem = {
        id: Date.now(),
        desc,
        area,
        contact,
        image: imgResult,
        status: "Not Received",
        receivedTime: null
      };
      const updated = [newItem, ...lostItems];
      setLostItems(updated);
      saveLostItems(updated);
      setDesc("");
      setArea("");
      setContact("");
      setFile(null);
    };

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => createAndSaveItem(reader.result);
      reader.readAsDataURL(file);
    } else {
      createAndSaveItem();
    }
  };

  const toggleReceived = (id) => {
    const updated = lostItems.map((item) => {
      if (item.id === id) {
        return item.status !== "Received"
          ? { ...item, status: "Received", receivedTime: Date.now() }
          : { ...item, status: "Not Received", receivedTime: null };
      }
      return item;
    });
    setLostItems(updated);
    saveLostItems(updated);
  };

  const uploadCampusMap = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      localStorage.setItem("campusMap", reader.result);
      setCampusMap(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ➕ HANDLER TO WRITE DIRECTLY TO FIREBASE
  const handleAddBusRoute = async () => {
    if (!newRoute.routeNo || !newRoute.driverName || !newRoute.driverNo || !newRoute.routePath || !newRoute.destination) {
      alert("Fill all fields");
      return;
    }

    const paddedNo = String(newRoute.routeNo).padStart(2, "0");
    const routeKey = `route_${paddedNo}`;

    try {
      const targetRef = ref(db, `bus_routes/${routeKey}`);
      await set(targetRef, {
        routeNo: paddedNo,
        driverName: newRoute.driverName,
        driverNo: newRoute.driverNo,
        routePath: newRoute.routePath,
        destination: newRoute.destination,
        occupiedSeats: 0,
        totalSeats: 40,
        lastUpdated: Date.now()
      });

      alert("Bus Route Added Successfully!");
      setNewRoute({ routeNo: "", driverName: "", driverNo: "", routePath: "", destination: "" });
    } catch (err) {
      console.error(err);
      alert("Database write error.");
    }
  };

  // 🗑️ HANDLER TO REMOVE FROM FIREBASE
  const handleDeleteBusRoute = async (routeId) => {
    if (!window.confirm("Delete this route from database?")) return;
    try {
      const targetRef = ref(db, `bus_routes/${routeId}`);
      await remove(targetRef);
      alert("Route removed successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete route.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f0f1a] text-white">
      {/* SIDEBAR */}
      <div className="w-72 bg-[#18182a] p-6 border-r border-violet-900 flex flex-col">
        <h1 className="text-3xl font-bold text-violet-300 mb-10">🚌 Admin Panel</h1>
        <div className="space-y-3 flex-1">
          <button onClick={() => setActivePage("dashboard")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "dashboard" ? "bg-violet-800" : ""}`}>📊 Dashboard</button>
          <button onClick={() => setActivePage("tracking")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "tracking" ? "bg-violet-800" : ""}`}>📍 Live Tracking</button>
          <button onClick={() => setActivePage("buses")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "buses" ? "bg-violet-800" : ""}`}>🚌 Bus Management</button>
          <button onClick={() => setActivePage("alerts")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "alerts" ? "bg-violet-800" : ""}`}>🚨 Alerts/Notification</button>
          <button onClick={() => setActivePage("lost")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "lost" ? "bg-violet-800" : ""}`}>📦 Lost & Found</button>
          <button onClick={() => setActivePage("campusmap")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "campusmap" ? "bg-violet-800" : ""}`}>🗺 Campus Map</button>
          <button onClick={() => setActivePage("routes")} className={`w-full text-left p-3 rounded-xl hover:bg-violet-700 ${activePage === "routes" ? "bg-violet-800" : ""}`}>🛣 Bus Routes</button>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT CONTAINER */}
      <div className="flex-1 p-8 overflow-auto">
        
        {/* DASHBOARD PAGE CONTAINER */}
        {activePage === "dashboard" && (
          <div>
            <h1 className="text-4xl text-violet-300 mb-8">📊 Admin Dashboard</h1>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#18182a] p-6 rounded-2xl">
                <h2>Total Buses</h2>
                <p className="text-4xl text-violet-400 font-bold">{busRoutes.length}</p>
              </div>
              <div className="bg-[#18182a] p-6 rounded-2xl">
                <h2>Active Routes</h2>
                <p className="text-4xl text-violet-400 font-bold">{busRoutes.length}</p>
              </div>
              <div className="bg-[#18182a] p-6 rounded-2xl">
                <h2>SOS Active Alerts</h2>
                <p className={`text-4xl font-bold ${sosAlerts.length > 0 ? "text-red-500 animate-pulse" : "text-green-400"}`}>
                  {sosAlerts.length}
                </p>
              </div>
            </div>

            <div className="bg-red-950/40 border border-red-900 p-6 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 text-red-400 flex items-center gap-2">
                🚨 Active Emergency Alerts ({sosAlerts.length})
              </h2> 
              {sosAlerts.length === 0 ? (
                <p className="text-gray-400 italic">No active system emergencies reported.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {sosAlerts.map((alert) => (
                    <div key={alert.id} className="bg-[#18182a] p-5 border-l-4 border-red-500 rounded-xl flex justify-between items-center shadow-md">
                      <div>
                        <p className="text-lg font-bold text-white mb-1">🧑‍🎓 {alert.studentName}</p>
                        <p className="text-sm text-gray-400">📧 {alert.studentEmail}</p>
                        <div className="mt-3 p-2 bg-red-900/30 text-red-300 rounded text-sm font-semibold tracking-wide">
                          {alert.message}
                        </div>
                        <p className="text-xs text-gray-500 mt-3">🕒 {alert.time}</p>
                      </div>
                      <button onClick={() => deleteSOS(alert.id)} className="bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-400 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition duration-200 ml-4 h-fit">
                        🗑️ Clear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === "tracking" && <AdminTracking />}

        {/* BUS MANAGEMENT MODULE */}
        {activePage === "buses" && (
          <div>
            <h1 className="text-4xl text-violet-300 mb-8">🚌 Bus Management</h1>
            <div className="bg-[#18182a] p-6 rounded-2xl max-w-xl mb-8">
              <input
                type="text"
                placeholder="Enter Route Number (eg: 01,02,...)"
                className="w-full p-4 rounded-xl bg-[#0f0f1a] text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
                value={routeNo}
                onChange={(e) => setRouteNo(e.target.value)}
              />
            </div>

            {busRoutes.filter((route) => String(route.routeNo) === String(routeNo).padStart(2, "0")).map((route) => (
              <div key={route.id} className="bg-[#18182a] p-6 rounded-2xl">
                <h2 className="text-3xl text-violet-300 mb-6">Route {route.routeNo} Details</h2>
                <div className="space-y-4 text-lg">
                  <p>👨 Driver: {route.driverName}</p>
                  <p>📞 Contact: {route.driverNo}</p>
                  <p>📍 Route: {route.routePath}</p>
                  <p>🎯 Destination: {route.destination}</p>
                </div>
              </div>
            ))}

            {routeNo && busRoutes.filter((route) => String(route.routeNo) === String(routeNo).padStart(2, "0")).length === 0 && (
              <div className="bg-red-900/50 border border-red-700 p-6 rounded-2xl text-white">❌ No Route Found</div>
            )}
          </div>
        )}

        {/* ALERTS PANEL */}
        {activePage === "alerts" && (
          <div>
            <h1 className="text-4xl font-bold text-red-400 mb-6 flex items-center gap-3">🚨 Emergency SOS Console</h1>
            <div className="space-y-4 max-w-4xl">
              {sosAlerts.map((alert) => (
                <div key={alert.id} className="p-6 rounded-2xl bg-[#18182a] border border-red-900/30 flex justify-between items-center hover:border-red-600/60 transition-all duration-300 shadow-xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-red-200 capitalize tracking-wide">Alert from {alert.studentName}</h3>
                      <span className="bg-red-600/20 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-500/30 animate-pulse tracking-wide">{alert.message}</span>
                    </div>
                    <div className="flex flex-col text-sm text-gray-300">
                      <p><span className="text-violet-400 font-medium">Email Address:</span> {alert.studentEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">🕒 Timestamp Logged: {alert.time}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteSOS(alert.id)} className="bg-red-600/10 border border-red-600/30 hover:bg-red-600 text-red-400 hover:text-white px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                    🗑️ Clear Alert
                  </button>
                </div>
              ))}
              {sosAlerts.length === 0 && (
                <div className="text-center p-16 bg-[#18182a] rounded-2xl border border-gray-900 shadow-inner">
                  <div className="text-5xl mb-4">🛡️</div>
                  <h3 className="text-xl font-bold text-gray-300">System Safe / All Clear</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">There are no dynamic emergency distress alerts incoming at this time.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOST & FOUND */}
        {activePage === "lost" && (
          <div>
            <h1 className="text-3xl text-violet-300 mb-6">Lost & Found</h1>
            <div className="bg-[#18182a] p-6 rounded-2xl max-w-xl mb-8 space-y-4">
              <input type="file" className="block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-900 file:text-white hover:file:bg-violet-800" onChange={(e) => setFile(e.target.files[0])} />
              <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Item Name" className="w-full p-3 rounded-xl bg-[#0f0f1a]" />
              <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Lost Area" className="w-full p-3 rounded-xl bg-[#0f0f1a]" />
              <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Contact Number" className="w-full p-3 rounded-xl bg-[#0f0f1a]" />
              <button onClick={addItem} className="w-full bg-violet-700 hover:bg-violet-800 p-3 rounded-xl font-bold transition">Upload Item</button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {lostItems.map((item) => (
                <div key={item.id} className="bg-[#18182a] p-4 rounded-2xl shadow-md">
                  {item.image && <img src={item.image} alt={item.desc} className="w-full h-40 object-cover rounded-xl mb-3" />}
                  <p className="text-violet-300 font-bold text-lg">{item.desc}</p>
                  <p className="mt-2 text-sm text-gray-300">📍 {item.area}</p>
                  <p className="text-sm text-gray-300">📞 {item.contact}</p>
                  <p className={`mt-3 font-bold ${item.status === "Received" ? "text-green-400" : "text-red-400"}`}>{item.status}</p>
                  <button onClick={() => toggleReceived(item.id)} className="mt-4 w-full bg-violet-700 hover:bg-violet-800 p-3 rounded-xl text-sm font-semibold transition">
                    {item.status === "Received" ? "Mark as Not Received" : "Confirm Received"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMPUS MAP */}
        {activePage === "campusmap" && (
          <div>
            <h1 className="text-4xl text-violet-300 mb-8">🗺 Campus Map Upload</h1>
            <div className="bg-[#18182a] p-6 rounded-2xl max-w-2xl mb-8">
              <input type="file" accept="image/*" onChange={uploadCampusMap} />
            </div>
            {campusMap && (
              <div className="bg-[#18182a] p-6 rounded-2xl">
                <img src={campusMap} alt="Campus Map" className="w-full max-h-[500px] object-contain rounded-2xl mb-6" />
                <button onClick={() => { localStorage.removeItem("campusMap"); setCampusMap(null); alert("Campus Map Deleted"); }} className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition">🗑 Delete Campus Map</button>
              </div>
            )}
          </div>
        )}

        {/* ROUTE CREATION SCHEDULER */}
        {activePage === "routes" && (
          <div>
            <h1 className="text-4xl text-violet-300 mb-8">🛣 Bus Routes</h1>
            <div className="bg-[#18182a] p-6 rounded-2xl max-w-4xl mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" placeholder="Route Number" value={newRoute.routeNo || ""} onChange={(e) => setNewRoute({ ...newRoute, routeNo: e.target.value })} className="p-4 rounded-xl bg-[#0f0f1a]" />
                <input type="text" placeholder="Driver Name" value={newRoute.driverName || ""} onChange={(e) => setNewRoute({ ...newRoute, driverName: e.target.value })} className="p-4 rounded-xl bg-[#0f0f1a]" />
                <input type="text" placeholder="Driver Number" value={newRoute.driverNo || ""} onChange={(e) => setNewRoute({ ...newRoute, driverNo: e.target.value })} className="p-4 rounded-xl bg-[#0f0f1a]" />
                <input type="text" placeholder="Route stops" value={newRoute.routePath || ""} onChange={(e) => setNewRoute({ ...newRoute, routePath: e.target.value })} className="p-4 rounded-xl bg-[#0f0f1a]" />
                <input type="text" placeholder="Destination" value={newRoute.destination || ""} onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })} className="p-4 rounded-xl bg-[#0f0f1a]" />
              </div>
              <button onClick={handleAddBusRoute} className="mt-6 bg-violet-700 hover:bg-violet-800 px-6 py-3 rounded-xl font-bold transition">
                ➕ Add Bus Route
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {busRoutes.map((route) => (
                <div key={route.id} className="bg-[#18182a] p-6 rounded-2xl shadow-md">
                  <h2 className="text-2xl text-violet-300 font-bold mb-4">🛣 Route {route.routeNo}</h2>
                  <div className="space-y-3 text-gray-300 text-sm">
                    <p>👨 Driver Name: {route.driverName}</p>
                    <p>📞 Driver Number: {route.driverNo}</p>
                    <p>📍 Route Path: {route.routePath}</p>
                    <p>🎯 Destination: {route.destination}</p>
                  </div>
                  <button onClick={() => handleDeleteBusRoute(route.id)} className="mt-6 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl text-sm transition">
                    🗑 Delete Route
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}