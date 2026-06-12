import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ---------------- FIX DEFAULT MARKER ---------------- */

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ---------------- CUSTOM ICONS ---------------- */

const sourceIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [35, 35],
});

const destIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [35, 35],
});

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [40, 40],
});

/* ---------------- COMPONENT ---------------- */

export default function MapComponent({
  route,
  fromCoords,
  toCoords,
}) {

  const [position, setPosition] = useState(null);

  /* ---------------- LIVE GPS TRACKING ---------------- */

  useEffect(() => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(

      (pos) => {

        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

      },

      (err) => {
        console.log(err);
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }

    );

    return () => navigator.geolocation.clearWatch(watchId);

  }, []);

  /* ---------------- MAP ---------------- */

  return (
    <MapContainer
      center={fromCoords || [13.0827, 80.2707]}
      zoom={13}
      scrollWheelZoom={true}
      dragging={true}
      doubleClickZoom={true}
      touchZoom={true}
      preferCanvas={true}
      style={{
        height: "80vh",
        width: "100%",
        borderRadius: "12px",
        cursor: "grab",
      }}
    >

      {/* MAP TILE */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* BLUE ROUTE LINE */}
      {route && route.length > 0 && (
        <Polyline
          positions={route}
          color="blue"
          weight={5}
        />
      )}

      {/* SOURCE MARKER */}
      {fromCoords && (
        <Marker
          position={fromCoords}
          icon={sourceIcon}
        >
          <Popup>📍 Source</Popup>
        </Marker>
      )}

      {/* DESTINATION MARKER */}
      {toCoords && (
        <Marker
          position={toCoords}
          icon={destIcon}
        >
          <Popup>🏁 Destination</Popup>
        </Marker>
      )}

      {/* LIVE BUS MARKER */}
      {position && (
        <Marker
          position={[position.lat, position.lng]}
          icon={busIcon}
        >
          <Popup>🚍 Live Bus Location</Popup>
        </Marker>
      )}

    </MapContainer>
  );
}