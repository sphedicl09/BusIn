import { useEffect, useState } from "react";

export default function Settings() {
  const [role, setRole] = useState("commuter");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <div className="max-w-lg mx-auto bg-white text-black p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <section className="mb-6">
        <h3 className="font-semibold text-lg mb-2">General</h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Share my location
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" /> Enable notifications
          </label>
        </div>
      </section>

      {role === "commuter" ? (
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Commuter Settings</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Bus arrival alerts
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Delay/reroute notifications
            </label>
            <button className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Manage Saved Routes
            </button>
          </div>
        </section>
      ) : (
        <section className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Driver Settings</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Share live bus location
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Passenger request alerts
            </label>
            <button className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              Manage Routes / Shifts
            </button>
            <button className="bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">
              Upload New License / Registry
            </button>
          </div>
        </section>
      )}

      <section>
        <h3 className="font-semibold text-lg mb-2">Account</h3>
        <button className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">
          Log Out
        </button>
      </section>
    </div>
  );
}
