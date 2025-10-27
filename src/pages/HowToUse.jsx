import React from "react";
import { Link } from "react-router-dom";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          How to Use BusIn
        </h1>

        <div className="space-y-4 text-gray-800">
          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">I'm a commuter that is using BusIn for the first time</summary>
            <p className="mt-2 text-sm">
              First time users for commuters such as yourself will need to sign up for an account to successfully use the
              BusIn application. After signing up, you will need to search up the stops that you are willing to wait for
              your bus to arrive at your destination so that you can board the bus that you will be taking for your journey.
            </p>
          </details>

          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">I'm a conductor that is using BusIn for the first time</summary>
            <p className="mt-2 text-sm">
              For a conductor such as yourself, you will also need to sign up for an account to use the BusIn application.
              After doing those, you will need to register your bus, bus company and the bus's plate number to be stored within the
              database of the application. After doing so, you will need to mark the stops that your route will be taking and the start
              and end of your destination so that commuters will know where your bus will be going and where are the stops that you would
              be taking.
            </p>
          </details>

          <details className="border p-3 rounded-lg">
            <summary className="font-semibold">How can I search for the buses as a commuter?</summary>
            <p className="mt-2 text-sm">
              In order to search for your desired bus, you will need to enter the stops that you will be waiting for your bus
              then inspect their destination if it matches with your desired destination. After doing so, you will be able
              to track the said bus on its current route and location.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
