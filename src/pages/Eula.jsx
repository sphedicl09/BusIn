import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

export default function Eula() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          End User License Agreement (EULA)
        </h1>

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
      </div>
    </div>
  );
}
