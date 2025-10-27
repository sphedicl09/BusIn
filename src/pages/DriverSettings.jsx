import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient.js"; // Trying .jsx extension

export default function DriverSettings() {
  const navigate = useNavigate();

  // State for each form
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [accountForm, setAccountForm] = useState({
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  // Status messages for each form
  const [profileStatus, setProfileStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // --- 1. FETCH ALL USER DATA ON LOAD ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setProfileStatus("Not logged in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setUserId(user.id);
      setAccountForm({ email: user.email });

      // --- FIX: Query 'conductor' table (lowercase) and match on 'user_id' ---
      const { data, error } = await supabase
        .from("conductor") // Was 'Conductor'
        .select("first_name, last_name, phone_number")
        .eq("user_id", user.id) // Was 'conductor_id'
        .single();

      if (error || !data) {
        setProfileStatus("Could not fetch driver profile.");
      } else {
        setProfileForm(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  // --- 2. FORM CHANGE HANDLERS ---
  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleAccountChange = (e) =>
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  // --- 3. FORM SAVE HANDLERS ---

  // Handle saving the driver's public profile
  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileStatus("Saving...");
    if (!userId) {
      setProfileStatus("User not found.");
      return;
    }

    // --- FIX: Update 'conductor' table matching 'user_id' ---
    const { error } = await supabase
      .from("conductor") // Was 'Conductor'
      .update(profileForm)
      .eq("user_id", userId); // Was 'conductor_id'

    setProfileStatus(error ? `Error: ${error.message}` : "Profile Saved!");
    setTimeout(() => setProfileStatus(""), 3000); // Clear message
  };

  // Handle saving the user's login email
  const handleAccountSave = async (e) => {
    e.preventDefault();
    setAccountStatus("Saving...");
    const { error } = await supabase.auth.updateUser({
      email: accountForm.email,
    });
    setAccountStatus(
      error ? `Error: ${error.message}` : "Account Email Saved!"
    );
    setTimeout(() => setAccountStatus(""), 3000); // Clear message
  };

  // Handle changing the user's password
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordStatus("Updating password...");

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordStatus("Passwords do not match.");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordStatus("Password must be at least 8 characters.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: passwordForm.new_password,
    });

    setPasswordStatus(
      error ? `Error: ${error.message}` : "Password Updated Successfully!"
    );
    setPasswordForm({ new_password: "", confirm_password: "" }); // Clear fields
    setTimeout(() => setPasswordStatus(""), 3000); // Clear message
  };

  // --- 4. RENDER LOGIC ---

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading driver settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Driver Settings</h1>

      {/* Profile Info Form */}
      <form
        onSubmit={handleProfileSave}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6"
      >
        <h2 className="text-xl font-semibold border-b pb-2">Profile Details</h2>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={profileForm.first_name || ""}
          onChange={handleProfileChange}
          className="border p-2 rounded-md"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={profileForm.last_name || ""}
          onChange={handleProfileChange}
          className="border p-2 rounded-md"
        />
        <input
          type="text"
          name="phone_number"
          placeholder="Phone Number"
          value={profileForm.phone_number || ""}
          onChange={handleProfileChange}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-md"
        >
          Save Profile
        </button>
        {profileStatus && (
          <p className={`mt-2 text-center text-sm ${profileStatus.includes("Error") ? 'text-red-600' : 'text-gray-700'}`}>
            {profileStatus}
          </p>
        )}
      </form>

      {/* Account Info Form */}
      <form
        onSubmit={handleAccountSave}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6"
      >
        <h2 className="text-xl font-semibold border-b pb-2">Account Email</h2>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={accountForm.email || ""}
          onChange={handleAccountChange}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
        >
          Update Email
        </button>
        {accountStatus && (
          <p className={`mt-2 text-center text-sm ${accountStatus.includes("Error") ? 'text-red-600' : 'text-gray-700'}`}>
            {accountStatus}
          </p>
        )}
      </form>

      {/* Password Form */}
      <form
        onSubmit={handlePasswordSave}
        className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-xl font-semibold border-b pb-2">Change Password</h2>
        <input
          type="password"
          name="new_password"
          placeholder="New Password (min. 8 chars)"
          value={passwordForm.new_password}
          onChange={handlePasswordChange}
          className="border p-2 rounded-md"
        />
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm New Password"
          value={passwordForm.confirm_password}
          onChange={handlePasswordChange}
          className="border p-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 rounded-md"
        >
          Update Password
        </button>
        {passwordStatus && (
          <p className={`mt-2 text-center text-sm ${passwordStatus.includes("Error") ? 'text-red-600' : 'text-gray-700'}`}>
            {passwordStatus}
          </p>
        )}
      </form>

      <button
        onClick={() => navigate("/driver-dashboard")}
        className="mt-6 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

