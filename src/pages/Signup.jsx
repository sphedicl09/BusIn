import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../supabaseClient";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showEULA, setShowEULA] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  
  const validatePassword = (pwd) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (!validatePassword(password)) {
      setErrorMsg(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (!accepted) {
      alert("Please accept the EULA before signing up.");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
        data: {
          first_name: firstName, 
          last_name: lastName,
        },
  },
});

if (signUpError) {
  setErrorMsg(signUpError.message);
  return;
}

  setSuccess(true);
  };

  return (
    <div className="signup-bg flex items-center justify-center w-screen h-screen overflow-hidden no-margin">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-8 relative">
        <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">
          Create an Account
        </h2>

        {!success ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name fields */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="John"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700 mb-1" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onMouseDown={() => setShowPassword(true)}
                  onMouseUp={() => setShowPassword(false)}
                  onMouseLeave={() => setShowPassword(false)}
                  className="absolute right-3 top-2 text-gray-500 hover:text-emerald-600"
                >
                  👁️
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="block text-gray-700 mb-1"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Re-enter password"
                required
              />
            </div>

            {/* EULA Checkbox */}
          <div className="flex items-center text-sm mt-2">
            <input
              type="checkbox"
              id="eula"
              className="mr-2"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              required
            />
            <label htmlFor="eula" className="text-gray-700">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowEULA(true)}
                className="text-blue-600 underline hover:text-blue-800"
              >
                End User License Agreement (EULA)
              </button>
            </label>
          </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-red-600 text-sm text-center">{errorMsg}</div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Sign Up
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-700 hover:underline">
                Login
              </Link>
            </p>
          </form>
        ) : (
          /* Success modal */
          <div className="text-center">
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              ✅ Signup Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* EULA Modal */}
      {showEULA && (
        <div className="fixed inset-0 flex justify-center items-center z-50 backdrop-clear-sm">
          <div className="bg-white p-6 rounded-xl w-11/12 max-w-lg shadow-lg relative max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-blue-600">
              End User License Agreement
            </h3>
            <div className="text-sm text-gray-700 space-y-3">
              <p><strong>Effective Date:</strong> 11/04/25</p>
              <p><strong>Version:</strong> 1.0</p>
              <p><strong>Last Updated:</strong> N/A</p>
              <p>
               By downloading, accessing, and using BusIn web application, you agree to be bound by
               this End User License Agreement. If you do not agree, please do not use the app.
              </p>
              <p>
                BusIn grants you a limited, non-exclusive, non-transferable license to use the application
                for your personal, non-commercial purpose. You can not modify, distribute, reverse-engineer or
                resell any part of the BusIn app.
              </p>
              <p>By pressing agree, you the user are agreeing to the following:</p>
              <ul className="list-disc list-inside">
                <li>To use the app lawfully and respectfully.</li>
            <li>Not to interfere with the application’s functionality or data.</li>
            <li>To maintain the confidentiality of your login credentials.</li>
            <li>Not to use the application for any malicious purposes that could harm yourself and other
            people in your surroundings.</li>
            <li>To maintain the act of intellectual property regarding parts of the application.</li>
          </ul>
          <p>
            BusIn may collect anonymized data such as GPS location and passenger count to
            improve the service’s accuracy. No personal information is shared.
          </p>
          <p>
            BusIn uses an AI to estimate passenger counts, these estimates may not always be 100%
            accurate. Users will only use this as a guide and not a guarantee.
          </p>
          <p>
            BusIn is provided “as is” without warranties of any kind. We are not liable for delays,
            inaccuracies, or damages resulting from the use of the Application.
          </p>
          <p>
            We reserve the right to suspend or terminate your access to the App at any time for
            violations committed of this agreement.
          </p>
          <p>
            We may update this Agreement from time to time. Continued use of the Application after
            changes means you accept the updated terms.
          </p>
          <p>This Agreement shall be governed by the laws of the Republic of the Philippines</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowEULA(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
