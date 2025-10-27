import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import supabase from "../supabaseClient";
import Home from "./Home";

export default function RedirectAfterLogin() {
  const [status, setStatus] = useState("checking");
  const [redirect, setRedirect] = useState(null);

  useEffect(() => {
    const checkUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("Logged-in user:", user);

      if (!user) {
        setStatus("showHome");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("Profile query result:", profile, error);

      if (!profile) {
        console.log("No profile found for user:", user.id);
        setRedirect("/profile-setup");
        setStatus("redirect");
        return;
      }

      switch (profile.role) {
        case "driver":
          setRedirect("/driver-dashboard");
          break;
        case "commuter":
          setRedirect("/home");
          break;
        case "admin":
          setRedirect("/admin-dashboard");
          break;
        default:
          setRedirect("/profile-setup");
          break;
      }

      setStatus("redirect");
    };

    checkUserProfile();
  }, []);

  if (status === "checking")
    return <p className="text-center mt-8">Checking session...</p>;
  if (status === "redirect") return <Navigate to={redirect} replace />;
  return <Home />;
}
