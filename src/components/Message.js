import { useState } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

import Spinner from './Spinner'
import { getMessageData } from '../utils/metadata'

const Message = ({ mailMetadata, markRead }) => {
	const [isMessageLoading, setIsMessageLoading] = useState(false)
	const [accepted, setAccepted] = useState({}) // map of <tokenURI, accepted> accepted messages
	const [messageData, setMessageData] = useState({})

	const fetchMessageData = async () => {
		console.log('Fetching message...')
		let messageData = {};

		setIsMessageLoading(true)

		try {
			messageData = await getMessageData(mailMetadata.tokenURI)
			console.log('Message', messageData)
		}
		catch (e) {
			console.log('Error getting message:', e)
			toast.error('Error fetching message. Please try again.')
		}
		finally {
			setIsMessageLoading(false)
		}

		setMessageData(messageData)
	}

	const handleAcceptIncentive = (tokenURI) => {
		if (tokenURI) {
			const newAccepted = { ...accepted }

			newAccepted[tokenURI] = true

			setAccepted(newAccepted)
		}

		fetchMessageData()

		if (!mailMetadata.read) {
			markRead()
		}
	}

	return (
		<div className="bg-white shadow overflow-hidden sm:rounded-lg">
			<div className="flex justify-between px-4 py-5 sm:px-6">
				<div>
					<h3 className="text-lg leading-6 font-medium text-gray-900">Subject: {messageData?.title || (mailMetadata?.read ? '<No Subject>' : '<Pending read>')}</h3>
				</div>
			</div>
			<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
				<dl className="sm:divide-y sm:divide-gray-200">
					<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">From:</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{mailMetadata.sender}</dd>
					</div>
					<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">Incentive:</dt>
						<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ethers.utils.formatEther(mailMetadata.incentiveInWei)} ETH</dd>
					</div>
					{!accepted[mailMetadata.tokenURI] && <div className="flex justify-end py-4 sm:py-5 sm:px-6">
						<button
							type="button"
							className="w-full ml-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
							onClick={() => handleAcceptIncentive(mailMetadata?.tokenURI || null)}
						>
							{!mailMetadata?.read ? 'Accept Incentive' : 'Read Message'}
						</button>
					</div>}
					{accepted[mailMetadata.tokenURI] && <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
						<dt className="text-sm font-medium text-gray-500">Message</dt>
						{!isMessageLoading && <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
							{messageData?.content || 'No message present'}
						</dd>}
						{isMessageLoading && <Spinner />}
						{isMessageLoading && <p>This may take a while...</p>}
					</div>}
				</dl>
			</div>
		</div>
	)
}

export default Message