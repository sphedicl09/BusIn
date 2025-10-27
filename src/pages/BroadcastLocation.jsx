import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

const ROBOFLOW_WORKFLOW_URL = "https://serverless.roboflow.com/ai-track-8odvi/workflows/detect-count-and-visualize";
const ROBOFLOW_API_KEY = "kvNfMxx0hez4eL3EWxt1";



const fetchWithBackoff = async (url, options, retries = 3, delay = 1000) => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, delay));
      return fetchWithBackoff(url, options, retries - 1, delay * 2);
    }
    console.error("Fetch failed after retries:", err);
    throw err;
  }
};

/**
 * @param {string} base64ImageData
 * @returns {Promise<number>}
 */
const getPassengerCount = async (base64ImageData) => {
  try {
    const payload = {
      api_key: ROBOFLOW_API_KEY,
      inputs: {
        image: {
          type: "base64",
          value: base64ImageData
        }
      }
    };

    const response = await fetchWithBackoff(ROBOFLOW_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Roboflow API response not OK:", response.status, await response.text());
      return 0;
    }

    const result = await response.json();

    if (result && result.outputs && result.outputs.length > 0) {
      const workflowResult = result.outputs[0];

      if (workflowResult.count_objects !== undefined) {
        console.log("Roboflow count:", workflowResult.count_objects);
        return workflowResult.count_objects;
      }
      
      if (workflowResult.predictions) {
        console.log("Roboflow count (from predictions):", workflowResult.predictions.length);
        return workflowResult.predictions.length;
      }

      console.warn("Roboflow `outputs[0]` did not contain 'count_objects' or 'predictions'.", workflowResult);
      return 0;

    } else {
      console.warn("Roboflow response did not contain 'outputs' array.", result);
      return 0;
    }

  } catch (error) {
    console.error("Error calling Roboflow API:", error);
    return 0;
  }
};



export default function BroadcastLocation() {
  const { id: busId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing...");
  const [currentPosition, setCurrentPosition] = useState(null);
  const [busDetails, setBusDetails] = useState(null);
  const [passengerCount, setPassengerCount] = useState(0);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const updateIntervalRef = useRef(null);

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

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Camera permission denied or not found. Passenger counting is disabled.");
        setStatus("Live (Camera Disabled)");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!busId) return;

    setStatus("Waiting for location permission...");
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        if (!cameraError) {
          setStatus("Live - Broadcasting location & analyzing passengers...");
        } else {
          setStatus("Live - Broadcasting location (Camera Disabled)...");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setStatus(`Geolocation error: ${err.message}. Please enable location services.`);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [busId, cameraError]);

  useEffect(() => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(async () => {
      if (!currentPosition) {
        console.log("Skipping update: No position yet.");
        return;
      }
      
      let count = passengerCount;

      if (videoRef.current && videoRef.current.readyState >= 3 && canvasRef.current && !cameraError) {
        try {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const base64ImageData = canvas.toDataURL("image/jpeg", 0.7).split(',')[1];
          
          count = await getPassengerCount(base64ImageData);
          setPassengerCount(count);
        } catch (err) {
            console.error("Failed to capture or analyze frame:", err);
        }
      }

      const { error } = await supabase
        .from("bus_live_location")
        .upsert({
          bus_id: busId,
          latitude: currentPosition.lat,
          longitude: currentPosition.lng,
          updated_at: new Date().toISOString(),
          passenger_count: count,
        });

      if (error) {
        console.error("Error updating location/count:", error.message);
        setStatus(`Error: ${error.message}`);
      }

    }, 5000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [busId, currentPosition, cameraError, passengerCount]);


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg text-center">
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

        {/* Camera Feed */}
        <div className="bg-gray-900 rounded-lg mb-4 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto"
          />
          {cameraError && (
            <div className="p-4 text-center text-red-400 bg-gray-80Opening">
                {cameraError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Status Box */}
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-500">STATUS</p>
            <p className={`text-lg font-semibold ${status.includes("Error") ? 'text-red-600' : 'text-green-700'}`}>
              {status}
            </p>
          </div>
          
          {/* Passenger Count Box */}
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p className="text-sm font-medium text-gray-500">PASSENGER COUNT</p>
            <p className={`text-lg font-semibold ${cameraError ? 'text-gray-500' : 'text-blue-700'}`}>
              {cameraError ? 'Disabled' : `${passengerCount} (Live)`}
            </p>
          </div>
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

