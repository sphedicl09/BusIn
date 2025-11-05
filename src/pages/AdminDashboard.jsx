import { useEffect, useState } from "react";
import supabase from "../supabaseClient.js";
import { format, subMinutes } from "date-fns";

const formatTimestamp = (ts) => {
  if (!ts) return "N/A";
  try {
    return format(new Date(ts), "MMM d, yyyy, h:mm a");
  } catch (error) {
    console.error("Error formatting date:", error);
    return ts;
  }
};

export default function AdminDashboard() {
  const [loginLogs, setLoginLogs] = useState([]);
  const [activeBuses, setActiveBuses] = useState([]);
  const [logError, setLogError] = useState(null);
  const [busError, setBusError] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingBuses, setLoadingBuses] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      setLogError(null);
      try {
        const { data, error } = await supabase
          .from("login_logs")
          .select("id, timestamp, role, user_id")
          .order("timestamp", { ascending: false })
          .limit(50);

        if (error) throw error;
        setLoginLogs(data || []);
      } catch (error) {
        console.error("Error fetching login logs:", error);
        setLogError(error.message || "Failed to fetch login logs.");
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  useEffect(() => {
    const fetchActiveBuses = async () => {
      setLoadingBuses(true);
      setBusError(null);
      try {
        const fiveMinutesAgo = subMinutes(new Date(), 5).toISOString();
        const { data, error } = await supabase
          .from("bus_live_location")
          .select(
            `
            updated_at,
            passenger_count,
            bus ( id, plate_no, company, destination )
          `
          )
          .gte("updated_at", fiveMinutesAgo)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setActiveBuses(data || []);
      } catch (error) {
        console.error("Error fetching active buses:", error);
        setBusError(error.message || "Failed to fetch active buses.");
      } finally {
        setLoadingBuses(false);
      }
    };

    fetchActiveBuses();
    const intervalId = setInterval(fetchActiveBuses, 30000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>
      <section className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Recent Logins</h2>
        {loadingLogs && <p>Loading login logs...</p>}
        {logError && <p className="text-red-600">Error: {logError}</p>}
        {!loadingLogs && !logError && loginLogs.length === 0 && <p>No recent login activity.</p>}
        {!loadingLogs && !logError && loginLogs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loginLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTimestamp(log.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{log.user_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.role || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Active Buses (Updated in Last 5 Mins)</h2>
        {loadingBuses && <p>Loading active buses...</p>}
        {busError && <p className="text-red-600">Error: {busError}</p>}
        {!loadingBuses && !busError && activeBuses.length === 0 && <p>No buses currently broadcasting location.</p>}
        {!loadingBuses && !busError && activeBuses.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Update</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plate No</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                   <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeBuses.map((busLog) => (
                  <tr key={busLog.bus?.id || busLog.updated_at}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTimestamp(busLog.updated_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{busLog.bus?.plate_no || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{busLog.bus?.company || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{busLog.bus?.destination || 'N/A'}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{busLog.passenger_count ?? 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

