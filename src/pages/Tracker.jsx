import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import supabase from "../supabaseClient";

const containerStyle = { width: "100%", height: "100%" };

// Default center (Metro Manila)
const defaultCenter = { lat: 14.5547, lng: 121.0244 };

// NOTE: You must get your own API key from Google Cloud Console
// See: https://developers.google.com/maps/documentation/javascript/get-api-key
const GOOGLE_MAPS_API_KEY = "AIzaSyBonV-RwTThHlF8VDMspatXdQaU7eWwr1Q";

export default function Tracker() {
  const { id: busId } = useParams(); // 1. Get Bus ID from URL
  const [busDetails, setBusDetails] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState("Loading bus details...");
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Effect 1: Get the user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error("User geolocation error:", err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Effect 2: Fetch static bus details and its last known location
  useEffect(() => {
    if (!busId) return;

    const fetchBusData = async () => {
      // 2. Fetch static bus details
      const { data: details, error: detailsError } = await supabase
        .from("bus")
        .select("company, plate_no, has_ac, capacity, destination")
        .eq("id", busId)
        .single();

      if (detailsError || !details) {
        console.error(detailsError);
        setStatus("Error: Could not find bus.");
        return;
      }
      setBusDetails(details);

      // 3. Get the bus's last known location on load
      const { data: location, error: locationError } = await supabase
        .from("bus_live_location")
        .select("latitude, longitude")
        .eq("bus_id", busId)
        .single();

      if (location && !locationError) {
        const pos = { lat: location.latitude, lng: location.longitude };
        setBusLocation(pos);
        setMapCenter(pos); // Center map on the bus
        setStatus("Tracking bus...");
      } else {
        setStatus("Bus is not currently broadcasting its location.");
      }
    };

    fetchBusData();
  }, [busId]);

  // Effect 3: Subscribe to REALTIME location updates for this bus
  useEffect(() => {
    if (!busId) return;

    setStatus("Connecting to live feed...");

    const channel = supabase
      .channel(`bus-location-${busId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to INSERT or UPDATE
          schema: "public",
          table: "bus_live_location",
          filter: `bus_id=eq.${busId}`,
        },
        (payload) => {
          console.log("Live location update received!", payload);
          const { latitude, longitude } = payload.new;
          const newPos = { lat: latitude, lng: longitude };
          setBusLocation(newPos);
          setMapCenter(newPos); // Re-center map on bus
          setStatus("Live");
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Connected to live bus feed!");
          setStatus("Live");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime error:", err);
          setStatus("Live feed connection error.");
        }
      });

    // Cleanup: Remove the channel subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [busId]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Panel - Bus Info */}
      <div className="w-full md:w-1/3 p-6 bg-gray-50 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4">
          <h2 className="text-2xl font-bold border-b pb-2">Bus Tracker</h2>

          {/* Status Indicator */}
          <div className="p-4 rounded-lg bg-gray-100">
            <span className="font-semibold text-gray-600">Status: </span>
            <span
              className={`font-bold ${
                status === "Live" ? "text-green-600" : "text-yellow-600"
              }`}
            >
              {status}
            </span>
          </div>

          {busDetails ? (
            <>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Plate Number:</span>
                <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                  {busDetails.plate_no}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Company:</span>
                <span>{busDetails.company}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Destination:</span>
                <span>{busDetails.destination}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Type:</span>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                    busDetails.has_ac
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {busDetails.has_ac ? "Aircon" : "Ordinary"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Capacity:</span>
                <span>{busDetails.capacity || "N/A"}</span>
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

      {/* Right Panel - Google Map */}
      <div className="w-full md:w-2/3 h-64 md:h-full">
        {/*
          SECURITY WARNING:
          Your API key is visible in the client-side code.
          You MUST restrict it in your Google Cloud Console:
          1. Go to Credentials -> Your API Key
          2. Under "Application restrictions", select "HTTP referrers"
          3. Add your website's domain (e.g., your-vercel-app.vercel.app)
        */}
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
          >
            {/* 4. Show Both Markers */}

            {/* Marker for the Bus */}
            {busLocation && (
              <Marker
                position={busLocation}
                title="Bus Location"
                icon={{
                  url: "https://maps.google.com/mapfiles/kml/shapes/bus.png", // Bus icon
                  scaledSize: new window.google.maps.Size(40, 40),
                }}
              />
            )}
            {/* Marker for the User */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="You are here"
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: "#4285F4", // Blue dot
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "white",
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}

