import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function StudentTracking() {
  const [busNo, setBusNo] = useState("1");

  const busData = {
    1: { driver: "Ravi Kumar", contact: "9876543210" },
    2: { driver: "Arun", contact: "9123456780" },
    3: { driver: "Suresh", contact: "9988776655" },
    4: { driver: "Karthik", contact: "9000011111" },
  };

  const [destination, setDestination] = useState("");
  const [startLocation, setStartLocation] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [route, setRoute] = useState([]);
  const [busPosition, setBusPosition] = useState(null);

  const [distanceKm, setDistanceKm] = useState(null);
  const [eta, setEta] = useState(null);
  const [tracking, setTracking] = useState(false);

  const watchIdRef = useRef(null);

  // ICONS
  const startIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [40, 40],
  });

  const endIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [40, 40],
  });

  const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61168.png",
    iconSize: [40, 40],
  });

  // CHENNAI BOUNDS
  const chennaiBounds = [
    [12.85, 80.05],
    [13.30, 80.35]
  ];

  // REAL GPS TRACKING
  const startTracking = () => {
    setTracking(true);

    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setStartLocation(newPos);
        setBusPosition(newPos);
      },
      (err) => console.log(err),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  };

  // DESTINATION SEARCH
  const getDestination = async () => {
    if (!destination) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${destination}, Chennai`
    );
    const data = await res.json();

    if (data.length > 0) {
      setDestinationCoords([
        parseFloat(data[0].lat),
        parseFloat(data[0].lon)
      ]);
    }
  };

  // ROUTE FETCH
  useEffect(() => {
    const fetchRoute = async () => {
      if (!startLocation || !destinationCoords) return;

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLocation[1]},${startLocation[0]};` +
        `${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.routes?.length) return;

      const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      setRoute(coords);

      const distance = data.routes[0].distance / 1000;
      setDistanceKm(distance.toFixed(2));
      setEta(Math.round((distance / 25) * 60));
    };

    fetchRoute();
  }, [startLocation, destinationCoords]);

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white overflow-hidden">
      <div className="bg-[#18182a] p-6 text-center">
        <h1 className="text-4xl font-bold text-violet-300 mb-6">
          🚌 Bus Tracking System
        </h1>

        {/* 🟢 Copy and Paste this block to replace your hidden inputs */}
<select
  value={busNo}
  onChange={(e) => setBusNo(e.target.value)}
  className="bg-[#11152d] text-white border border-violet-700 p-3 rounded-xl mr-4 outline-none focus:border-purple-500 transition"
>
  <option value="1" className="bg-[#11152d] text-white">Bus 1</option>
  <option value="2" className="bg-[#11152d] text-white">Bus 2</option>
  <option value="3" className="bg-[#11152d] text-white">Bus 3</option>
  <option value="4" className="bg-[#11152d] text-white">Bus 4</option>
</select>

<input
  value={destination}
  onChange={(e) => setDestination(e.target.value)}
  placeholder="Enter Destination"
  className="bg-[#11152d] text-white placeholder-slate-400 border border-violet-700 p-3 rounded-xl mr-4 outline-none focus:border-purple-500 transition"
/>
        

        <button
          onClick={getDestination}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl mr-2 transition"
        >
          Set Destination
        </button>

        <button
          onClick={startTracking}
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-6 py-3 rounded-xl transition"
        >
          Start Tracking
        </button>

        <div className="mt-5 text-violet-200 space-y-1">
          <p>🚌 Bus No: <span className="font-semibold text-white">{busNo}</span></p>
          <p>👨‍✈ Driver: <span className="font-semibold text-white">{busData[busNo].driver}</span></p>
          <p>📞 Contact: <span className="font-semibold text-white">{busData[busNo].contact}</span></p>
          <p>
            Status: {" "}
            {tracking ? (
              <span className="text-emerald-400 font-bold">🟢 Tracking Active</span>
            ) : (
              <span className="text-slate-400">⚪ Not Tracking</span>
            )}
          </p>

          {distanceKm && (
            <p>📏 Distance: <span className="font-semibold text-white">{distanceKm} km</span></p>
          )}
          {eta && (
            <p>⏱ ETA: <span className="font-semibold text-white">{eta} mins</span></p>
          )}
        </div>
      </div>

      <div style={{ height: "75vh", width: "100%", overflow: "hidden" }}>
        <MapContainer
          center={[13.0827, 80.2707]}
          zoom={12}
          minZoom={11}
          maxZoom={18}
          maxBounds={chennaiBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          dragging={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
            bounds={chennaiBounds}
          />

          {startLocation && (
            <Marker position={startLocation} icon={startIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {destinationCoords && (
            <Marker position={destinationCoords} icon={endIcon}>
              <Popup>Destination</Popup>
            </Marker>
          )}

          {busPosition && (
            <Marker position={busPosition} icon={busIcon}>
              <Popup>Bus {busNo}</Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <Polyline
              positions={route}
              pathOptions={{
                color: "#a78bfa", // Styled polyline to match your violet system aesthetics
                weight: 5
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}