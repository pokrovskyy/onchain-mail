import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast'

import Header from "./components/Header";
import Mail from './components/Mail';
import ConnectWithMetaMaskButton from "./components/ConnectWithMetaMaskButton";

import './App.css';

function App() {
  const [contractOwner, setContractOwner] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    getContractOwner(setContractOwner);
  }, [currentAccount]);

  const getContractOwner = async (setContractOwner) => {
    try {
      //const contract = getSignedContract(address, contractABI);

      if (!contract) {
        return;
      }

      const owner = await contract.owner();

      setContractOwner(owner.toLowerCase());
    } catch (err) {
      console.log(err);
    }
  };

  const isOwner =
    contractOwner !== "" &&
    contractOwner.toLowerCase() === currentAccount.toLowerCase();

  const isMetamaskConnected = !!currentAccount;

  return (
    <div className="h-full w-full">
      <Router>
        <Switch>
          <Route exact path="/mail">
            <Mail {...{ contractOwner, currentAccount, provider, contract }} />
          </Route>
          <Route path="/">
            <Header isOwner={isOwner} />
            {!isMetamaskConnected && (
              <ConnectWithMetaMaskButton
                setCurrentAccount={setCurrentAccount}
                isMetamaskConnected={isMetamaskConnected}
              />
            )}
          </Route>
        </Switch>
      </Router>
      <Toaster />
    </div>
  );
}

export default App;