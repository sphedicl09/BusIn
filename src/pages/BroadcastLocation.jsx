import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function BroadcastLocation() {
  const { id: busId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing location...");
  const [currentPosition, setCurrentPosition] = useState(null);
  const [busDetails, setBusDetails] = useState(null);

  // 1. Fetch Bus Details
  useEffect(() => {
    const fetchBusDetails = async () => {
      const { data, error } = await supabase
        .from("bus")
        .select("plate_no, company")
        .eq("id", busId)
        .single();

      if (error || !data) {
        setStatus("Could not find bus details.");
        console.error(error);
      } else {
        setBusDetails(data);
      }
    };
    fetchBusDetails();
  }, [busId]);

  // 2. Start Broadcasting Location
  useEffect(() => {
    if (!busId) return;

    const options = {
      enableHighAccuracy: true,
      timeout: 5000, // 5 seconds
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        setStatus("Live - Broadcasting location...");

        // Send location to Supabase
        // FIX: Removed extra semicolon from async () =>
        const updateLocation = async () => {
          const { error } = await supabase
            .from("bus_live_location")
            .upsert({
              bus_id: busId,
              latitude: latitude,
              longitude: longitude,
              updated_at: new Date().toISOString(),
            });

          if (error) {
            console.error("Error updating location:", error.message);
            setStatus(`Error: ${error.message}`);
          }
        };

        updateLocation();
      },
      (err) => {
        console.error("Geolocation error:", err);
        setStatus(`Geolocation error: ${err.message}. Please enable location services.`);
      },
      options
    );

    // Cleanup function to stop watching when component unmounts
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [busId]); // Re-run if busId changes

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-emerald-600 mb-4">
          Broadcasting Live
        </h1>
        {busDetails ? (
          <>
            <p className="text-lg font-semibold">{busDetails.plate_no}</p>
            <p className="text-md text-gray-600 mb-6">{busDetails.company}</p>
          </>
        ) : (
          <p className="text-md text-gray-600 mb-6">Loading bus details...</p>
        )}

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium text-gray-500">STATUS</p>
          <p className="text-lg font-semibold text-green-700">{status}</p>
        </div>

        {currentPosition && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm font-medium text-gray-500">CURRENT LOCATION</p>
            <p className="text-md">Latitude: {currentPosition.lat.toFixed(6)}</p>
            <p className="text-md">Longitude: {currentPosition.lng.toFixed(6)}</p>
          </div>
        )}

        <button
          onClick={() => navigate("/driver-dashboard")}
          className="w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
        >
          Stop Broadcasting
        </button>
        <p className="text-xs text-gray-500 mt-4">
          Stopping will remove your bus from the live map for commuters.
        </p>
      </div>
    </div>
  );
}

