// Web3 service - Mock implementation for demo (ethers package not available)
// In production, would use: import { ethers } from 'ethers';

interface EthersLike {
  Wallet: {
    createRandom(): { address: string };
  };
};

// Mock ethers object for demo purposes
const ethers: EthersLike = {
  Wallet: {
    createRandom() {
      return {
        address: `0x${Math.random().toString(16).substr(2, 40)}`
      };
    }
  }
};

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  eventId: string;
  participantAddress: string;
  achievementType: 'participation' | 'winner' | 'judge' | 'organizer';
  dateIssued: string;
}

interface POAPData {
  eventId: string;
  participantName: string;
  participantEmail: string;
  role: 'participant' | 'judge' | 'organizer' | 'winner';
  achievementTitle: string;
  rank?: number;
  walletAddress?: string;
}

export class Web3Service {
  private provider: any | null = null;
  private wallet: any | null = null;
  private contractAddress: string;
  private contractABI = [
    // ERC721 standard functions
    "function safeMint(address to, uint256 tokenId, string memory uri) public",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)",
    // Custom POAP functions
    "function mintPOAP(address to, string memory eventId, string memory role) public returns (uint256)",
    "function getEventPOAPs(string memory eventId) public view returns (uint256[])",
    "event POAPMinted(address indexed to, uint256 indexed tokenId, string eventId, string role)"
  ];

  constructor() {
    this.contractAddress = process.env.WEB3_CONTRACT_ADDRESS || '';
    
    // Mock initialization for demo
    // In production: this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.provider = { connected: true };
    
    // Mock wallet for demo
    this.wallet = { address: '0x742d35Cc6482C42FB0b2C23E04E0Af6BBAE0A59F' };
  }

  /**
   * Check if Web3 is properly configured
   */
  isConfigured(): boolean {
    return !!(this.provider && this.wallet && this.contractAddress);
  }

  /**
   * Generate NFT metadata for POAP
   */
  private generateNFTMetadata(poapData: POAPData): NFTMetadata {
    const achievements = {
      participant: { title: 'Hackathon Participant', rarity: 'Common' },
      winner: { title: 'Hackathon Winner', rarity: 'Legendary' },
      judge: { title: 'Hackathon Judge', rarity: 'Rare' },
      organizer: { title: 'Hackathon Organizer', rarity: 'Epic' }
    };

    const achievement = achievements[poapData.role];

    return {
      name: `${poapData.achievementTitle} - ${achievement.title}`,
      description: `Proof of Participation (POAP) for ${poapData.participantName} in the hackathon event. This NFT represents ${poapData.role === 'winner' ? 'winning achievement' : 'valuable contribution'} to the innovation community.`,
      image: this.generatePOAPImage(poapData),
      attributes: [
        { trait_type: 'Role', value: poapData.role },
        { trait_type: 'Event ID', value: poapData.eventId },
        { trait_type: 'Participant', value: poapData.participantName },
        { trait_type: 'Achievement Level', value: achievement.rarity },
        { trait_type: 'Date Issued', value: new Date().toISOString() },
        ...(poapData.rank ? [{ trait_type: 'Rank', value: poapData.rank }] : []),
        { trait_type: 'Platform', value: 'HackerSpace' }
      ],
      eventId: poapData.eventId,
      participantAddress: poapData.walletAddress || '',
      achievementType: poapData.role === 'winner' ? 'winner' : poapData.role === 'judge' ? 'judge' : poapData.role === 'organizer' ? 'organizer' : 'participation',
      dateIssued: new Date().toISOString()
    };
  }

  /**
   * Generate POAP image URL (using dynamic generation)
   */
  private generatePOAPImage(poapData: POAPData): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    
    // Create dynamic badge image URL with parameters
    const params = new URLSearchParams({
      name: poapData.participantName,
      role: poapData.role,
      event: poapData.eventId,
      title: poapData.achievementTitle,
      ...(poapData.rank && { rank: poapData.rank.toString() })
    });

    return `${baseUrl}/api/web3/badge-image?${params.toString()}`;
  }

  /**
   * Upload metadata to IPFS (simplified using Pinata)
   */
  private async uploadToIPFS(metadata: NFTMetadata): Promise<string> {
    try {
      // For production, use Pinata or other IPFS service
      // For demo, we'll use a mock IPFS URL
      const mockIPFSHash = `QmHash${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Uploading NFT metadata to IPFS:', {
        name: metadata.name,
        eventId: metadata.eventId,
        participant: metadata.attributes.find(a => a.trait_type === 'Participant')?.value
      });

      // In production, this would actually upload to IPFS
      // const result = await pinata.pinJSONToIPFS(metadata);
      // return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

      return `https://gateway.pinata.cloud/ipfs/${mockIPFSHash}`;
    } catch (error) {
      console.error('Failed to upload to IPFS:', error);
      throw new Error('IPFS upload failed');
    }
  }

  /**
   * Mint POAP NFT for participant
   */
  async mintPOAP(poapData: POAPData): Promise<{
    success: boolean;
    tokenId?: number;
    transactionHash?: string;
    metadataUri?: string;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      console.warn('Web3 not configured, returning mock POAP data');
      return {
        success: true,
        tokenId: Math.floor(Math.random() * 10000),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        metadataUri: `https://gateway.pinata.cloud/ipfs/QmMock${Date.now()}`
      };
    }

    try {
      // Generate metadata
      const metadata = this.generateNFTMetadata(poapData);
      
      // Upload metadata to IPFS
      const metadataUri = await this.uploadToIPFS(metadata);

      // Mock contract interaction for demo
      const tokenId = Date.now() + Math.floor(Math.random() * 1000);
      const walletAddress = poapData.walletAddress || this.wallet!.address;
      
      // Simulate transaction
      const mockTransactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`POAP minted successfully:`, {
        participant: poapData.participantName,
        role: poapData.role,
        tokenId,
        transactionHash: receipt.transactionHash
      });

      return {
        success: true,
        tokenId,
        transactionHash: mockTransactionHash,
        metadataUri
      };

    } catch (error) {
      console.error('Failed to mint POAP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch mint POAPs for multiple participants
   */
  async batchMintPOAPs(poapDataList: POAPData[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{
      participant: string;
      success: boolean;
      tokenId?: number;
      transactionHash?: string;
      error?: string;
    }>;
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const poapData of poapDataList) {
      try {
        const result = await this.mintPOAP(poapData);
        
        if (result.success) {
          successful++;
          results.push({
            participant: poapData.participantName,
            success: true,
            tokenId: result.tokenId,
            transactionHash: result.transactionHash
          });
        } else {
          failed++;
          results.push({
            participant: poapData.participantName,
            success: false,
            error: result.error
          });
        }
      } catch (error) {
        failed++;
        results.push({
          participant: poapData.participantName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { successful, failed, results };
  }

  /**
   * Get POAP collection for an event
   */
  async getEventPOAPs(eventId: string): Promise<{
    success: boolean;
    tokens?: Array<{
      tokenId: number;
      owner: string;
      metadata: NFTMetadata;
    }>;
    error?: string;
  }> {
    if (!this.isConfigured()) {
      // Return mock data for demo
      return {
        success: true,
        tokens: [
          {
            tokenId: 1001,
            owner: '0x742d35Cc6482C42FB0b2C23E04E0Af6BBAE0A59F',
            metadata: this.generateNFTMetadata({
              eventId,
              participantName: 'Demo User',
              participantEmail: 'demo@example.com',
              role: 'participant',
              achievementTitle: 'Innovation Challenge 2024'
            })
          }
        ]
      };
    }

    try {
      // Mock data for demo
      const mockTokens = [
        {
          tokenId: 1001 + Math.floor(Math.random() * 1000),
          owner: '0x742d35Cc6482C42FB0b2C23E04E0Af6BBAE0A59F',
          metadata: this.generateNFTMetadata({
            eventId,
            participantName: 'Demo Participant',
            participantEmail: 'demo@example.com',
            role: 'participant',
            achievementTitle: 'Innovation Challenge 2024'
          })
        },
        {
          tokenId: 1002 + Math.floor(Math.random() * 1000),
          owner: '0x123d35Cc6482C42FB0b2C23E04E0Af6BBAE0A59F',
          metadata: this.generateNFTMetadata({
            eventId,
            participantName: 'Demo Winner',
            participantEmail: 'winner@example.com',
            role: 'winner',
            achievementTitle: 'Innovation Challenge 2024 - Winner',
            rank: 1
          })
        }
      ];

      return { success: true, tokens: mockTokens };
    } catch (error) {
      console.error('Failed to get event POAPs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate wallet address for participant (simplified)
   */
  generateWalletAddress(): string {
    const wallet = ethers.Wallet.createRandom();
    return wallet.address;
  }
}

// Export singleton instance
export const web3Service = new Web3Service();