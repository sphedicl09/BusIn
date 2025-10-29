import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Tracker from "./pages/Tracker";
import ProfileSetup from "./pages/ProfileSetup";
import Settings from "./pages/Settings"; // Assuming this is a generic placeholder now
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
import BroadcastLocation from "./pages/BroadcastLocation.jsx";
import HowToUse from "./pages/HowToUse.jsx";

// --- 1. Import ProtectedRoute and AdminDashboard ---
import ProtectedRoute from "./components/ProtectedRoute"; // Adjust path if needed
import AdminDashboard from "./pages/AdminDashboard";
// Removed BusETA import as it's not used directly here

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RedirectAfterLogin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/track-bus/:id" element={<Tracker />} />
          <Route path="/broadcast-location/:id" element={<BroadcastLocation />} />

          {/* Settings routes - ensure these are correctly linked or remove if unused */}
          <Route path="/commuter-settings" element={<CommuterSettings />} />
          {/* <Route path="/settings" element={<Settings />} /> */} {/* Maybe remove generic settings? */}

          {/* Profile Setup */}
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/profile-setup/commuter" element={<CommuterForm />} />
          <Route path="/profile-setup/driver" element={<DriverForm />} />

          {/* Driver Routes */}
           <Route path="/driver-dashboard" element={
              <ProtectedRoute allowedRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
           }/>
           <Route path="/driver-dashboard/add-bus" element={
               <ProtectedRoute allowedRole="driver">
                  <AddBus />
               </ProtectedRoute>
           }/>
           <Route path="/driver-dashboard/settings" element={
              <ProtectedRoute allowedRole="driver">
                 <DriverSettings />
               </ProtectedRoute>
           }/>
           <Route path="/driver-dashboard/bus/:id" element={
              <ProtectedRoute allowedRole="driver">
                  <BusProfile />
               </ProtectedRoute>
           }/>

          {/* Static Pages */}
          <Route path="/eula" element={<Eula />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/how-to-use" element={<HowToUse />} />

          {/* --- 2. Add Protected Admin Route --- */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

        </Route>
      </Routes>
    </Router>
  );
}
