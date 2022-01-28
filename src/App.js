import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import ConnectWithMetaMaskButton from "./components/ConnectWithMetaMaskButton.jsx";

import Inbox from "./pages/Inbox";
import Mail from './pages/Mail';

import {
  checkIfWalletIsConnected,
  getSignedContract,
  updateProviderAndContract,
} from "./utils/common.js";

import './App.css';

function App() {
  const [contractOwner, setContractOwner] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  /*const address = addressJson.address;
  const contractABI = abiJson.abi;

  useEffect(() => {
    checkIfWalletIsConnected(setCurrentAccount);
    updateProviderAndContract(address, contractABI, setProvider, setContract);
  }, []);
  */

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
    <Router>
      <div id="app-container">
        <Header isOwner={isOwner} />
        {!isMetamaskConnected && (
          <ConnectWithMetaMaskButton
            setCurrentAccount={setCurrentAccount}
            isMetamaskConnected={isMetamaskConnected}
          />
        )}
        <Switch>
          <Route exact path="/">
            <Mail {...{ contractOwner, currentAccount, provider, contract }} />
          </Route>
          <Route exact path="/inbox">
            <Inbox {...{ contractOwner, currentAccount, provider, contract }} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;