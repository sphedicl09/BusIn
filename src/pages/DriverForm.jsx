import { useState } from "react";
import supabase from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function DriverForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in.");

      const { data: existing, error: selectError } = await supabase
        .from("conductor")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const { error: updateError } = await supabase
          .from("conductor")
          .update({
            first_name: form.first_name,
            last_name: form.last_name,
            phone_number: form.phone_number,
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("conductor").insert([
          {
            user_id: user.id,
            first_name: form.first_name,
            last_name: form.last_name,
            phone_number: form.phone_number,
          },
        ]);

        if (insertError) throw insertError;
      }
      await supabase.from("profiles").upsert([
        { user_id: user.id, role: "driver" },
      ]);

      localStorage.setItem("role", "driver");
      navigate("/driver-dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-center">Driver Profile Setup</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2"
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2"
          required
        />

        <input
          type="tel"
          name="phone_number"
          placeholder="Phone Number"
          value={form.phone_number}
          onChange={handleChange}
          className="border rounded-lg px-3 py-2"
          required
        />

        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
