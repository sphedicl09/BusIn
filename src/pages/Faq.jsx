import React from "react";
import { Link } from "react-router-dom";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4 text-gray-800">
          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">How does BusIn track buses?</summary>
            <p className="mt-2 text-sm">
              The developers have an AI integrated system that can be used to track buses in order for
              the commuters to have a real-time update regarding the location of the buses that they
              wish to use for their journey.
            </p>
          </details>

          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">How accurate is the passenger count?</summary>
            <p className="mt-2 text-sm">
              The accuracy of the passenger count can be at least 98% accurate therefore, do not
              always assume that the passenger count is 100% accurate.
            </p>
          </details>

          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">Is my location data stored?</summary>
            <p className="mt-2 text-sm">
             All customer’s location data are not stored but rather their information only is stored.
            </p>
          </details>

          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">Is BusIn free to use?</summary>
            <p className="mt-2 text-sm">
              Yes, BusIn is a website application that is free to use by commuters and bus conductors
              alike
            </p>
          </details>

          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">Does BusIn still track me when the app is closed?</summary>
            <p className="mt-2 text-sm">
              No, BusIn does not have the capabilities to track its users even if the application is
              closed. BusIn respects all of its user’s privacy, the only time that BusIn will track its users
              is if they choose to track buses for their supposed destination to ensure that they are
              looking at the correct bus that they would take for their journey.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
