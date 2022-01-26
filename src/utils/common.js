import { ethers } from 'ethers';

export const getSignedContract = (address, contractABI) => {
    const { ethereum } = window;

    if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        return new ethers.Contract(address, contractABI, signer);
    }

    return null
}

export const updateProviderAndContract = (address, contractABI, setProvider, setContract) => {
    const { ethereum } = window;

    if (!ethereum) return

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(address, contractABI, signer);

    setProvider(provider);
    setContract(contract);
}

export const checkIfWalletIsConnected = async (setCurrentAccount) => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
            const account = accounts[0];
            setCurrentAccount(account.toLowerCase())
        }
    } catch (error) {
        console.log(error);
    }
}

export const connectWallet = async (setCurrentAccount) => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Get MetaMask!");
            return;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        setCurrentAccount(accounts[0].toLowerCase());

    } catch (error) {
        console.log(error)
    }
}

export const sendEmail = async (contract, recipient, encrypted, tokenURI) => {
    try {
        if (!contract) {
            return;
        }

        const txn = await contract.sendEmail(recipient, encrypted, tokenURI);
        await txn.wait();
    } catch (error) {
        console.log(error);
    }
};