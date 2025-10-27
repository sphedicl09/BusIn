import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function DriverSettings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus("Not logged in.");
        return;
      }

      const { data, error } = await supabase
        .from("Conductor")
        .select("first_name, last_name, phone_number")
        .eq("conductor_id", user.id)
        .single();

      if (error || !data) {
        setStatus("Could not fetch profile.");
      } else {
        setForm(data);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("Conductor")
      .update(form)
      .eq("conductor_id", user.id);

    setStatus(error ? "Error updating info." : "Saved!");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Driver Settings</h1>
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md"
        >
          Save Changes
        </button>
      </form>

      {status && <p className="mt-4 text-gray-700">{status}</p>}

      <button
        onClick={() => navigate("/driver-dashboard")}
        className="mt-4 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}
