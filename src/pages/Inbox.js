import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'
import { GlobeIcon, MailIcon } from '@heroicons/react/solid'

import { getMessageData } from '../utils/metadata'

export default function Inbox({ isLoading, mailMetadata, onChainMail, onChainMailAddress }) {
  const [messageOpen, setMessageOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState(null)
  const [open, setOpen] = useState(false)

  const handleMessageOpen = async (metadata) => {
    setOpen(true)

    let messageData = {};

    try {
      messageData = await getMessageData(metadata.tokenURI)
      console.log('Message', messageData)
    }
    catch (e) {
      console.log('Error getting message:', e)
    }

    setCurrentMessage(messageData)
  }

  const handleMessageClose = () => {
    setOpen(false)
  }

  // request access to the user's MetaMask account
	async function requestAccount() {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
	}

  // call the smart contract to accept incentive / mark read
	async function markRead(event) {
		event.preventDefault()
		console.log("markRead()")
		
    let tokenId = ''

    try {
			tokenId = 0 // REPLACE to read mailId of the current token; await
		}
		catch (error) {
			console.log('Error storing metadata:', error)
		}

		if (typeof window.ethereum !== 'undefined') {
			console.log('Begin accept incentive flow...')
			await requestAccount()
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner()
			const contract = new ethers.Contract(onChainMailAddress, onChainMail.abi, signer)

			try {
				const readTransaction = await contract.markRead(tokenId)
				await readTransaction.wait()
				console.log('Marked read:', readTransaction)
			}
			catch (error) {
				console.log('Error marking read:', error)
        console.log('Error with token ID:', tokenId) // to comment out later
			}
		}
	}

  return (
    <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 overflow-y-auto">
          {isLoading && <p className="m-5">Fetching mail...</p>}
          {!isLoading && mailMetadata.length === 0 && <p className="m-5">You have no mail</p>}
          {mailMetadata.map(data => {
            return (
              <li key={data.id} onClick={() => handleMessageOpen(data)}>
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-600 truncate">{data.read ? 'Read' : 'New Message'}</p>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <MailIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                          from: {data.sender}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <GlobeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        <p>
                          Incentive: {ethers.utils.formatEther(data.incentiveInWei)} ETH
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Title
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-md text-gray-800">
                          From: {currentMessage?.sender || 'Unknown'}
                        </p>
                        <br />
                        <p className="text-md text-gray-800">
                          Body: <br />
                          {currentMessage?.content || 'No body'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => {markRead() ;setOpen(false)}}
                    >
                      Accept Incentive
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  );
}