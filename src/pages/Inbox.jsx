import React, { useEffect, useState } from "react";

import "../App.css";

export default function Inbox({ currentAccount, contractOwner, contract }) {

  const isMetamaskConnected = !!currentAccount;

  return (
    <div style={{ maxWidth: "1280px", margin: "auto" }}>
      {isMetamaskConnected && (
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
        This will be the Inbox view
      </p>
      )}
    </div>
  );
}