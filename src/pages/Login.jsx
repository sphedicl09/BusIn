import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../supabaseClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (!profile) {
          navigate("/profile-setup"); return;
        }
        if (profile.role === "driver") { navigate("/driver-dashboard"); }
        else if (profile.role === "commuter") { navigate("/home"); }
        else if (profile.role === "admin") { navigate("/admin-dashboard"); }
        else { navigate("/home"); }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setErrorMsg(loginError.message);
      return;
    }

    const user = loginData.user;
    if (!user) {
      setErrorMsg("Login failed. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (profile) {
        const { error: logError } = await supabase
            .from('login_logs')
            .insert({
                user_id: user.id,
                role: profile.role 
            });
        if (logError) {
            console.error("Error logging login event:", logError);
        }
    } else {
        console.warn("User logged in but has no profile yet. Login not logged.");
    }

    if (profileError || !profile) {
      navigate("/profile-setup");
      return;
    }

    if (profile.role === "driver") {
      navigate("/driver-dashboard");
    } else if (profile.role === "commuter") {
       navigate("/home");
    } else if (profile.role === "admin") {
       navigate("/admin-dashboard");
    }
     else {
      navigate("/home");
    }
  };

  return (
    <div className="login-bg flex items-center justify-center w-screen h-screen overflow-hidden no-margin">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-emerald-600 mb-6">
          BusIn Login
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
           <div>
             <label className="block text-gray-700 mb-1" htmlFor="email">Email</label>
             <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email" required />
           </div>
           <div>
             <label className="block text-gray-700 mb-1" htmlFor="password">Password</label>
             <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password" required />
           </div>
           {errorMsg && (<div className="text-red-600 text-sm text-center">{errorMsg}</div>)}
           <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition">
             Login
           </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{" "}
          <Link to= "/signup" className="text-emerald-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

