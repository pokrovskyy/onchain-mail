import { useState } from 'react';
import { ethers } from 'ethers'
import './App.css';
import OnChainMail from './artifacts/contracts/OnChainMail.sol/OnChainMail.json'

const greeterAddress = "0x75E949B8e65c3FcE60EF036ef0891Cd7D51DEbE1"

function App() {
  const [greeting, setGreetingValue] = useState()

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, OnChainMail.abi, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }  
  }

  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, OnChainMail.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }


  return (
    <div className="App">
      <header className="App-header">
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input 
          onChange={e => setGreetingValue(e.target.value)} 
          placeholder="Set greeting" 
        />
      </header>
    </div>
  );
}

export default App;
