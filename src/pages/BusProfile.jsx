import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient"; // Corrected import

// --- Component ---
export default function BusProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [status, setStatus] = useState("Loading...");

  // State for text area inputs for ETA JSON data
  const [waypointsInput, setWaypointsInput] = useState("[]");
  const [stopsInput, setStopsInput] = useState("[]");

  // State for adding intermediate stop names
  const [intermediateStopInput, setIntermediateStopInput] = useState("");

  // State for Delete Confirmation
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  // --- Fetch Bus Data Effect ---
  useEffect(() => {
    const fetchBus = async () => {
      setStatus("Loading bus details...");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("Not logged in.");
        navigate("/login");
        return;
      }

      // --- 1. Select the new route fields ---
      const { data, error } = await supabase
        .from("bus")
        .select(
          "id, company, plate_no, capacity, has_ac, active, destination, intermediate_stops, route_waypoints, stops_indices"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setStatus("Bus not found or access denied.");
        console.error("Fetch error:", error);
      } else {
        console.log("Fetched Bus Data:", data);
        setBus({
          ...data,
          intermediate_stops: data.intermediate_stops
            ? data.intermediate_stops.split(",").map(s => s.trim())
            : [],
        });
        
        // --- 2. Populate text areas with data from database ---
        // Use JSON.stringify to format the array data for the text area
        setWaypointsInput(JSON.stringify(data.route_waypoints || [], null, 2));
        setStopsInput(JSON.stringify(data.stops_indices || [], null, 2));

        setStatus(""); // Clear loading status
      }
    };
    fetchBus();
  }, [id, navigate]);

  // Handler for basic bus details (text inputs, checkboxes)
  const handleBasicChange = (e) => {
    const { name, type, checked, value } = e.target;
    setBus((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // --- Intermediate Stop Name Handlers ---
  const handleAddIntermediateStop = () => {
    if (!bus || intermediateStopInput.trim() === "") return;
    setBus((prev) => {
      const currentStops = prev.intermediate_stops || [];
      if (currentStops.includes(intermediateStopInput.trim())) {
        setStatus("Stop name already exists.");
        setTimeout(() => setStatus(""), 2000);
        return prev;
      }
      return {
        ...prev,
        intermediate_stops: [...currentStops, intermediateStopInput.trim()],
      };
    });
    setIntermediateStopInput(""); // Clear input
  };

  const handleRemoveIntermediateStop = (indexToRemove) => {
    if (!bus) return;
    setBus((prev) => ({
      ...prev,
      intermediate_stops: (prev.intermediate_stops || []).filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  // --- Save Handler ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!bus) {
      setStatus("Cannot save, bus data not loaded.");
      return;
    }

    setStatus("Saving...");

    let waypointsData, stopsData;

    // --- 3. Parse ETA data from text areas before saving ---
    try {
      waypointsData = JSON.parse(waypointsInput);
      stopsData = JSON.parse(stopsInput);
      // Basic validation
      if (!Array.isArray(waypointsData) || !Array.isArray(stopsData)) {
        throw new Error("Input must be a valid JSON array.");
      }
    } catch (err) {
      console.error("JSON Parse Error:", err);
      setStatus(`Error: Invalid JSON in ETA fields. ${err.message}`);
      setTimeout(() => setStatus(""), 4000);
      return; // Stop save
    }

    // Prepare the final data object to be sent to Supabase
    const { id: busId, ...basicData } = bus;
    const updateData = {
      ...basicData,
      route_waypoints: waypointsData,
      stops_indices: stopsData,
      intermediate_stops: (bus.intermediate_stops || []).join(", "),
    };
    
    console.log("Attempting to save:", updateData);

    const { error } = await supabase
      .from("bus")
      .update(updateData) // Send the complete object
      .eq("id", busId);

    if (error) {
      console.error("Save Error:", error);
      setStatus(`Error saving: ${error.message}`);
    } else {
      console.log("Save successful!");
      setStatus("Saved successfully!");
    }
    setTimeout(() => setStatus(""), 3000);
  };

  // --- Delete Handler ---
  const handleDelete = async () => {
    if (deleteConfirmInput !== "DELETE") {
      setStatus("Type DELETE in the box below to confirm.");
      return;
    }
    setStatus("Deleting...");
    const { error } = await supabase.from("bus").delete().eq("id", id);
    if (error) {
      setStatus(`Error deleting: ${error.message}`);
    } else {
      setStatus("Deleted! Redirecting...");
      setTimeout(() => navigate("/driver-dashboard"), 1500);
    }
  };

  // --- Render Logic ---
  if (status.startsWith("Loading") && !bus)
    return <div className="loading-fullscreen">Loading Bus Details...</div>;
  if (!bus && !status.startsWith("Loading"))
    return (
      <div className="error-fullscreen">
        {status || "Bus not found."}{" "}
        <button onClick={() => navigate("/driver-dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  if (!bus) return <div className="loading-fullscreen">Initializing...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Bus Info</h1>

      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-6"
      >
        {/* --- Bus Details Section --- */}
        <section>
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">
            Bus Details
          </h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            name="company"
            placeholder="Company Name"
            defaultValue={bus.company || ""}
            onChange={handleBasicChange}
            className="border p-2 rounded-md mb-2 w-full"
          />
          {/* ... other inputs: plate_no, capacity ... */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
          <input type="text" name="plate_no" placeholder="Plate Number" defaultValue={bus.plate_no || ""} onChange={handleBasicChange} className="border p-2 rounded-md mb-2 w-full"/>

          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
          <input type="number" name="capacity" placeholder="e.g., 50" defaultValue={bus.capacity || ""} onChange={handleBasicChange} className="border p-2 rounded-md mb-2 w-full"/>

          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              name="has_ac"
              defaultChecked={bus.has_ac || false}
              onChange={handleBasicChange}
            />
            Has Air Conditioning
          </label>
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              name="active"
              defaultChecked={bus.active || false}
              onChange={handleBasicChange}
            />
            Active Bus (Visible to Commuters)
          </label>
        </section>

        {/* --- Destination & Intermediate Stops Section --- */}
        <section className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">
            Route Information (for Search)
          </h3>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Final Destination (Display Name)
          </label>
          <input
            type="text"
            name="destination"
            placeholder="e.g., Alabang Starmall"
            defaultValue={bus.destination || ""}
            onChange={handleBasicChange}
            className="border p-2 rounded-md w-full mb-4"
          />

          {/* --- Intermediate Stops UI --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intermediate Stop Names
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Enter major stops commuters might search for. Add one by one.
            </p>
            <div className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={intermediateStopInput}
                onChange={(e) => setIntermediateStopInput(e.target.value)}
                placeholder="e.g., Magallanes Interchange"
                className="border p-2 rounded-md flex-grow"
              />
              <button
                type="button"
                onClick={handleAddIntermediateStop}
                className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 shrink-0 text-sm"
              >
                Add Stop Name
              </button>
            </div>
            {/* List of intermediate stops */}
            <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2 bg-gray-50">
              {(bus.intermediate_stops || []).length === 0 && (
                <p className="text-xs text-gray-500 italic p-2">
                  No intermediate stop names added yet.
                </p>
              )}
              {(bus.intermediate_stops || []).map((stop, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white p-2 rounded border text-sm"
                >
                  <span>{stop}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIntermediateStop(index)}
                    className="text-red-500 hover:text-red-700 font-semibold text-xs px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- 4. NEW ETA CONFIGURATION SECTION --- */}
        <section className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3">
            ETA Route Configuration
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            Paste the JSON array data for the route. Get this from a tool like
            Google Maps Polyline Encoder.
          </p>

          {/* Route Waypoints Text Area */}
          <label
            htmlFor="waypoints"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Route Waypoints (JSON Array)
          </label>
          <textarea
            id="waypoints"
            value={waypointsInput}
            onChange={(e) => setWaypointsInput(e.target.value)}
            className="w-full h-24 p-2 border rounded-md font-mono text-xs"
            placeholder='[{"lat": 14.55, "lng": 121.02}, ...]'
          />

          {/* Stops Indices Text Area */}
          <label
            htmlFor="stops"
            className="block text-sm font-medium text-gray-700 mb-1 mt-3"
          >
            Stop Indices (JSON Array)
          </label>
          <textarea
            id="stops"
            value={stopsInput}
            onChange={(e) => setStopsInput(e.target.value)}
            className="w-full h-16 p-2 border rounded-md font-mono text-xs"
            placeholder="[5, 12, 20, ...]"
          />
        </section>
        {/* --- END OF NEW SECTION --- */}


        {/* --- Save Button & Status --- */}
        {status &&
          !status.startsWith("Saving") &&
          !status.startsWith("Deleting") &&
          !status.startsWith("Deleted") && (
            <p className="mt-2 text-center text-sm font-medium text-gray-700">
              {status}
            </p>
          )}
        {status &&
          (status.startsWith("Saving") ||
            status.startsWith("Error") || // Catch all errors
            status.startsWith("Saved successfully")) && (
            <p
              className={`mt-2 text-center text-sm font-medium ${
                status.includes("Error") ? "text-red-600" : "text-green-600"
              }`}
            >
              {status}
            </p>
          )}
        <button
          type="submit"
          disabled={status.startsWith("Saving")}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md mt-4 disabled:opacity-50"
        >
          {status.startsWith("Saving") ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* --- Delete Section --- */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mt-4 border border-red-200">
        <h3 className="text-lg font-semibold mb-2 text-red-700">Danger Zone</h3>
        <p className="text-sm text-gray-600 mb-3">
          Deleting this bus is permanent.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <input
            type="text"
            placeholder="Type DELETE to confirm"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            className={`border p-2 rounded-md flex-grow w-full sm:w-auto ${
              deleteConfirmInput === "DELETE"
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteConfirmInput !== "DELETE"}
            className={`w-full sm:w-auto bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition ${
              deleteConfirmInput === "DELETE"
                ? "opacity-100 hover:bg-red-700"
                : "opacity-50 cursor-not-allowed"
            }`}
          >
            Delete Bus
          </button>
        </div>
        {(status.toLowerCase().includes("delet") ||
          status.includes("Type DELETE")) &&
          !status.includes("successfully") && (
            <p className="mt-2 text-sm text-red-600">{status}</p>
          )}
        {status.startsWith("Deleted! Redirecting...") && (
          <p className="mt-2 text-sm text-green-600">{status}</p>
        )}
      </div>

      {/* --- Back Button --- */}
      <button
        type="button"
        onClick={() => navigate("/driver-dashboard")}
        className="mt-6 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}