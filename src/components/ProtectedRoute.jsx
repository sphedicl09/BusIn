import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient.js"; // Ensure correct path/extension

export default function ProtectedRoute({ children, allowedRole }) {
  const [authorized, setAuthorized] = useState(null); // Use null for initial loading state

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      // If no user or error getting user, they are not authorized
      if (userError || !user) {
        console.log("Protected Route: No user found, redirecting to login.");
        setAuthorized(false);
        return;
      }

      // --- FIX: Query the correct 'profiles' table ---
      const { data: profile, error: profileError } = await supabase
        .from("profiles") // Correct table name
        .select("role")
        .eq("user_id", user.id) // Match on user_id
        .single();
      // --- END FIX ---

      if (profileError) {
        console.error("Protected Route: Error fetching profile:", profileError);
        setAuthorized(false); // Treat errors as unauthorized
        return;
      }

      if (!profile) {
        console.log("Protected Route: No profile found for user, redirecting to setup.");
        // If no profile exists, they might need setup, consider redirecting there?
        // For now, treat as unauthorized for the specific role check.
        setAuthorized(false);
        // Or redirect specifically to profile setup: return <Navigate to="/profile-setup" replace />;
        return;
      }

      // Check if the fetched role matches the required role
      console.log(`Protected Route: User role '${profile.role}', Allowed role '${allowedRole}'`);
      setAuthorized(profile.role === allowedRole);
    };

    checkRole();
  }, [allowedRole]); // Re-run effect if allowedRole prop changes

  // Display loading indicator while checking auth
  if (authorized === null) {
    return <div className="flex justify-center items-center h-screen"><p>Checking authorization...</p></div>;
  }

  // If not authorized, redirect to login page
  if (!authorized) {
    // Maybe redirect to home or a specific "unauthorized" page instead?
    // For now, login is the safest default.
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the child components
  return children;
}
