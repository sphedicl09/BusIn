import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function CommuterSettings() {
  const navigate = useNavigate();
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

  const [profileStatus, setProfileStatus] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setProfileStatus("Not logged in.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setUserId(user.id);
      setAccountForm({ email: user.email });

      const { data, error } = await supabase
        .from("commuter")
        .select("first_name, last_name, phone_number")
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setProfileStatus("Could not fetch profile. Please create one first.");
      } else {
        setProfileForm(data);
      }
      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const handleProfileChange = (e) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handleAccountChange = (e) =>
    setAccountForm({ ...accountForm, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileStatus("Saving...");
    if (!userId) {
      setProfileStatus("User not found.");
      return;
    }

    const { error } = await supabase
      .from("commuter")
      .update(profileForm)
      .eq("user_id", userId);

    setProfileStatus(error ? "Error updating info." : "Profile Saved!");
  };

  const handleAccountSave = async (e) => {
    e.preventDefault();
    setAccountStatus("Saving...");
    const { error } = await supabase.auth.updateUser({
      email: accountForm.email,
    });
    setAccountStatus(
      error ? `Error: ${error.message}` : "Account Email Saved!"
    );
  };

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
    setPasswordForm({ new_password: "", confirm_password: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Commuter Settings</h1>

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
          <p className="mt-2 text-center text-gray-700">{profileStatus}</p>
        )}
      </form>

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
          <p className="mt-2 text-center text-gray-700">{accountStatus}</p>
        )}
      </form>

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
          <p className="mt-2 text-center text-gray-700">{passwordStatus}</p>
        )}
      </form>
    </div>
  );
}
