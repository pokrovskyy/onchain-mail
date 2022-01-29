import { Fragment, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import toast from 'react-hot-toast'
import {
	PencilAltIcon,
	InboxIcon,
	MenuIcon,
	XIcon,
} from '@heroicons/react/outline'
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

const Mail = ({ currentAccount }) => {
	const history = useHistory()

	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [sidebarNavigation, setSidebarNavigation] = useState({
		compose: { key: 'compose', name: 'Compose', href: '#', icon: PencilAltIcon, current: true },
		inbox: { key: 'inbox', name: 'Inbox', href: '#', icon: InboxIcon, current: false },
	})
	const [showCompose, setShowCompose] = useState(true);
	const [showInbox, setShowInbox] = useState(false);
	const [address, setAddress] = useState('');
	const [title, setTitle] = useState('');
	const [incentive, setIncentive] = useState(0);
	const [message, setMessage] = useState('');
	const [mailMetadata, setMailMetadata] = useState([])
	const [isLoading, setIsLoading] = useState(false)
	const [isSending, setIsSending] = useState(false)

	const isMetamaskConnected = !!currentAccount;

	if (!isMetamaskConnected) {
		toast("You're not connected to Metamask!")
		history.push("/")
		return null;
	}

	function handleMenuChange(navKey) {
		if (navKey === 'inbox') {
			getInbox()
		}

		const newNav = { ...sidebarNavigation }

		Object.keys(newNav).map(k => {
			return newNav[k].current = newNav[k].key === navKey
		})

		setSidebarNavigation(newNav)
		setShowCompose(navKey === 'compose')
		setShowInbox(navKey === 'inbox')
	}

	// request access to the user's MetaMask account
	async function requestAccount() {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
	}

	// call the smart contract
	async function sendEmail(event) {
		event.preventDefault()
		console.log("sendEmail()")

		let tokenURI = ''

		try {
			tokenURI = await storeMetadata(message, title)
		}
		catch (error) {
			console.log('Error storing metadata:', error)
			toast.error('Error uploading to message to IPFS. Please try again.')
		}

		if (typeof window.ethereum !== 'undefined') {
			console.log('Begin send email flow...')
			setIsSending(true)

			await requestAccount()

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner()
			const contract = new ethers.Contract(onChainMailAddress, onChainMail.abi, signer)

			try {
				const transaction = await contract.sendEmail(address, false, tokenURI, { value: ethers.utils.parseEther(incentive) })
				await transaction.wait()
				console.log('Sent mail:', transaction)
				toast.success('Message sent!')
			}
			catch (error) {
				console.log('Send Mail Err:', error)
				toast.error('Error sending message. Please try again.')
			}
			finally {
				setIsSending(false)
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

				mailMetadata.reverse() // Sort newest to oldest

				setMailMetadata(mailMetadata)
			}
			catch (error) {
				console.log('Get Inbox Err:', error)
				toast.error('Error getting inbox. Please try again.')
			}
			finally {
				setIsLoading(false);
			}
		}

		setIsLoading(false);
	}

	return (
		<>
			<div className="h-full flex flex-col">
				{/* Top nav*/}
				<header className="flex-shrink-0 relative h-16 bg-white flex items-center">
					{/* Picker area */}
					<div className="mx-auto md:hidden">
						<div className="relative">
							<label htmlFor="inbox-select" className="sr-only">
								Choose inbox
							</label>
							<select
								id="inbox-select"
								className="rounded-md border-0 bg-none pl-3 pr-8 text-base font-medium text-gray-900 focus:ring-2 focus:ring-blue-600"
								defaultValue={Object.keys(sidebarNavigation).find(k => sidebarNavigation[k].current).name}
								onChange={(event) => handleMenuChange(event.target.value)}
							>
								{Object.keys(sidebarNavigation).map((k) => {
									const item = sidebarNavigation[k]
									return (
										<option key={item.key} value={item.key}>{item.name}</option>
									)
								})}
							</select>
						</div>
					</div>

					{/* Menu button area */}
					<div className="absolute inset-y-0 right-0 pr-4 flex items-center sm:pr-6 md:hidden">
						{/* Mobile menu button */}
						<button
							type="button"
							className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
							onClick={() => setMobileMenuOpen(true)}
						>
							<span className="sr-only">Open main menu</span>
							<MenuIcon className="block h-6 w-6" aria-hidden="true" />
						</button>
					</div>

					{/* Desktop nav area */}
					<div className="hidden md:min-w-0 md:flex-1 md:flex md:items-center md:justify-between">
						<div className="min-w-0 flex-1">
							<Link to="/">
								<div className="flex max-w-2xl relative font-bold text-2xl text-gray-400 focus-within:text-gray-500 mx-5">
									<span className="block xl:inline mx-1">OnChain</span>
									<span className="block text-blue-600 xl:inline mx-1">Mail</span>
								</div>
							</Link>
						</div>
						<div className="ml-10 pr-4 flex-shrink-0 flex items-center space-x-10">
							<div className="flex max-w-2xl relative text-xl text-gray-400 focus-within:text-gray-500 m-2">
								<span className="block xl:inline">Wallet: {currentAccount.substr(0, 9) + "\u2026"}</span>
							</div>
						</div>
					</div>

					{/* Mobile menu, show/hide this `div` based on menu open/closed state */}
					<Transition.Root show={mobileMenuOpen} as={Fragment}>
						<Dialog as="div" className="fixed inset-0 z-40 md:hidden" onClose={setMobileMenuOpen}>
							<Transition.Child
								as={Fragment}
								enter="transition-opacity ease-linear duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="transition-opacity ease-linear duration-300"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<Dialog.Overlay className="hidden sm:block sm:fixed sm:inset-0 sm:bg-gray-600 sm:bg-opacity-75" />
							</Transition.Child>

							<Transition.Child
								as={Fragment}
								enter="transition ease-out duration-150 sm:ease-in-out sm:duration-300"
								enterFrom="transform opacity-0 scale-110 sm:translate-x-full sm:scale-100 sm:opacity-100"
								enterTo="transform opacity-100 scale-100  sm:translate-x-0 sm:scale-100 sm:opacity-100"
								leave="transition ease-in duration-150 sm:ease-in-out sm:duration-300"
								leaveFrom="transform opacity-100 scale-100 sm:translate-x-0 sm:scale-100 sm:opacity-100"
								leaveTo="transform opacity-0 scale-110  sm:translate-x-full sm:scale-100 sm:opacity-100"
							>
								<nav
									className="fixed z-40 inset-0 h-full w-full bg-white sm:inset-y-0 sm:left-auto sm:right-0 sm:max-w-sm sm:w-full sm:shadow-lg"
									aria-label="Global"
								>
									<div className="h-16 flex items-center justify-between px-4 sm:px-6">
										<button
											type="button"
											className="-mr-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
											onClick={() => setMobileMenuOpen(false)}
										>
											<span className="sr-only">Close main menu</span>
											<XIcon className="block h-6 w-6" aria-hidden="true" />
										</button>
									</div>
								</nav>
							</Transition.Child>
						</Dialog>
					</Transition.Root>
				</header>

				{/* Bottom section */}
				<div className="min-h-0 flex-1 flex overflow-hidden">
					{/* Narrow sidebar*/}
					<nav aria-label="Sidebar" className="hidden md:block md:flex-shrink-0 md:bg-gray-800 md:overflow-y-auto">
						<div className="relative w-20 flex flex-col p-3 space-y-3">
							{Object.keys(sidebarNavigation).map((k) => {
								const item = sidebarNavigation[k]

								return (
									<a
										key={item.name}
										href={item.href}
										className={classNames(
											item.current ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-700',
											'flex-shrink-0 inline-flex items-center justify-center h-14 w-14 rounded-lg'
										)}
										onClick={() => handleMenuChange(k, item)}
									>
										<span className="sr-only">{item.name}</span>
										<item.icon className="h-6 w-6" aria-hidden="true" />
									</a>
								)
							})}
						</div>
					</nav>

					{/* Main area */}
					<main className="min-w-0 flex-1 border-t border-gray-200 lg:flex">
						{showCompose && <Compose setAddress={setAddress} setIncentive={setIncentive} setMessage={setMessage} setTitle={setTitle} sendEmail={sendEmail} isSending={isSending} />}
						{showInbox && <Inbox isLoading={isLoading} mailMetadata={mailMetadata} onChainMail={onChainMail} onChainMailAddress={onChainMailAddress} />}
					</main>
				</div>
			</div>
		</>
	)
}

export default Mail