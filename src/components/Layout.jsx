import { Outlet, Link } from "react-router-dom";
import NavBar from "../Navbar";
import BackButton from "./BackButton";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent text-black">
      <NavBar />
      <BackButton />
      <main className="flex-grow">
        <Outlet />
      </main>

            <footer className="bg-emerald-600 text-white text-center py-4 mt-auto">
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm">
                <Link to="/faq" className="underline hover:text-yellow-300">
                  FAQ
                </Link>
                <span>|</span>
                <Link to="/eula" className="underline hover:text-yellow-300">
                  EULA
                </Link>
                <span>|</span>
                <Link to="/how-to-use" className="underline hover:text-yellow-300">
                  How to Use
                </Link>
              </div>
              <p className="text-xs mt-2">&copy; {new Date().getFullYear()} BusIn</p>
            </footer>
    </div>
  );
}