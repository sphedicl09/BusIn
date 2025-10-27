import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function AddBus() {
  const [form, setForm] = useState({
    company: "",
    plate_no: "",
    capacity: "",
    has_ac: false,
  });
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving bus info...");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not logged in.");

      const { data: conductor, error: conductorError } = await supabase
        .from("conductor")
        .select("conductor_id")
        .eq("user_id", user.id)
        .single();

      if (conductorError || !conductor) {
        throw new Error(
          "You must create your driver profile first before adding a bus."
        );
      }

      const { error: insertError } = await supabase.from("bus").insert([
        {
          conductor_id: conductor.conductor_id,
          company: form.company,
          plate_no: form.plate_no,
          capacity: parseInt(form.capacity) || null,
          has_ac: form.has_ac,
          active: true,
        },
      ]);

      if (insertError) throw insertError;
      setStatus("Bus added successfully!");
      setTimeout(() => navigate("/driver-dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Add a New Bus</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md flex flex-col gap-4 w-full max-w-md"
      >
        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={form.company}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="text"
          name="plate_no"
          placeholder="Plate Number"
          value={form.plate_no}
          onChange={handleChange}
          className="border p-2 rounded-md"
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          className="border p-2 rounded-md"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="has_ac"
            checked={form.has_ac}
            onChange={handleChange}
          />
          Has Air Conditioning
        </label>

        <button
          type="submit"
          className="bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 transition"
        >
          Save Bus
        </button>
      </form>

      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
}

