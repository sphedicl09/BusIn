import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import supabase from "../supabaseClient";
import BusETA from "../components/BusETA";

const containerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 14.5547, lng: 121.0244 }; // Metro Manila
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const getFullnessStatus = (count, capacity) => {
  if (count === null || capacity === null || capacity === 0) {
    return { text: "N/A", color: "text-gray-600", bg: "bg-gray-100" };
  }
  const percentage = (count / capacity) * 100;
  if (percentage < 30) {
    return { text: "Spacious", color: "text-green-800", bg: "bg-green-100" };
  }
  if (percentage < 70) {
    return { text: "Getting Full", color: "text-yellow-800", bg: "bg-yellow-100" };
  }
  return { text: "Full / Standing", color: "text-red-800", bg: "bg-red-100" };
};


export default function Tracker() {
  const { id: busId } = useParams();
  const [busDetails, setBusDetails] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [status, setStatus] = useState("Loading bus details...");
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [stopsIndices, setStopsIndices] = useState([]);
  const [passengerCount, setPassengerCount] = useState(null);

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

  useEffect(() => {
    if (!busId) return;

    const fetchBusData = async () => {
      const { data: details, error: detailsError } = await supabase
        .from("bus")
        .select(
          "company, plate_no, has_ac, capacity, destination, route_waypoints, stops_indices"
        )
        .eq("id", busId)
        .single();

      if (detailsError || !details) {
        console.error(detailsError);
        setStatus("Error: Could not find bus.");
        return;
      }
      setBusDetails(details);
      setRouteWaypoints(details.route_waypoints || []);
      setStopsIndices(details.stops_indices || []);

      const { data: location, error: locationError } = await supabase
        .from("bus_live_location")
        .select("latitude, longitude, passenger_count") 
        .eq("bus_id", busId)
        .single();

      if (location && !locationError) {
        const pos = { lat: location.latitude, lng: location.longitude };
        setBusLocation(pos);
        setMapCenter(pos);
        setPassengerCount(location.passenger_count); 
        setStatus("Tracking bus...");
      } else {
        setStatus("Bus is not currently broadcasting its location.");
      }
    };

    fetchBusData();
  }, [busId]);

  useEffect(() => {
    if (!busId) return;

    setStatus("Connecting to live feed...");

    const channel = supabase
      .channel(`bus-location-${busId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bus_live_location",
          filter: `bus_id=eq.${busId}`,
        },
        (payload) => {
          console.log("Live update received!", payload);
          const { latitude, longitude, passenger_count } = payload.new;
          const newPos = { lat: latitude, lng: longitude };
          setBusLocation(newPos);
          setPassengerCount(passenger_count); 
          setStatus("Live");
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          if (!busLocation) {
            setStatus("Live feed connected. Waiting for location...");
          } else {
            setStatus("Live");
          }
        }
        if (status === "CHANNEL_ERROR") {
          console.error("Realtime error:", err);
          setStatus("Live feed connection error.");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [busId, busLocation]);

  const fullness = getFullnessStatus(passengerCount, busDetails?.capacity);

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

          {/* --- 8. Show Passenger Count & Fullness --- */}
          {busDetails && (
            <div className={`p-4 rounded-lg ${fullness.bg}`}>
                <div className="flex justify-between items-center">
                    <span className={`font-semibold ${fullness.color}`}>Bus Fullness:</span>
                    <span className={`font-bold text-lg ${fullness.color}`}>
                        {fullness.text}
                    </span>
                </div>
                <p className={`text-sm ${fullness.color} mt-1`}>
                    Est. Passengers: {passengerCount ?? 'N/A'} / {busDetails.capacity ?? 'N/A'}
                </p>
            </div>
          )}


          {/* ETA Component */}
          {busLocation && routeWaypoints.length > 0 && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <span className="font-semibold text-blue-800">
                Estimated Time to Destination:{" "}
              </span>
              <span className="font-bold text-blue-800 text-lg">
                <BusETA
                  busPos={busLocation}
                  routeWaypoints={routeWaypoints}
                  options={{ stopsIndices: stopsIndices }}
                />
              </span>
            </div>
          )}

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
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>

      {/* Right Panel - Google Map */}
      <div className="w-full md:w-2/3 h-64 md:h-full">
        {!GOOGLE_MAPS_API_KEY ? (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <p className="text-red-600 font-semibold p-4 text-center">
              Google Maps API Key is missing.
              <br />
              Please add VITE_GOOGLE_MAPS_API_KEY to your .env file.
            </p>
          </div>
        ) : (
          <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={mapCenter}
              zoom={15}
            >
              {/* Bus Marker */}
              {busLocation && (
                <Marker
                  position={busLocation}
                  title="Bus Location"
                  icon={{
                    url: "https://maps.google.com/mapfiles/kml/shapes/bus.png",
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                />
              )}
              {/* User Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
                  title="You are here"
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#4285F4",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "white",
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        )}
      </div>
    </div>
  );
}
