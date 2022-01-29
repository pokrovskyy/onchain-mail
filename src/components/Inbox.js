import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { ethers } from 'ethers'
import { GlobeIcon, MailIcon } from '@heroicons/react/solid'

import Message from './Message'

export default function Inbox({ isLoading, mailMetadata, onChainMail, onChainMailAddress }) {
  const [currentMessageIdx, setCurrentMessageIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  const handleMessageOpen = async (metadata, idx) => {
    setOpen(true)

    setCurrentId(metadata.id) 

    setCurrentMessageIdx(idx)
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract to accept incentive / mark read
  async function markRead() {
    console.log("Starting message read flow...")

    let tokenId = ''

    try {
      tokenId = currentId
    }
    catch (error) {
      console.log('Error storing metadata:', error)
    }

    if (typeof window.ethereum !== 'undefined') {
      console.log('Begin accept incentive flow...')
      console.log('Current token id: ', tokenId)
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
    <>
      {/* Primary column */}
      <section
        aria-labelledby="primary-heading"
        className="hidden lg:block min-w-0 flex-1 h-full flex flex-col overflow-y-auto lg:order-last p-3"
      >
        <h1 id="primary-heading" className="sr-only">
          Inbox
        </h1>
        {!isLoading && mailMetadata.length === 0 && <p className="m-5">You have no mail</p>}
        {mailMetadata.length !== 0 && <Message mailMetadata={mailMetadata[currentMessageIdx]} markRead={markRead} />}
      </section>

      {/* Secondary column (hidden on smaller screens) */}
      <aside className="lg:flex-shrink-0 lg:order-first">
        <div className="h-full relative flex flex-col w-full lg:w-96 border-r border-gray-200 bg-gray-100 overflow-y-auto">
          <ul className="divide-y divide-gray-200 overflow-y-auto">
            {isLoading && <p className="m-5">Fetching mail...</p>}
            {!isLoading && mailMetadata.length === 0 && <p className="m-5">You have no mail</p>}
            {mailMetadata.map((data, idx) => {
              return (
                <li key={data.id} className="" onClick={() => { handleMessageOpen(data, idx) }}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-blue-600 truncate">{data.read ? 'Read' : 'New Message'}</p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <MailIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                            from: {data?.sender.substr(0, 9) + "\u2026"}
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
        </div>
      </aside>
      <Transition.Root className="block md:hidden" show={open} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setOpen}>
          <div className="flex items-end justify-center min-h-screen text-center sm:block sm:p-0">
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
              <div className="inline-block align-bottom bg-white px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-screen h-screen">
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
                        From: {mailMetadata[currentMessageIdx]?.sender || 'Unknown'}
                      </p>
                      <br />
                      <p className="text-md text-gray-800">
                        Body: <br />
                        {mailMetadata[currentMessageIdx]?.content || 'No body'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => { markRead(); setOpen(false) }}
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
    </>
  );
}