//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/*
The ERC721URIStorage also derives from the ERC721. Since Solidity doesn't have a dependency injection mechanism,
it imports the ERC721 for the second time. Remove the ERC721 contract from being a direct parent of OnChainMail, 
so that the ERC721 is only imported once (as a parent of the ERC721URIStorage).
*/
contract OnChainMail is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct MailDetail {
        bool read;
        //bool encrypted;
        uint256 incentiveInWei;
        address sender;
    }

    mapping(address => uint256[]) public recipientMailIds;
    mapping(address => uint256[]) public senderMailIds;
    mapping(uint256 => MailDetail) public mailDetails;

    constructor() ERC721("On Chain Mail", "OCM") {}

    function sendEmail(address recipient, string memory tokenURI)
        payable
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newMailId = _tokenIds.current();
        _mint(recipient, newMailId);
        _setTokenURI(newMailId, tokenURI);

        recipientMailIds[recipient].push(newMailId);
        senderMailIds[msg.sender].push(newMailId);
        mailDetails[newMailId] = MailDetail(false, msg.value, msg.sender);

        return newMailId;
    }

    function markRead(uint256 tokenId)
        public
        reentrancyCheck checkValidRecipient
    {
        MailDetail storage mailDetail = mailDetails[tokenId];
        mailDetail.read = true;
        (bool sent,) = msg.sender.call{value: mailDetail.incentiveInWei}("");
        require(sent, "Could not process the payout");
    }

//    function reroute(uint256 tokenId, address newRecipient)
//        public
//    {
//        MailDetail storage mailDetail = mailDetails[tokenId];
//        if (mailDetail.read == false) {
//
//        }
//    }

    function purge(uint256 tokenId)
        public
        checkValidRecipient
    {
        // the incentive deposit is refunded to the sender for the unread message
        MailDetail storage mailDetail = mailDetails[tokenId];
        if (!mailDetail.read) {
            (bool sent,) = mailDetail.sender.call{value: mailDetail.incentiveInWei}("");
            require(sent, "Could not process the refund");
        }
        _burn(tokenId);
        // loop & delete from recipientMailIds
    }

    function retract(uint256 tokenId)
        public
    {
        require(ownerOf(tokenId) == msg.sender, "You have to be email sender");

        // the incentive deposit is refunded to the sender for the unread message
        MailDetail storage mailDetail = mailDetails[tokenId];
        require(!mailDetail.read, "Cannot retract read email");
        (bool sent,) = mailDetail.sender.call{value: mailDetail.incentiveInWei}("");
        require(sent, "Could not process the refund");
        _burn(tokenId);

        delete mailDetails[tokenId];
        // loop & delete from recipientMailIds and senderMailIds
    }

    // Modifiers

    bool private reentrancyLock;
    modifier reentrancyCheck() {
        require(!reentrancyLock, "Reentrancy prevented");
        reentrancyLock = true;
        _;
        reentrancyLock = false;
    }

    modifier checkValidRecipient(uint tokenId) {
        require(ownerOf(tokenId) == msg.sender, "You have to be email recipient");
        _;
    }
}
