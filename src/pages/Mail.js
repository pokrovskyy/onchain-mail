import { useState } from 'react';
import { PencilAltIcon, InboxIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import Inbox from './Inbox'
import { storeMetadata } from '../utils/metadata'
import onChainMail from '../artifacts/contracts/OnChainMail.sol/OnChainMail.json'

function classNames(...classes) {
	return classes.filter(Boolean).join(' ')
}

// Update with the contract address logged out to the CLI when it was deployed 
const onChainMailAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"

const Mail = ({ currentAccount, contractOwner }) => {
	const [navigation, setNavigation] = useState({
		compose: { key: 'compose', name: 'Compose', icon: PencilAltIcon, current: true },
		inbox: { key: 'inbox', name: 'Inbox', icon: InboxIcon, current: false },
	})
	const [showInbox, setShowInbox] = useState(false);
	const [address, setAddress] = useState('');
	const [incentive, setIncentive] = useState(0);
	const [message, setMessage] = useState('');

	const isMetamaskConnected = !!currentAccount;

	if (!isMetamaskConnected) {
		return null;
	}

	// request access to the user's MetaMask account
	async function requestAccount() {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
	}

	// call the smart contract
	async function sendEmail(event) {
		event.preventDefault()
		console.log("sendEmail()")
		console.log(address, incentive, message)

		let tokenURI = ''

		try {
			tokenURI = await storeMetadata(message)
		}
		catch (error) {
			console.log('Error storing metadata:', error)
		}

		if (typeof window.ethereum !== 'undefined') {
			console.log('Begin send email flow...')
			await requestAccount()
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner()
			const contract = new ethers.Contract(onChainMailAddress, onChainMail.abi, signer)

			try {
				const transaction = await contract.sendEmail(address, false, tokenURI, { value: ethers.utils.parseEther(incentive) })
				await transaction.wait()
				console.log('Sent mail:', transaction)
			}
			catch (error) {
				console.log('Send Mail Err:', error)
			}
		}
	}

	async function getInbox() {
		if (typeof window.ethereum !== 'undefined') {
			console.log('Begin get inbox flow...')
			console.log('Current account:', currentAccount, typeof currentAccount)

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner()
			const contract = new ethers.Contract(onChainMailAddress, onChainMail.abi, signer)

			console.log(contract)

			try {
				const mailIds = await contract.receivedMailCount(currentAccount)
				await mailIds.wait()
				console.log('Mail Ids:', mailIds)
			}
			catch (error) {
				console.log('Get inbox err:', error)
			}
		}
	}

	return (
		<div className="h-full w-full p-20">
			<div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
				<aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
					<nav className="space-y-1">
						{Object.keys(navigation).map((k) => {
							const item = navigation[k];
							return (
								<div
									key={item.name}
									className={classNames(
										item.current
											? 'bg-gray-50 text-indigo-700 hover:text-indigo-700 hover:bg-white'
											: 'text-gray-900 hover:text-gray-900 hover:bg-gray-50',
										'group rounded-md px-3 py-2 flex items-center text-sm font-medium'
									)}
									aria-current={item.current ? 'page' : undefined}
									onClick={() => {
										if (k === 'inbox') {
											getInbox()
										}

										const newNav = { ...navigation };

										Object.keys(newNav).map(k => {
											return newNav[k].current = newNav[k].key === item.key
										})

										setNavigation(newNav);
										setShowInbox(!showInbox);
									}}
								>
									<item.icon
										className={classNames(
											item.current
												? 'text-indigo-500 group-hover:text-indigo-500'
												: 'text-gray-400 group-hover:text-gray-500',
											'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
										)}
										aria-hidden="true"
									/>
									<span className="truncate">{item.name}</span>
								</div>
							)
						})}
					</nav>
				</aside>

				{!showInbox && <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
					<form>
						<div className="shadow sm:rounded-md sm:overflow-hidden">
							<div className="bg-white py-6 px-4 space-y-6 sm:p-6">
								<div>
									<h3 className="text-lg leading-6 font-medium text-gray-900">Send Message</h3>
									<p className="mt-1 text-sm text-gray-500">
										Send some message
									</p>
								</div>

								<div className="grid grid-cols-3 gap-6">
									<div className="col-span-6 sm:col-span-4">
										<label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
											Address
										</label>
										<input
											type="text"
											name="address"
											id="address"
											placeholder="Recipient Wallet Address"
											onChange={e => setAddress(e.target.value)}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
									</div>

									<div className="col-span-6 sm:col-span-4">
										<label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
											Incentive
										</label>
										<input
											type="number"
											name="incentive"
											id="incentive"
											placeholder="Incentive amount"
											onChange={e => setIncentive(e.target.value)}
											className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
										/>
									</div>

									<div className="col-span-3">
										<label htmlFor="about" className="block text-sm font-medium text-gray-700">
											Message
										</label>
										<div className="mt-1">
											<textarea
												id="message"
												name="message"
												rows={3}
												className="p-4 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
												placeholder="Sell me your NFT"
												onChange={e => setMessage(e.target.value)}
												defaultValue={''}
											/>
										</div>
									</div>
								</div>
							</div>
							<div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
								<button
									type="submit"
									className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									onClick={sendEmail}
								>
									Send
								</button>
							</div>
						</div>
					</form>
				</div>}
				{showInbox && <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
					<div className="shadow sm:rounded-md sm:overflow-hidden">
						<p>You have no mail</p>
					</div>
				</div>}
			</div>
		</div>
	)
}

export default Mail