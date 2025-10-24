import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function BusProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [stopInput, setStopInput] = useState("");

  useEffect(() => {
    const fetchBus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("Not logged in.");
        return;
      }
      const { data, error } = await supabase
        .from("bus")
        .select(
          "id, company, plate_no, capacity, has_ac, active, destination, intermediate_stops"
        )
        .eq("id", id)
        .single();

      if (error || !data) {
        setStatus("Bus not found or you do not have permission to view it.");
      } else {
        setBus({ ...data, intermediate_stops: data.intermediate_stops || [] });
        setStatus("");
      }
    };

    fetchBus();
  }, [id]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setBus((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  //Route Management Handlers
  const handleAddStop = () => {
    if (stopInput.trim() === "") return;
    setBus((prev) => ({
      ...prev,
      intermediate_stops: [...prev.intermediate_stops, stopInput.trim()],
    }));
    setStopInput("");
  };

  const handleRemoveStop = (indexToRemove) => {
    setBus((prev) => ({
      ...prev,
      intermediate_stops: prev.intermediate_stops.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };


  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("Saving...");

  
    const { id: busId, ...updateData } = bus;

    const { error } = await supabase
      .from("bus")
      .update(updateData)
      .eq("id", busId);

    setStatus(error ? `Error saving changes: ${error.message}` : "Saved successfully!");
  };

  const handleDelete = async () => {
    const userConfirmed = window.prompt("Type DELETE to confirm bus deletion") === "DELETE";
    if (!userConfirmed) {
        setStatus("Deletion cancelled.");
        return;
    }

    setStatus("Deleting...");
    const { error } = await supabase.from("bus").delete().eq("id", id);
    if (error) {
      setStatus("Error deleting bus.");
    } else {
      setStatus("Deleted successfully!");
      setTimeout(() => navigate("/driver-dashboard"), 1000);
    }
  };

  if (status && !bus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-700">{status}</p>
      </div>
    );
  }

  if (!bus) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Bus Info</h1>
      
      {/* Bus Details Form */}
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h3 className="text-lg font-semibold border-b pb-2">Bus Details</h3>
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={bus.company || ""}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <input
          type="text"
          name="plate_no"
          placeholder="Plate Number"
          value={bus.plate_no || ""}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={bus.capacity || ""}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="has_ac"
            checked={bus.has_ac || false}
            onChange={handleChange}
          />
          Has Air Conditioning
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            checked={bus.active || false}
            onChange={handleChange}
          />
          Active Bus
        </label>
        
        {/*Route Management UI*/}
        <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-2">Route / Destinations</h3>
            
            <label className="font-medium text-sm">Final Destination</label>
             <input
              type="text"
              name="destination"
              placeholder="Final Destination (e.g., Alabang Starmall)"
              value={bus.destination || ""}
              onChange={handleChange}
              className="border p-2 rounded-md w-full mb-4"
            />

            <label className="font-medium text-sm">Add Intermediate Stop</label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={stopInput}
                    onChange={(e) => setStopInput(e.target.value)}
                    placeholder="e.g., Magallanes"
                    className="border p-2 rounded-md flex-grow"
                />
                <button
                    type="button"
                    onClick={handleAddStop}
                    className="bg-blue-500 text-white px-3 rounded-md hover:bg-blue-600"
                >
                    Add
                </button>
            </div>

            {/* List of stops */}
            <div className="space-y-2">
                <label className="font-medium text-sm">Current Stops:</label>
                {bus.intermediate_stops.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No intermediate stops added.</p>
                )}
                {bus.intermediate_stops.map((stop, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                        <span>{stop}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveStop(index)}
                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
        </div>
        {/*End Route Management UI*/}

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md mt-4"
        >
          Save Changes
        </button>
      </form>

      <div className="flex justify-between w-full max-w-md mt-6">
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Delete Bus
        </button>

        <button
          onClick={() => navigate("/driver-dashboard")}
          className="text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>

      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
}
