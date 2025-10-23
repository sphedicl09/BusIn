// src/pages/Tracker.jsx
import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Mock bus info
const busInfo = {
  company: "City Bus Co.",
  plate: "ABC-1234",
  availableSeats: 15,
  route: "Route 42",
};

<<<<<<< HEAD
const containerStyle = { width: "100%", height: "100%" };

=======
// Map container style
const containerStyle = { width: "100%", height: "100%" };

// Default center (Manila)
>>>>>>> 491f80ccb812713c2bd2cdb8c1f3615c5ecfda76
const defaultCenter = { lat: 14.5547, lng: 121.0244 };

export default function Tracker() {
  const [position, setPosition] = useState(defaultCenter);

  // Get live location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      alert("Your browser/device does not support geolocation.");
    }
  }, []);

  return (
    <div className="flex h-screen w-full">
      {/* Left Panel */}
      <div className="w-1/3 p-6 bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-bold border-b pb-2">Bus Info</h2>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Company:</span>
            <span>{busInfo.company}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Plate Number:</span>
            <span>{busInfo.plate}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Available Seats:</span>
            <span>{busInfo.availableSeats}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold">Route:</span>
            <span>{busInfo.route}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Google Map */}
      <div className="w-2/3">
        <LoadScript googleMapsApiKey="AIzaSyBonV-RwTThHlF8VDMspatXdQaU7eWwr1Q">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={15}
          >
            <Marker position={position} title="You are here" />
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
