// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Cruzzer is ERC721, ERC721URIStorage {
    //

    uint nextTokenId;
    NFTDetails[] minted;

    struct NFTDetails {
        address payable owner;
        bool forSale;
        uint price;
        uint tokenId;
        string name;
        string desc;
        string tokenURI;
    }

    event NFTAction(
        address owner,
        bool forSale,
        uint price,
        uint tokenId,
        string name,
        string desc,
        string tokenURI
    );

    constructor() ERC721("Cruzzer", "CRZR") {}

    /**
     *
     * @dev - safely mint an NFT
     *
     */

    function mintToken(
        string memory name,
        string memory desc,
        string memory _tokenURI
    ) external returns (NFTDetails memory) {
        NFTDetails memory nft = createNFTDetails(
            payable(msg.sender),
            name,
            desc,
            0,
            nextTokenId++,
            false,
            _tokenURI
        );

        _mint(msg.sender, nft.tokenId);
        _setTokenURI(nft.tokenId, _tokenURI);

        minted.push(nft);
        emit NFTAction(
            msg.sender,
            false,
            0,
            nft.tokenId,
            name,
            desc,
            _tokenURI
        );

        return nft;
    }

    /**
     *
     * @dev - make an NFT sellable
     *
     */

    function makeNFTSellable(
        uint tokenId,
        uint price
    ) external returns (NFTDetails memory) {
        NFTDetails memory nft = minted[tokenId];

        require(msg.sender == nft.owner, "cannot make non-owned NFT sellable");
        require(nft.forSale == false, "NFT is already listed for sale");
        require(
            price > 0,
            "price must be greater than to successfully list NFT"
        );

        nft.forSale = true;
        nft.price = price;

        minted[tokenId] = nft;
        _transfer(nft.owner, address(this), tokenId);

        return nft;
    }

    /**
     *
     * @dev - make an NFT Non-sellable
     *
     */

    function makeNFTNonSellable(
        uint tokenId
    ) external returns (NFTDetails memory) {
        NFTDetails memory nft = minted[tokenId];

        require(nft.forSale == true, "NFT is already de-listed");
        require(
            msg.sender == nft.owner,
            "cannot make non-owned NFT non-sellable"
        );

        nft.forSale = false;
        nft.price = 0;

        minted[tokenId] = nft;
        _transfer(address(this), msg.sender, tokenId);

        return nft;
    }

    /**
     *
     * @dev - buy an NFT
     *
     */

    function buyNFT(uint tokenId) external payable {
        NFTDetails memory nft = minted[tokenId];

        require(msg.sender != nft.owner, "cannot buy own NFT");
        require(nft.forSale != false, "NFT is not listed for sale");
        require(msg.value == nft.price, "incorrect price amount");

        address seller = nft.owner;

        nft.price = 0;
        nft.forSale = false;
        nft.owner = payable(msg.sender);

        (bool success, bytes memory data) = seller.call{value: msg.value}("");

        delete data;
        minted[tokenId] = nft;

        _transfer(address(this), msg.sender, nft.tokenId);
        require(success, "the payment transaction failed");
    }

    /**
     *
     * @dev - get all NFTs
     *
     */

    function getNFTs() public view returns (NFTDetails[] memory) {
        return minted;
    }

    /**
     */

    function getNextTokendId() public view returns (uint) {
        return nextTokenId;
    }

    /**
     *
     * @dev - create details for an NFT after minting it
     *
     */
    function createNFTDetails(
        address payable owner,
        string memory name,
        string memory desc,
        uint price,
        uint tokenId,
        bool forSale,
        string memory _tokenURI
    ) internal pure returns (NFTDetails memory) {
        NFTDetails memory nft = NFTDetails(
            payable(owner),
            forSale,
            price,
            tokenId,
            name,
            desc,
            _tokenURI
        );
        return nft;
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721) {
        super._increaseBalance(account, value);
    }
}
