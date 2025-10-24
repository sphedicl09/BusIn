import { Link } from "react-router-dom";
import { FaMapMarkedAlt, FaBus, FaClock, FaSearch } from "react-icons/fa";
import { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [buses, setBuses] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchTerm.trim() === "") {
      setBuses([]);
      setSearchStatus("Please enter a destination or route.");
      return;
    }

    setSearchStatus("Searching for buses...");

    try {
      const { data, error } = await supabase
        .from("bus")
        .select("id, company, plate_no, destination, intermediate_stops, has_ac")
        .eq("active", true)
        .or(
          `destination.ilike.%${searchTerm}%,intermediate_stops.cs.{"${searchTerm}"}`
        );
  

      if (error) throw error;

      if (data && data.length > 0) {
        const sortedBuses = data.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));
        setBuses(sortedBuses);
        setSearchStatus("");
      } else {
        setBuses([]);
        setSearchStatus("No active buses found matching your search.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-gray-50 text-gray-800 pt-10 px-4">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <h1 className="text-5xl font-extrabold text-emerald-600 mb-3">BusIn</h1>
        <p className="text-lg text-gray-600 font-medium">
          Your smart companion for efficient city commuting.
        </p>
      </div>

      {/* Quick Search - NOW FUNCTIONAL */}
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-3xl mb-10">
        <h2 className="text-xl font-bold mb-4 text-center">Find Your Bus</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Destination or Stop (e.g., Alabang, Magallanes)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-400 outline-none w-full"
          />
          <button
            onClick={handleSearch}
            className="w-auto bg-emerald-500 text-white p-3 rounded-lg font-semibold hover:bg-emerald-600 transition-all flex items-center justify-center"
          >
            <FaSearch />
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="w-full max-w-3xl mb-10">
        {searchStatus && (
          <p className="text-center text-gray-600">{searchStatus}</p>
        )}
        <div className="space-y-4">
          {buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <p className="font-bold text-lg text-emerald-700">
                  {bus.plate_no}
                </p>
                <p className="font-medium text-gray-800">{bus.company}</p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Destination:</span>{" "}
                  {bus.destination}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      bus.has_ac
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {bus.has_ac ? "Aircon" : "Ordinary"}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/track-bus/${bus.id}`)} // Will be implemented in Task 4
                className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all w-full sm:w-auto"
              >
                Track Bus
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
          <FaMapMarkedAlt className="text-blue-500 text-4xl mb-3" />
          <h3 className="font-bold text-lg">Live Tracking</h3>
          <p className="text-gray-600 text-sm">
            See buses move in real-time and locate routes instantly.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
          <FaBus className="text-emerald-500 text-4xl mb-3" />
          <h3 className="font-bold text-lg">Seat Availability</h3>
          <p className="text-gray-600 text-sm">
            Check how full a bus is before you hop on.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
          <FaClock className="text-orange-500 text-4xl mb-3" />
          <h3 className="font-bold text-lg">ETA Calculation</h3>
          <p className="text-gray-600 text-sm">
            Get accurate arrival estimates based on real-time tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
