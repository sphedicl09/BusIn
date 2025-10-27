import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "./supabaseClient";

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(null);

  useEffect(() => {
    const getUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setProfileType(null);
        return;
      }

      // Check driver profile
      const { data: driver } = await supabase
        .from("conductor")
        .select("user_id") 
        .eq("user_id", user.id)
        .maybeSingle();

      if (driver) {
        setProfileType("driver");
        localStorage.setItem("role", "driver"); // Set role for other components
        return;
      }

      // Check commuter profile
      const { data: commuter } = await supabase
        .from("commuter")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (commuter) {
        setProfileType("commuter");
        localStorage.setItem("role", "commuter"); // Set role for other components
        return;
      }

      setProfileType("none"); // User exists but has no profile
    };

    getUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserAndProfile();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("role"); // Clear role on logout
    setUser(null);
    setProfileType(null);
    window.location.href = "/";
  };

  // Build links dynamically
  // Keep Home always, only add Tracker for commuters
  const baseLinks = [{ path: "/home", label: "Home" }];

  // create a mutable links array and add commuter-only tracker
  const dynamicLinks = [...baseLinks];
  if (profileType === "commuter") {
    dynamicLinks.push({ path: "/tracker", label: "Tracker" });
  }

  let profileLink;
  let settingsLink;

  if (profileType === "driver") {
    profileLink = { path: "/driver-dashboard", label: "Driver Dashboard" };
    settingsLink = { path: "/driver-dashboard/settings", label: "Settings" };
  } else if (profileType === "commuter") {
    settingsLink = { path: "/commuter-settings", label: "Settings" };
  } else {
    profileLink = { path: "/profile-setup", label: "Profile Setup" };
    settingsLink = null; // Don't show settings if no profile
  }

  // Filter out null links
  const links = [...dynamicLinks, profileLink, settingsLink].filter(Boolean);

  return (
    <nav className="bg-emerald-600 text-white px-10 py-4 shadow-lg flex justify-between items-center z-50 relative">
      <Link to="/home">
      <h1 className="text-2xl font-extrabold tracking-tight select-none">
        Bus<span className="text-yellow-300">In</span>
      </h1>
      </Link>
      <ul className="flex items-center gap-8">
        {/* Show menu links ONLY if logged in */}
        {user &&
          links.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`transition-colors duration-200 font-semibold hover:text-yellow-300 ${
                  location.pathname === path
                    ? "text-yellow-200 underline underline-offset-4"
                    :"text-white" // Ensure non-active links are white
                }`}
              >
                {label}
              </Link>
            </li>
          ))}

        {/* Auth buttons */}
        <li>
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-emerald-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}
