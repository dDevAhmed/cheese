import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { WalletCreationResult } from './auth.types';
import { WalletCreationFailedException } from './auth.exceptions';

/**
 * WalletService
 * 
 * Handles custodial wallet creation on the blockchain.
 * 
 * Architecture:
 * - Uses CREATE2 for deterministic wallet addresses
 * - Deploys ERC-4337 compatible smart contract wallets
 * - Supports multiple chains (Polygon, Base, Celo, etc.)
 * 
 * Security:
 * - Private keys for wallet deployment are stored in env vars or KMS
 * - User's wallet is controlled by the passkey signature
 * - Factory contract ensures deterministic deployment
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  private readonly provider: ethers.Provider;
  private readonly factorySigner: ethers.Wallet;
  private readonly factoryContract: ethers.Contract;

  // Minimal ABI for the wallet factory contract
  private readonly FACTORY_ABI = [
    'function createWallet(address owner, bytes32 salt) external returns (address wallet)',
    'function getWalletAddress(address owner, bytes32 salt) external view returns (address)',
    'event WalletCreated(address indexed wallet, address indexed owner, bytes32 salt)',
  ];

  constructor(private readonly configService: ConfigService) {
    // Initialize provider for the default chain
    const rpcUrl = this.configService.getOrThrow<string>('BLOCKCHAIN_RPC_URL');
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Signer for deploying wallets (factory contract owner)
    const factoryPrivateKey = this.configService.getOrThrow<string>(
      'FACTORY_PRIVATE_KEY',
    );
    this.factorySigner = new ethers.Wallet(factoryPrivateKey, this.provider);

    // Factory contract address (deployed separately)
    const factoryAddress = this.configService.getOrThrow<string>(
      'WALLET_FACTORY_ADDRESS',
    );
    this.factoryContract = new ethers.Contract(
      factoryAddress,
      this.FACTORY_ABI,
      this.factorySigner,
    );

    this.logger.log(`WalletService initialized on chain ${this.getChainId()}`);
  }

  /**
   * Create a new custodial wallet for a user.
   * 
   * Flow:
   * 1. Generate deterministic salt from user email + timestamp
   * 2. Derive wallet address using CREATE2 (off-chain, no gas)
   * 3. Deploy wallet contract on-chain
   * 4. Return wallet address and deployment details
   * 
   * The wallet owner will be set to a temporary address initially,
   * then transferred to the passkey-derived address after passkey registration.
   * 
   * @param userEmail - User's email (used for salt generation)
   * @param userId - User's UUID
   * @returns Wallet creation result with address and tx hash
   */
  async createWallet(
    userEmail: string,
    userId: string,
  ): Promise<WalletCreationResult> {
    try {
      // Generate deterministic salt from user data + timestamp
      // This ensures each user gets a unique wallet address
      const timestamp = Date.now();
      const saltInput = `${userEmail}-${userId}-${timestamp}`;
      const salt = ethers.keccak256(ethers.toUtf8Bytes(saltInput));

      this.logger.log(`Creating wallet for user ${userId} with salt ${salt}`);

      // Initially, set the owner to the factory signer
      // After passkey registration, ownership will be transferred
      const initialOwner = this.factorySigner.address;

      // Predict the wallet address before deployment (CREATE2 determinism)
      const predictedAddress = await this.factoryContract.getWalletAddress(
        initialOwner,
        salt,
      );

      this.logger.log(`Predicted wallet address: ${predictedAddress}`);

      // Deploy the wallet on-chain
      const tx = await this.factoryContract.createWallet(initialOwner, salt);

      this.logger.log(`Wallet deployment tx submitted: ${tx.hash}`);

      // Wait for confirmation (1 block is enough for testnet)
      const receipt = await tx.wait(1);

      if (!receipt || receipt.status !== 1) {
        throw new WalletCreationFailedException('Transaction failed on-chain');
      }

      this.logger.log(
        `Wallet deployed successfully at ${predictedAddress} (tx: ${tx.hash})`,
      );

      // Get chain ID
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      return {
        walletAddress: predictedAddress,
        deploymentTxHash: tx.hash,
        walletSalt: salt,
        chainId,
        contractVersion: '1.0.0', // TODO: Read from contract if versioned
      };
    } catch (error) {
      this.logger.error(
        `Failed to create wallet: ${error.message}`,
        error.stack,
      );

      if (error instanceof WalletCreationFailedException) {
        throw error;
      }

      throw new WalletCreationFailedException(
        `Blockchain error: ${error.message}`,
      );
    }
  }

  /**
   * Transfer wallet ownership to the passkey-derived address.
   * 
   * Called after passkey registration completes.
   * The wallet owner is changed from the factory signer to an address
   * derived from the user's passkey public key.
   * 
   * @param walletAddress - Address of the wallet to transfer
   * @param passkeyPublicKey - User's passkey public key (used to derive new owner)
   */
  async transferWalletOwnership(
    walletAddress: string,
    passkeyPublicKey: string,
  ): Promise<string> {
    try {
      // Derive Ethereum address from passkey public key
      // Passkey uses P-256 (secp256r1), Ethereum uses secp256k1
      // We need to map the P-256 key to an Ethereum-compatible address
      const newOwner = this.deriveAddressFromPasskey(passkeyPublicKey);

      this.logger.log(
        `Transferring wallet ${walletAddress} ownership to ${newOwner}`,
      );

      // Minimal ABI for the wallet contract
      const walletABI = ['function transferOwnership(address newOwner) external'];
      const walletContract = new ethers.Contract(
        walletAddress,
        walletABI,
        this.factorySigner,
      );

      const tx = await walletContract.transferOwnership(newOwner);
      const receipt = await tx.wait(1);

      if (!receipt || receipt.status !== 1) {
        throw new Error('Ownership transfer failed on-chain');
      }

      this.logger.log(`Ownership transferred successfully (tx: ${tx.hash})`);

      return tx.hash;
    } catch (error) {
      this.logger.error(
        `Failed to transfer wallet ownership: ${error.message}`,
        error.stack,
      );
      throw new WalletCreationFailedException(
        `Ownership transfer failed: ${error.message}`,
      );
    }
  }

  /**
   * Derive an Ethereum address from a passkey public key.
   * 
   * WebAuthn uses P-256 (secp256r1) curve, Ethereum uses secp256k1.
   * We can't directly use the P-256 key on Ethereum, so we derive
   * an Ethereum address by hashing the public key.
   * 
   * Alternative: Use EIP-7212 (RIP-7212) for native P-256 support
   * 
   * @param passkeyPublicKey - Base64-encoded COSE public key
   * @returns Ethereum address (0x...)
   */
  private deriveAddressFromPasskey(passkeyPublicKey: string): string {
    // Decode the COSE public key
    const publicKeyBuffer = Buffer.from(passkeyPublicKey, 'base64');

    // For simplicity, we'll hash the entire public key
    // In production, you'd parse the COSE key properly and extract x,y coordinates
    const hash = ethers.keccak256(publicKeyBuffer);

    // Take the last 20 bytes as the Ethereum address
    const address = '0x' + hash.slice(-40);

    this.logger.debug(`Derived address ${address} from passkey`);

    return address;
  }

  /**
   * Get the current chain ID
   */
  private async getChainId(): Promise<number> {
    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  /**
   * Check if a wallet exists at the given address
   */
  async isWalletDeployed(walletAddress: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(walletAddress);
      return code !== '0x'; // 0x means no contract code
    } catch (error) {
      this.logger.error(`Failed to check wallet deployment: ${error.message}`);
      return false;
    }
  }

  /**
   * Get wallet balance (native token)
   */
  async getWalletBalance(walletAddress: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error(`Failed to get wallet balance: ${error.message}`);
      return '0';
    }
  }
}
