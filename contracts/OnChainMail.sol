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
        bool encrypted;
        uint256 incentiveInWei;
        address sender;
    }

    mapping(address => uint256[]) public receivedMailIds; // inbox
    mapping(address => uint256[]) public sentMailIds; // sent mail
    mapping(uint256 => MailDetail) public mailDetails; // email data

    constructor() ERC721("On Chain Mail", "OCM") {}

    function sendEmail(
        address recipient,
        bool encrypted,
        string memory tokenURI
    ) public payable returns (uint256) {
        _tokenIds.increment();

        uint256 newMailId = _tokenIds.current();
        _mint(recipient, newMailId);
        _setTokenURI(newMailId, tokenURI);

        receivedMailIds[recipient].push(newMailId);
        sentMailIds[msg.sender].push(newMailId);
        mailDetails[newMailId] = MailDetail(
            false,
            encrypted,
            msg.value,
            msg.sender
        );

        return newMailId;
    }

    function markRead(uint256 tokenId)
        public
        reentrancyCheck
        checkTokenExists(tokenId)
        checkIsRecipient(tokenId)
    {
        MailDetail storage mailDetail = mailDetails[tokenId];
        mailDetail.read = true;
        (bool sent, ) = msg.sender.call{value: mailDetail.incentiveInWei}("");
        require(sent, "Could not process the payout");
    }

    function reroute(uint256 tokenId, address newRecipient)
        public
        checkTokenExists(tokenId)
        checkIsSender(tokenId)
    {
        MailDetail storage mailDetail = mailDetails[tokenId];
        require(!mailDetail.encrypted, "Cannot reroute encrypted mail");
        require(!mailDetail.read, "Cannot reroute read mail");
        require(
            ownerOf(tokenId) != newRecipient,
            "New recipient should differ from the current"
        );
        // transfer the token (base ERC721)
        _transfer(ownerOf(tokenId), newRecipient, tokenId);
        // update inboxes
        _deleteFromReceivedEmails(ownerOf(tokenId), tokenId);
        receivedMailIds[newRecipient].push(tokenId);
    }

    function purge(uint256 tokenId) public checkTokenExists(tokenId) {
        MailDetail storage mailDetail = mailDetails[tokenId];
        require(
            mailDetail.sender == msg.sender || ownerOf(tokenId) == msg.sender,
            "Have to be either a sender or a receiver"
        );

        if (mailDetail.sender == msg.sender)
            // sender purges from their sent mail
            _deleteFromSentEmails(mailDetail.sender, tokenId);
        else {
            // receiver purges from their inbox
            if (!mailDetail.read) {
                // the incentive deposit is refunded to the sender for the unread message
                (bool sent, ) = mailDetail.sender.call{
                    value: mailDetail.incentiveInWei
                }("");
                require(sent, "Could not process the refund");
            }
            _deleteFromReceivedEmails(ownerOf(tokenId), tokenId);
            _burn(tokenId);
        }
    }

    function retract(uint256 tokenId)
        public
        checkTokenExists(tokenId)
        checkIsSender(tokenId)
    {
        // the incentive deposit is refunded to the sender for the unread message
        MailDetail storage mailDetail = mailDetails[tokenId];
        require(!mailDetail.read, "Cannot retract read email");
        (bool sent, ) = mailDetail.sender.call{
            value: mailDetail.incentiveInWei
        }("");
        require(sent, "Could not process the refund");

        _deleteFromReceivedEmails(ownerOf(tokenId), tokenId);
        _deleteFromSentEmails(mailDetail.sender, tokenId);
        delete mailDetails[tokenId];
        _burn(tokenId);
    }

    function receivedMailCount(address addr) external view returns (uint256) {
        return receivedMailIds[addr].length;
    }

    function sentMailCount(address addr) external view returns (uint256) {
        return sentMailIds[addr].length;
    }

    // Modifiers

    bool private reentrancyLock;
    modifier reentrancyCheck() {
        require(!reentrancyLock, "Reentrancy prevented");
        reentrancyLock = true;
        _;
        reentrancyLock = false;
    }

    modifier checkIsRecipient(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender,
            "You have to be email recipient"
        );
        _;
    }

    modifier checkIsSender(uint256 tokenId) {
        require(
            mailDetails[tokenId].sender == msg.sender,
            "You have to be email sender"
        );
        _;
    }

    modifier checkTokenExists(uint256 tokenId) {
        require(
            tokenId > 0 && tokenId <= _tokenIds.current(),
            "Non-existent email"
        );
        _;
    }

    // Private functions

    function _deleteFromReceivedEmails(address addr, uint256 tokenId) private {
        _deleteTokenFromArray(receivedMailIds[addr], tokenId);
    }

    function _deleteFromSentEmails(address addr, uint256 tokenId) private {
        _deleteTokenFromArray(sentMailIds[addr], tokenId);
    }

    function _deleteTokenFromArray(uint256[] storage arr, uint256 tokenId)
        private
    {
        for (uint256 i = 0; i < arr.length; i++)
            if (arr[i] == tokenId) {
                // delete only nullifies so need to pop from array to resize it
                arr[i] = arr[arr.length - 1];
                arr.pop();
                return;
            }
    }
}
