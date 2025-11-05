import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient.js";

export default function ProtectedRoute({ children, allowedRole }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("Protected Route: No user found, redirecting to login.");
        setAuthorized(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Protected Route: Error fetching profile:", profileError);
        setAuthorized(false);
        return;
      }

      if (!profile) {
        console.log("Protected Route: No profile found for user, redirecting to setup.");
        setAuthorized(false);
        return <Navigate to="/profile-setup" replace />;
      }

      console.log(`Protected Route: User role '${profile.role}', Allowed role '${allowedRole}'`);
      setAuthorized(profile.role === allowedRole);
    };

    checkRole();
  }, [allowedRole]);

  if (authorized === null) {
    return <div className="flex justify-center items-center h-screen"><p>Checking authorization...</p></div>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
