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
    }

    mapping(address => uint256) public recipientMailIds;
    mapping(address => uint256) public senderMailIds;
    mapping(uint256 => MailDetail) public mailDetails;

    constructor() ERC721("On Chain Mail", "OCM") {}

    function sendEmail(address recipient, bool encrypted, string memory tokenURI)
        payable
        public
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newMailId = _tokenIds.current();
        _mint(recipient, newMailId);
        _setTokenURI(newMailId, tokenURI);

        recipientMailIds[recipient] = newMailId;
        senderMailIds[msg.sender] = newMailId;
        mailDetails[newMailId] = MailDetail(false, encrypted, msg.value);

        return newMailId;
    }

    function markRead(uint256 tokenId)
        payable
        public
    {
        MailDetail storage mailDetail = mailDetails[tokenId];
        mailDetail.read = true;

        // transfer incentives to the recipient
    }

    function reroute(uint256 tokenId, address newRecipient)
        public
    {
        MailDetail storage mailDetail = mailDetails[tokenId];
        if (mailDetail.read == false) {
            
        }
    }

    function purge(uint256 tokenId)
        payable
        public
    {
        _burn(tokenId);

        // the incentive deposit is refunded to the sender for the unread message
        MailDetail storage mailDetail = mailDetails[tokenId];
        if (mailDetail.read == false) {
            
        }
    }

    function retract(uint256 tokenId)
        public
    {

    }
}
