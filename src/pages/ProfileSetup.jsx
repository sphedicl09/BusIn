import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
      <p className="mb-6 text-gray-600">Are you a commuter or a driver?</p>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/profile-setup/commuter")}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          I’m a Commuter
        </button>
        <button
          onClick={() => navigate("/profile-setup/driver")}
          className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          I’m a Driver
        </button>
      </div>
    </div>
  );
}
