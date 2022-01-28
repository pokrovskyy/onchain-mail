import React, { useEffect, useState } from "react";

import "../App.css";

export default function Inbox({ currentAccount, contractOwner, contract }) {
  return (
    <div className="h-full w-full p-20">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        <div className="shadow sm:rounded-md sm:overflow-hidden">
          <p>You have no mail</p>
        </div>
      </div>
    </div>
  );
}