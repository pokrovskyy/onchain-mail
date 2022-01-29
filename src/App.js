import React, { useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast'

import Header from "./components/Header";
import Mail from './components/Mail';
import ConnectWithMetaMaskButton from "./components/ConnectWithMetaMaskButton";

import './App.css';

function App() {
  const [currentAccount, setCurrentAccount] = useState('');

  const isMetamaskConnected = !!currentAccount;

  return (
    <div className="h-full w-full">
      <Router>
        <Switch>
          <Route exact path="/mail">
            <Mail {...{ currentAccount }} />
          </Route>
          <Route path="/">
            <Header />
            <ConnectWithMetaMaskButton
              setCurrentAccount={setCurrentAccount}
              isMetamaskConnected={isMetamaskConnected}
            />
          </Route>
        </Switch>
      </Router>
      <Toaster />
    </div>
  );
}

export default App;