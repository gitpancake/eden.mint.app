# Rolling NFT Auction Frontend

A modern, responsive Next.js frontend for a rolling NFT auction system built with TypeScript, Tailwind CSS, and wagmi.

## 🎯 Features

### Core Auction Functionality

- **Live Auction Display**: Real-time auction card showing current NFT, highest bid, and countdown timer
- **Smart Bidding**: Automatic validation, minimum bid calculations, and user-friendly bidding interface
- **Real-time Updates**: Contract event listening for instant updates on bids, refunds, and auction settlements
- **Countdown Timer**: Visual countdown with urgency indicators and progress bar

### User Experience

- **Wallet Integration**: RainbowKit integration with network switching and balance display
- **Notification System**: Toast notifications for bids, refunds, wins, and auction events
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Theme**: Modern gradient background with glassmorphism effects

### Dashboard Features

- **User Dashboard**: View owned NFTs, current bids, and account overview
- **Auction History**: Browse past auctions with winner information and bid history
- **Transaction Activity**: Real-time activity feed with transaction status

## 🛠 Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **wagmi** for Ethereum interactions
- **viem** for low-level Ethereum utilities
- **RainbowKit** for wallet connections
- **SWR** for server-side data fetching and caching

## ⚙️ Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# RPC URL for Base Sepolia
NEXT_PUBLIC_RPC_URL=https://base-sepolia.g.allthatnode.com/archive/evm/7240935353c842e89d9a3d159d1fba64

# Auction Contract Address
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0xE000F263b1EF8E434Cd7191Abb2aF9ba6918DD50

# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here

# NFT Base URI (optional, defaults to current domain)
NEXT_PUBLIC_NFT_BASE_URI=
```

### Environment Variable Details

- `NEXT_PUBLIC_RPC_URL`: Base Sepolia RPC endpoint URL (used for all contract interactions)
- `NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS`: The deployed auction contract address
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID for wallet connections
- `NEXT_PUBLIC_NFT_BASE_URI`: Base URI for NFT metadata (optional)

## 📁 Project Structure

```
src/app/auction/
├── page.tsx                    # Main auction page with tab navigation
├── components/
│   ├── AuctionCard.tsx        # Main auction display component
│   ├── BidForm.tsx            # Bidding interface with validation
│   ├── CountdownTimer.tsx     # Animated countdown timer
│   ├── NFTPreview.tsx         # NFT metadata display
│   ├── AuctionHistory.tsx     # Historical auction browser
│   ├── UserDashboard.tsx      # User account and NFT overview
│   ├── WalletConnect.tsx      # Custom wallet connection UI
│   ├── Notification.tsx       # Toast notification system
│   └── LoadingSpinner.tsx     # Loading states and skeletons
├── hooks/
│   └── useAuctionEvents.ts    # Contract event listening hooks
└── config/
    └── contract.ts            # Contract ABI and configuration
```

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# Wallet Connect Project ID (required for RainbowKit)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here

# Auction Contract Address (Base Sepolia testnet)
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890

# Base URI for NFT metadata (should match contract baseURI)
NEXT_PUBLIC_NFT_BASE_URI=https://your-domain.com/public
```

### 2. Contract Deployment

Deploy the `DailyAuctionNFT` contract to Base Sepolia with:

- Name: Your collection name
- Symbol: Your collection symbol
- Block cycle duration: 25 (blocks, ~5 minutes on Base)
- Auction duration: 300 (seconds, 5 minutes)
- Base URI: Your metadata endpoint

### 3. NFT Metadata

Ensure your metadata follows the structure:

```
/public/1/metadata.json
/public/2/metadata.json
etc.
```

Each metadata.json should contain:

```json
{
  "name": "NFT Name",
  "description": "NFT Description",
  "image": "https://your-image-url.com/image.png",
  "external_url": "https://your-website.com",
  "attributes": [
    {
      "trait_type": "Artist",
      "value": "Artist Name"
    }
  ]
}
```

### 4. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 How Rolling Auctions Work

1. **Fixed Duration**: All auctions run for exactly 15 minutes from start time
2. **Automatic Settlement**: Auctions automatically settle when expired, starting new ones
3. **Automatic Refunds**: Previous bidders are automatically refunded when outbid
4. **Winner Claims**: Winners can claim their NFT at any time after auction ends
5. **Seamless Transitions**: New auctions begin automatically after previous ones settle

## 🔧 Key Components

### AuctionCard

The main auction display showing:

- NFT preview with metadata
- Current highest bid and bidder
- Countdown timer with visual urgency
- Live auction status indicators

### BidForm

Smart bidding interface with:

- Minimum bid validation
- Wallet connection checking
- Transaction status tracking
- Success/error feedback

### CountdownTimer

Animated countdown with:

- Color-coded urgency (green → orange → red)
- Progress bar visualization
- Status messages for different auction states

### Notification System

Toast notifications for:

- Successful bid placement
- Being outbid with automatic refunds
- Winning auctions
- New auction announcements

## 🎯 User Flow

1. **Connect Wallet**: Users connect via RainbowKit
2. **View Auction**: See current NFT and auction details
3. **Place Bid**: Enter bid amount and confirm transaction
4. **Real-time Updates**: See live bid updates and notifications
5. **Win & Claim**: Winners claim NFT to mint and start next auction
6. **View History**: Browse past auctions and owned NFTs

## 🔐 Security Features

- **Input Validation**: All bid amounts validated client and contract-side
- **Automatic Refunds**: No manual claiming needed for outbid users
- **Reentrancy Protection**: Contract uses OpenZeppelin's ReentrancyGuard
- **Error Handling**: Comprehensive error messages and fallback states

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile viewing and interaction
- **Touch Friendly**: Large buttons and touch targets
- **Adaptive Layout**: Grid layouts that work on all screen sizes
- **Performance**: Optimized images and lazy loading

## 🎨 Design System

- **Colors**: Purple/slate gradient with glassmorphism effects
- **Typography**: Clean, readable fonts with proper contrast
- **Animations**: Smooth transitions and micro-interactions
- **Icons**: Emoji-based icons for universal recognition

## 🚨 Error Handling

The app handles various error states:

- **Network Issues**: Retry mechanisms and user feedback
- **Transaction Failures**: Clear error messages with suggested actions
- **Loading States**: Skeleton screens and loading indicators
- **Wallet Issues**: Connection prompts and network switching

## 🔄 Real-time Features

- **Contract Events**: Live listening for blockchain events
- **Auto Refresh**: Periodic data refreshing
- **WebSocket Ready**: Architecture supports WebSocket integration
- **Optimistic Updates**: Immediate UI updates with rollback capability

## 📊 Performance

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Next.js image optimization
- **Caching**: Smart caching of contract reads
- **Bundle Size**: Optimized for fast loading

This auction frontend provides a complete, production-ready interface for rolling NFT auctions with excellent user experience and robust error handling.
