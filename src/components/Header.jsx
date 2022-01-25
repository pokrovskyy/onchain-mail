import React from "react";
import { Link } from "react-router-dom";

export default function Header({ isOwner }) {
  return (
    <header className="text-gray-600 body-font">
      <div className="relative pt-6 pb-16 sm:pb-24">
        <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">OnChain</span>{' '}
              <span className="block text-blue-600 xl:inline">Mail</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Message any ethereum address
            </p>
            <nav className="items-center text-base">
                <Link
                    to="/"
                    className="mr-5 hover:text-gray-900"
                    style={{ margin: "0" }}
                >
                    Compose
                </Link> 
                <Link to="/inbox" className="ml-5 mr-5 hover:text-gray-900">
                Inbox
                </Link>
                </nav>
          </div>
        </main>
      </div>
    </header>
  );
}