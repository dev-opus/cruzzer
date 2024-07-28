// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Cruzzer is ERC721, ERC721URIStorage, ERC721Enumerable, ReentrancyGuard, Ownable {
    uint public nextTokenId = 1;
    NFTDetails[] public minted;
    mapping(uint => address) public originalCreators;
    mapping(uint => uint) public royalties; // Token ID => Royalty percentage

    struct NFTDetails {
        address payable owner;
        bool forSale;
        uint price;
        uint tokenId;
        string name;
        string desc;
        string tokenURI;
    }

    event NFTAction(address indexed owner, bool forSale, uint price, uint tokenId);
    event RoyaltyPaid(address indexed creator, uint amount);
    event AuctionStarted(uint tokenId, uint startingPrice);
    event AuctionBid(uint tokenId, address indexed bidder, uint amount);
    event AuctionEnded(uint tokenId, address winner, uint amount);

    struct Auction {
        address payable seller;
        uint startingPrice;
        uint highestBid;
        address payable highestBidder;
        bool isActive;
        uint endTime;
    }

    mapping(uint => Auction) public auctions;

    constructor() ERC721("Cruzzer", "CRZR") {}

    /**
     * @dev Safely mint an NFT with royalty
     */
    function mintToken(
        string memory name,
        string memory desc,
        string memory _tokenURI,
        uint royalty
    ) external returns (NFTDetails memory) {
        require(royalty <= 100, "Royalty too high");
        uint tokenId = nextTokenId++;
        NFTDetails memory nft = NFTDetails(
            payable(msg.sender),
            false,
            0,
            tokenId,
            name,
            desc,
            _tokenURI
        );

        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        originalCreators[tokenId] = msg.sender;
        royalties[tokenId] = royalty;

        minted.push(nft);
        emit NFTAction(msg.sender, false, 0, tokenId);

        return nft;
    }

    /**
     * @dev Make an NFT sellable
     */
    function makeNFTSellable(uint tokenId, uint price) external nonReentrant returns (NFTDetails memory) {
        require(tokenId < nextTokenId, "Invalid tokenId");
        NFTDetails storage nft = minted[tokenId];

        require(msg.sender == nft.owner, "Cannot make non-owned NFT sellable");
        require(!nft.forSale, "NFT is already listed for sale");
        require(price > 0, "Price must be greater than zero to list NFT");

        nft.forSale = true;
        nft.price = price;

        _transfer(nft.owner, address(this), tokenId);

        emit NFTAction(nft.owner, true, price, tokenId);
        return nft;
    }

    /**
     * @dev Make an NFT non-sellable
     */
    function makeNFTNonSellable(uint tokenId) external nonReentrant returns (NFTDetails memory) {
        require(tokenId < nextTokenId, "Invalid tokenId");
        NFTDetails storage nft = minted[tokenId];

        require(nft.forSale, "NFT is already de-listed");
        require(msg.sender == nft.owner, "Cannot make non-owned NFT non-sellable");

        nft.forSale = false;
        nft.price = 0;

        _transfer(address(this), msg.sender, tokenId);

        emit NFTAction(nft.owner, false, 0, tokenId);
        return nft;
    }

    /**
     * @dev Buy an NFT
     */
    function buyNFT(uint tokenId) external payable nonReentrant {
        require(tokenId < nextTokenId, "Invalid tokenId");
        NFTDetails storage nft = minted[tokenId];

        require(msg.sender != nft.owner, "Cannot buy own NFT");
        require(nft.forSale, "NFT is not listed for sale");
        require(msg.value == nft.price, "Incorrect price amount");

        address payable seller = nft.owner;

        // Calculate royalty and transfer to original creator
        uint royaltyAmount = (msg.value * royalties[tokenId]) / 100;
        uint sellerAmount = msg.value - royaltyAmount;

        nft.forSale = false;
        nft.price = 0;
        nft.owner = payable(msg.sender);

        _transfer(address(this), msg.sender, tokenId);

        (bool success, ) = seller.call{value: sellerAmount}("");
        require(success, "The payment transaction failed");

        (success, ) = originalCreators[tokenId].call{value: royaltyAmount}("");
        require(success, "The royalty payment failed");

        emit RoyaltyPaid(originalCreators[tokenId], royaltyAmount);
        emit NFTAction(nft.owner, false, 0, tokenId);
    }

    /**
     * @dev Start an auction for an NFT
     */
    function startAuction(uint tokenId, uint startingPrice, uint duration) external nonReentrant {
        require(tokenId < nextTokenId, "Invalid tokenId");
        NFTDetails storage nft = minted[tokenId];

        require(msg.sender == nft.owner, "Only owner can start auction");
        require(!nft.forSale, "Cannot auction a listed NFT");

        Auction memory auction = Auction({
            seller: payable(msg.sender),
            startingPrice: startingPrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            isActive: true,
            endTime: block.timestamp + duration
        });

        auctions[tokenId] = auction;
        _transfer(nft.owner, address(this), tokenId);

        emit AuctionStarted(tokenId, startingPrice);
    }

    /**
     * @dev Place a bid on an active auction
     */
    function placeBid(uint tokenId) external payable nonReentrant {
        Auction storage auction = auctions[tokenId];

        require(auction.isActive, "Auction is not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.value > auction.highestBid, "Bid is not higher than current highest bid");

        if (auction.highestBidder != address(0)) {
            (bool success, ) = auction.highestBidder.call{value: auction.highestBid}("");
            require(success, "Refund to previous highest bidder failed");
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit AuctionBid(tokenId, msg.sender, msg.value);
    }

    /**
     * @dev End an active auction and transfer the NFT to the highest bidder
     */
    function endAuction(uint tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];

        require(auction.isActive, "Auction is not active");
        require(block.timestamp >= auction.endTime, "Auction is still ongoing");
        require(msg.sender == auction.seller, "Only seller can end the auction");

        auction.isActive = false;

        if (auction.highestBidder != address(0)) {
            uint royaltyAmount = (auction.highestBid * royalties[tokenId]) / 100;
            uint sellerAmount = auction.highestBid - royaltyAmount;

            (bool success, ) = auction.seller.call{value: sellerAmount}("");
            require(success, "Payment to seller failed");

            (success, ) = originalCreators[tokenId].call{value: royaltyAmount}("");
            require(success, "Royalty payment failed");

            _transfer(address(this), auction.highestBidder, tokenId);
            minted[tokenId].owner = auction.highestBidder;

            emit RoyaltyPaid(originalCreators[tokenId], royaltyAmount);
            emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
        } else {
            _transfer(address(this), auction.seller, tokenId);
        }
    }

    /**
     * @dev Update metadata of an NFT
     */
    function updateMetadata(uint tokenId, string memory newTokenURI) external {
        require(tokenId < nextTokenId, "Invalid tokenId");
        require(msg.sender == minted[tokenId].owner, "Only owner can update metadata");

        minted[tokenId].tokenURI = newTokenURI;
        _setTokenURI(tokenId, newTokenURI);

        emit NFTAction(msg.sender, minted[tokenId].forSale, minted[tokenId].price, tokenId);
    }

    /**
     * @dev Batch mint NFTs
     */
    function batchMintToken(
        string[] memory names,
        string[] memory descs,
        string[] memory tokenURIs,
        uint[] memory royalties
    ) external {
        require(names.length == descs.length && descs.length == tokenURIs.length && tokenURIs.length == royalties.length, "Array length mismatch");

        for (uint i = 0; i < names.length; i++) {
            mintToken(names[i], descs[i], tokenURIs[i], royalties[i]);
        }
    }

    /**
     * @dev Withdraw contract funds (if any)
     */
    function withdrawFunds() external onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @dev Override functions for ERC721Enumerable and ERC721URIStorage
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
