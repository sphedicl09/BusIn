import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function DriverDashboard() {
  const [buses, setBuses] = useState([]);
  const [status, setStatus] = useState("Loading...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("You must be logged in as a driver.");
        return;
      }

    const { data: conductor, error: conductorError } = await supabase
      .from("conductor")
      .select("conductor_id")
      .eq("user_id", user.id)
      .single();

    if (conductorError || !conductor) {
        console.error("Error fetching conductor:", conductorError);
        setStatus("Please complete your driver profile.");
        return;
      }
 
      const { data: busesData, error } = await supabase
        .from("bus")
        .select("*")
        .eq("conductor_id", conductor.conductor_id);

      if (error) {
        console.error(error);
        setStatus("Error loading buses.");
      } else if (!busesData.length) {
        setStatus("No buses yet. Add one below!");
      } else {
        setBuses(busesData);
        setStatus("");
      }
    };

    fetchBuses();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      {status && <p className="text-gray-600 mb-4">{status}</p>}

      <button
        onClick={() => navigate("/driver-dashboard/add-bus")}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 mb-6"
      >
        + Add New Bus
      </button>

      {buses.length > 0 && (
        <div className="space-y-4">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="p-4 border rounded-lg flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{bus.plate_no}</p>
                <p className="text-sm text-gray-500">{bus.company}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/driver-dashboard/bus/${bus.id}`)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  View / Edit
                </button>
                <button
                  onClick={() =>
                    navigate(`/broadcast-location/${bus.id}`)
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Start Tracking
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
