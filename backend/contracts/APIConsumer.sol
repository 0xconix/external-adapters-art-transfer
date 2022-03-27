// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.7; 
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "./VanGogh.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/** * Request testnet LINK and ETH here: https://faucets.chain.link/ * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/ */ /** * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY. * PLEASE DO NOT USE THIS CODE IN PRODUCTION. */ 
contract APIConsumer is ChainlinkClient { 
    using Chainlink for Chainlink.Request; 
    
    bytes32 public volume; 
    uint256 public season;
    address private oracle; 
    bytes32 private jobId; uint256 private fee; 


    mapping (bytes32 => address) requestIdToAddress;
    mapping (string => uint256) filters_count;

    constructor() { setChainlinkToken(0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846); 
    oracle = 0xBA875f69d7e7773eD05bd11C75b3Fe9Bfbb5E197; 
    jobId = "4c932108df32453088616ba8e70c45d0";
    
    fee = 0.01 * 10 ** 18;  
    } 


    /** * Create a Chainlink request to retrieve API response, find the target * data, then multiply by 1000000000000000000 (to remove decimal places from data). */ 
    function requestArtTranfert(string calldata _uriOriginal) external returns (bytes32) { 
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector); 
        request.add("url", _uriOriginal);
        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestIdToAddress[requestId] = msg.sender;
        return requestId;
        } 
        /** * Receive the response in the form of uint256 */ 

    function fulfill(bytes32 _requestId, bytes memory filter, bytes memory url) public recordChainlinkFulfillment(_requestId) { 
            
            address sender = requestIdToAddress[_requestId];
            filters_count[string(filter)]++; 
            safeMintFromContract(sender, string(url));
        }
    
    function getfilter(string memory filter) public view returns (uint256){
        return filters_count[filter];
    }

    function safeMintFromContract(address to, string memory uri) public {
	// For the POC, the address is directly encoded
        VanGogh _vangogh = VanGogh(0xA0efC0d131cC7BA6C9017BAA7F2d06ee3c50F8d9);
        _vangogh.safeMint(to, uri);
    }
}
