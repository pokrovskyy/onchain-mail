import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import onChainMail from './artifacts/contracts/OnChainMail.sol/OnChainMail.json'
import {storeMetadata} from './utils/metadata';
import {getSignedContract, checkIfWalletIsConnected} from './utils/common';

// Update with the contract address logged out to the CLI when it was deployed
const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" 
const ocmAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

function App() {
  // store greeting in local state  
  const [greeting, setGreetingValue] = useState('')
  const [address, setAddress] = useState('');
	const [incentive, setIncentive] = useState(0);
	const [message, setMessage] = useState('');
  const [account, setAccount] = useState('');

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, read the current greeting value
  async function fetchGreeting() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(ocmAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // call the smart contract, send an update
  async function setGreeting() {
    if (!greeting) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(ocmAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(greeting)
      await transaction.wait()
      fetchGreeting()
    }
  }

	async function sendEmail() {
    console.log("sendEmail()")

    let tokenURI = storeMetadata(message)
    console.log(tokenURI)

    // checkIfWalletIsConnected(setAccount);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
      
    const contract = getSignedContract(ocmAddress, onChainMail.abi)
    const transaction = await contract.sendEmail(address, false, tokenURI)
    await transaction.wait()
	}

  return (
    <div className="App">
      <header className="App-header">
        <input onChange={e => setAddress(e.target.value)} placeholder="Recipient Address" />
        <input onChange={e => setIncentive(e.target.value)} placeholder="Incentive" />
        <input onChange={e => setMessage(e.target.value)} placeholder="Message" />
        <button onClick={sendEmail}>Send</button>

        {/* <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input onChange={e => setGreetingValue(e.target.value)} placeholder="Set greeting" /> */}
        
      </header>
    </div>
  );
}

export default App;