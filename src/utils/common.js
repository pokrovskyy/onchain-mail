import { ethers } from 'ethers';
import toast from 'react-hot-toast'

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
        console.log('CheckIfWalletIsConnected Err:', error);
        toast.error('Error checking if wallet is connected. Please try again.')
    }
}

export const connectWallet = async (setCurrentAccount, history) => {
    try {
        const { ethereum } = window;

        if (!ethereum) {
            toast("You don't have Metamask installed!")
            return;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });

        setCurrentAccount(accounts[0].toLowerCase());

        history.push("/mail")
    } catch (error) {
        console.log("Connect Wallet Err:", error)
        toast.error('Error connecting wallet. Please try again.')
    }
}

/*export const getTokenCount = async (contract) => {
    try {
        if (!contract) {
            return;
        }

        const result = await contract._tokenIds();
        return result
    } catch (error) {
        console.log(error);
    }
};

export const mintNft = async (contract, contractOwner) => {
    try {
        if (!contract) {
            return;
        }

        const txn = await contract.mint(contractOwner);
        await txn.wait();
    } catch (error) {
        console.log(error);
    }
};

export const buyNft = async (contract, tokenId, price) => {
    try {
        if (!contract) {
            return;
        }

        const txn = await contract.buyNft(tokenId, {
            value: ethers.utils.parseEther(price.toString()),
        });
        await txn.wait();
    } catch (error) {
        console.log(error);
    }
};*/