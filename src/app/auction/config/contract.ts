export const AUCTION_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "address", name: "_owner", type: "address" },
      { internalType: "address", name: "_payoutAddress", type: "address" },
      { internalType: "uint256", name: "_maxAuctions", type: "uint256" },
      { internalType: "uint256", name: "_auctionDuration", type: "uint256" },
      { internalType: "uint256", name: "_restDuration", type: "uint256" },
      { internalType: "uint256", name: "_restInterval", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { inputs: [], name: "AuctionAlreadySettled", type: "error" },
  { inputs: [], name: "AuctionNotActive", type: "error" },
  { inputs: [], name: "AuctionNotEnded", type: "error" },
  { inputs: [], name: "AuctionNotStarted", type: "error" },
  { inputs: [], name: "AuctionStillActive", type: "error" },
  { inputs: [], name: "BidTooLow", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "ERC721IncorrectOwner",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "ERC721InsufficientApproval",
    type: "error",
  },
  { inputs: [{ internalType: "address", name: "approver", type: "address" }], name: "ERC721InvalidApprover", type: "error" },
  { inputs: [{ internalType: "address", name: "operator", type: "address" }], name: "ERC721InvalidOperator", type: "error" },
  { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "ERC721InvalidOwner", type: "error" },
  { inputs: [{ internalType: "address", name: "receiver", type: "address" }], name: "ERC721InvalidReceiver", type: "error" },
  { inputs: [{ internalType: "address", name: "sender", type: "address" }], name: "ERC721InvalidSender", type: "error" },
  { inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }], name: "ERC721NonexistentToken", type: "error" },
  { inputs: [], name: "InvalidAuctionDuration", type: "error" },
  { inputs: [], name: "InvalidMaxAuctions", type: "error" },
  { inputs: [], name: "InvalidPayoutAddress", type: "error" },
  { inputs: [], name: "InvalidTokenURI", type: "error" },
  { inputs: [], name: "MaxAuctionsReached", type: "error" },
  { inputs: [], name: "MissingTokenURI", type: "error" },
  { inputs: [{ internalType: "address", name: "owner", type: "address" }], name: "OwnableInvalidOwner", type: "error" },
  { inputs: [{ internalType: "address", name: "account", type: "address" }], name: "OwnableUnauthorizedAccount", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  { inputs: [], name: "TokenURIAlreadySet", type: "error" },
  { inputs: [], name: "TokenURINotSet", type: "error" },
  { inputs: [], name: "TransferFailed", type: "error" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "approved", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "operator", type: "address" },
      { indexed: false, internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "auctionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "winner", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "AuctionSettled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "auctionId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "endTime", type: "uint256" },
    ],
    name: "AuctionStarted",
    type: "event",
  },
  { anonymous: false, inputs: [], name: "AuctionsCompleted", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "_fromTokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "_toTokenId", type: "uint256" },
    ],
    name: "BatchMetadataUpdate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "auctionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "BidPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "auctionId", type: "uint256" },
      { indexed: true, internalType: "address", name: "bidder", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "BidRefunded",
    type: "event",
  },
  { anonymous: false, inputs: [{ indexed: false, internalType: "uint256", name: "_tokenId", type: "uint256" }], name: "MetadataUpdate", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "previousOwner", type: "address" },
      { indexed: true, internalType: "address", name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  { anonymous: false, inputs: [{ indexed: false, internalType: "uint256", name: "nextAuctionStartTime", type: "uint256" }], name: "RestScheduled", type: "event" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  { stateMutability: "payable", type: "fallback" },
  { inputs: [], name: "AUCTION_DURATION", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "MAX_AUCTIONS", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "REST_DURATION", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "REST_INTERVAL", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "allAuctionIds",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "auctionActive", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "", type: "uint256" },
      { internalType: "uint256", name: "", type: "uint256" },
    ],
    name: "auctionBids",
    outputs: [
      { internalType: "address", name: "bidder", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "auctions",
    outputs: [
      { internalType: "uint256", name: "auctionId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "address", name: "highestBidder", type: "address" },
      { internalType: "uint256", name: "highestBid", type: "uint256" },
      { internalType: "bool", name: "settled", type: "bool" },
      { internalType: "bool", name: "exists", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "auctionsSinceLastRest", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "canSettleAuction", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "currentAuctionId", outputs: [{ internalType: "uint256", name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "genesisStarted", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getAllAuctionIds", outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getApproved",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "auctionId", type: "uint256" }],
    name: "getAuctionBids",
    outputs: [
      {
        components: [
          { internalType: "address", name: "bidder", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
        ],
        internalType: "struct DailyAuctionNFT.Bid[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentAuction",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "auctionId", type: "uint256" },
          { internalType: "uint256", name: "tokenId", type: "uint256" },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "address", name: "highestBidder", type: "address" },
          { internalType: "uint256", name: "highestBid", type: "uint256" },
          { internalType: "bool", name: "settled", type: "bool" },
          { internalType: "bool", name: "exists", type: "bool" },
        ],
        internalType: "struct DailyAuctionNFT.Auction",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentAuctionView",
    outputs: [
      { internalType: "uint256", name: "auctionId", type: "uint256" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "address", name: "highestBidder", type: "address" },
      { internalType: "uint256", name: "highestBid", type: "uint256" },
      { internalType: "bool", name: "settled", type: "bool" },
      { internalType: "bool", name: "exists", type: "bool" },
      { internalType: "bool", name: "isAuctionActive", type: "bool" },
      { internalType: "bool", name: "hasStarted", type: "bool" },
      { internalType: "bool", name: "hasEnded", type: "bool" },
      { internalType: "bool", name: "canSettleNow", type: "bool" },
      { internalType: "bool", name: "nextTokenUriSeeded", type: "bool" },
      { internalType: "uint256", name: "totalBids", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "isApprovedForAll", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "isNextTokenUriSeeded", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ internalType: "address", name: "wallet", type: "address" }], name: "isWinner", outputs: [{ internalType: "bool", name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "owner", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "payoutAddress", outputs: [{ internalType: "address", name: "", type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "placeBid", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "settleAuction", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [], name: "startGenesisAuction", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    inputs: [
      { internalType: "uint256", name: "tokenId", type: "uint256" },
      { internalType: "string", name: "uri", type: "string" },
    ],
    name: "setTokenURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [], name: "symbol", outputs: [{ internalType: "string", name: "", type: "string" }], stateMutability: "view", type: "function" },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "tokenId", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [{ internalType: "address", name: "newOwner", type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ internalType: "address", name: "newPayoutAddress", type: "address" }], name: "updatePayoutAddress", outputs: [], stateMutability: "nonpayable", type: "function" },
  { stateMutability: "payable", type: "receive" },
] as const;

// Contract configuration
export const AUCTION_CONTRACT_CONFIG = {
  address: (process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS as `0x${string}`) || "0x",
  abi: AUCTION_CONTRACT_ABI,
} as const;

// Auction type based on the new contract structure
export interface Auction {
  auctionId: bigint;
  tokenId: bigint;
  startTime: bigint;
  endTime: bigint;
  highestBidder: `0x${string}`;
  highestBid: bigint;
  settled: boolean;
  exists: boolean;
}

// Bid type
export interface Bid {
  bidder: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}
