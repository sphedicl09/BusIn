import { useNavigate, useLocation } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const noBackRoutes = ["/", "/login", "/signup", "/tracker", "/settings", "/profile-setup", "/home", "/driver-dashboard"];

  if (noBackRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="ml-4 mt-3">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg shadow hover:bg-gray-300 transition"
      >
        ← Back
      </button>
    </div>
  );
}
