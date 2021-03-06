import React from "react";

export default function Header() {
  return (
    <header className="text-gray-600 body-font">
      <div className="relative pt-6 pb-4">
        <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">OnChain</span>{' '}
              <span className="block text-blue-600 xl:inline">Mail</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Message any ethereum address
            </p>
          </div>
        </main>
      </div>
    </header>
  );
}