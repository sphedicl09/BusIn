import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Tracker from "./pages/Tracker"; // This is the Commuter's tracking page
import ProfileSetup from "./pages/ProfileSetup";
import Settings from "./pages/Settings";
import SignUp from "./pages/Signup";
import CommuterForm from "./pages/CommuterForm";
import DriverForm from "./pages/DriverForm";
import DriverDashboard from "./pages/DriverDashboard";
import AddBus from "./pages/AddBus";
import DriverSettings from "./pages/DriverSettings";
import CommuterSettings from "./pages/CommuterSettings";
import BusProfile from "./pages/BusProfile";
import RedirectAfterLogin from "./pages/RedirectAfterLogin";
import Eula from "./pages/Eula";
import FAQ from "./pages/Faq";
// --- NEW FILE TO IMPORT ---
import BroadcastLocation from "./pages/BroadcastLocation.jsx"; // This is the Driver's broadcast page

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap redirect and all routes inside Layout so Navbar always shows */}
        <Route element={<Layout />}>
          <Route path="/" element={<RedirectAfterLogin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* --- ROUTE FIXES --- */}
          {/* 1. This is the Commuter's page to VIEW a bus's location */}
          <Route path="/track-bus/:id" element={<Tracker />} />
          {/* 2. This is the Driver's page to BROADCAST their location */}
          <Route
            path="/broadcast-location/:id"
            element={<BroadcastLocation />}
          />
          {/* --- END ROUTE FIXES --- */}

          <Route path="/commuter-settings" element={<CommuterSettings />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-setup/commuter" element={<CommuterForm />} />
          <Route path="/profile-setup/driver" element={<DriverForm />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          <Route path="/driver-dashboard/add-bus" element={<AddBus />} />
          <Route
            path="/driver-dashboard/settings"
            element={<DriverSettings />}
          />
          <Route path="/driver-dashboard/bus/:id" element={<BusProfile />} />
          <Route path="/eula" element={<Eula />} />
          <Route path="/faq" element={<FAQ />} />

          {/* --- DEPRECATED ROUTE --- */}
          {/* We remove the old '/tracker' route as it's replaced by '/track-bus/:id' */}
          {/* <Route path="/tracker" element={<Tracker />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}
