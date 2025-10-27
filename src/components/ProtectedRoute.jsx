import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function ProtectedRoute({ children, allowedRole }) {
  const [authorized, setAuthorized] = useState(null);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setAuthorized(false);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setAuthorized(profile?.role === allowedRole);
    };

    checkRole();
  }, [allowedRole]);

  if (authorized === null) return null; // loading state
  if (!authorized) return <Navigate to="/login" replace />;
  return children;
}
