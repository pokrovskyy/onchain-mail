import { useState } from 'react';
import { PencilAltIcon, InboxIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'

import Compose from './Compose'
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
	const [showCompose, setShowCompose] = useState(true);
	const [showInbox, setShowInbox] = useState(false);
	const [address, setAddress] = useState('');
	const [incentive, setIncentive] = useState(0);
	const [message, setMessage] = useState('');
	const [mailMetadata, setMailMetadata] = useState([])
	const [isLoading, setIsLoading] = useState(false)

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
		setIsLoading(true);
		if (typeof window.ethereum !== 'undefined') {
			console.log('Begin get inbox flow...')

			await requestAccount()
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner()
			const contract = new ethers.Contract(onChainMailAddress, onChainMail.abi, signer)

			try {
				const mailIds = await contract.getReceivedMail(currentAccount)

				const mailDetails = await Promise.all(mailIds.map(id => {
					return contract.mailDetails(id)
				}))

				const tokenURIs = await Promise.all(mailIds.map(id => {
					return contract.tokenURI(id)
				}))

				const mailMetadata = mailDetails.map((detail, idx) => {
					const [encrypted, incentiveInWei, sender, receivedTimestamp, readTimestamp] = detail

					return {
						id: mailIds[idx],
						read: readTimestamp > 0,
						encrypted,
						incentiveInWei,
						sender,
						tokenURI: tokenURIs[idx],
						readTimestamp: (readTimestamp > 0 ? new Date(readTimestamp.toNumber()) : null),
						receivedTimestamp: new Date(receivedTimestamp.toNumber())
					}
				})

				console.log('Mail metadata', mailMetadata)

				setMailMetadata(mailMetadata)
			}
			catch (error) {
				console.log('Err:', error)
			}
			finally{
				setIsLoading(false);
			}
		}

		setIsLoading(false);
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
										'text-blue-700 hover:text-blue-700 hover:bg-white',
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
										setShowCompose(k === 'compose');
										setShowInbox(k === 'inbox');

										console.log(showInbox)
									}}
								>
									<item.icon
										className={classNames(
											item.current
												? 'text-blue-500 group-hover:text-blue-500'
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

				{showCompose && <Compose setAddress={setAddress} setIncentive={setIncentive} setMessage={setMessage} sendEmail={sendEmail} />}
				{showInbox && <Inbox isLoading={isLoading} mailMetadata={mailMetadata} onChainMail={onChainMail} onChainMailAddress={onChainMailAddress} />}
			</div>
		</div>
	)
}

export default Mail