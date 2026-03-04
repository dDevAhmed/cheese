// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/ICheeseVault.sol";

/**
 * @title UserWallet
 * @notice Individual custodial wallet for each Cheese user.
 *
 * ── Access model ─────────────────────────────────────────────────────────────
 *
 *   backend  — the platform EOA (NestJS signer). Controls all money movement.
 *   factory  — the UserWalletFactory that deployed this wallet. Authorised to
 *              call transferToUser() on behalf of a transferByUsername() call.
 *   vault    — CheeseVault. Authorised to pull funds via transferToVault().
 *   owner    — optional user recovery address (initially address(0)).
 *              Can only be set by backend. Allows emergency withdrawal.
 *
 * ── Money flows ───────────────────────────────────────────────────────────────
 *
 *   Deposit:           off-chain fiat/crypto → backend credits USDC into this contract
 *   Bill payment:      backend calls vault.processPayment() → vault calls transferToVault()
 *   P2P send:          factory.transferByUsername() → this.transferToUser(recipientWallet)
 *   Withdrawal:        backend calls withdraw(amount, recipient)
 *   Emergency:         owner calls emergencyWithdraw()
 */
contract UserWallet is ReentrancyGuard {
    // ========== STATE VARIABLES ==========

    address public backend;
    address public factory;   // UserWalletFactory — new
    address public owner;     // User recovery address (initially address(0))
    ICheeseVault public vault;
    IERC20 public immutable usdc;

    // ========== EVENTS ==========

    event TransferredToVault(
        uint256 paymentAmount,
        uint256 feeAmount,
        uint256 totalAmount,
        uint256 timestamp
    );

    event TransferredToUser(       // NEW — P2P send
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event Withdrawal(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event OwnerUpdated(address indexed oldOwner, address indexed newOwner);

    event EmergencyWithdrawal(uint256 amount, uint256 timestamp);

    // ========== MODIFIERS ==========

    modifier onlyBackend() {
        require(msg.sender == backend, "Only backend");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        require(owner != address(0), "Owner not set");
        _;
    }

    modifier onlyBackendOrOwner() {
        require(msg.sender == backend || msg.sender == owner, "Not authorised");
        _;
    }

    modifier onlyBackendOrVault() {
        require(
            msg.sender == backend || msg.sender == address(vault),
            "Not authorised"
        );
        _;
    }

    /// @dev Factory is authorised in addition to backend so that
    ///      UserWalletFactory.transferByUsername() can execute P2P moves
    ///      atomically in a single transaction.
    modifier onlyBackendOrFactory() {
        require(
            msg.sender == backend || msg.sender == factory,
            "Not authorised"
        );
        _;
    }

    // ========== CONSTRUCTOR ==========

    /**
     * @param _backend  Platform EOA address
     * @param _factory  UserWalletFactory address (address(this) in factory)
     * @param _vault    CheeseVault address
     * @param _usdc     USDC token contract address
     * @param _owner    User recovery address (pass address(0) initially)
     */
    constructor(
        address _backend,
        address _factory,
        address _vault,
        address _usdc,
        address _owner
    ) {
        require(_backend  != address(0), "Invalid backend");
        require(_factory  != address(0), "Invalid factory");
        require(_vault    != address(0), "Invalid vault");
        require(_usdc     != address(0), "Invalid USDC");

        backend  = _backend;
        factory  = _factory;
        vault    = ICheeseVault(_vault);
        usdc     = IERC20(_usdc);
        owner    = _owner;
    }

    // ========== VIEW FUNCTIONS ==========

    /// @notice USDC balance held in this wallet
    function getBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }

    // ========== PAYMENT FUNCTIONS ==========

    /**
     * @notice Pull (payment + fee) to CheeseVault for a bill payment.
     *         Called by the vault inside processPayment().
     * @param  paymentAmount  Bill amount excluding fee
     * @return totalAmount    Actual amount transferred (payment + fee)
     */
    function transferToVault(uint256 paymentAmount)
        external
        onlyBackendOrVault
        nonReentrant
        returns (uint256 totalAmount)
    {
        require(paymentAmount > 0, "Payment amount must be > 0");

        uint256 feeAmount = vault.feeAmount();
        totalAmount = paymentAmount + feeAmount;

        require(usdc.balanceOf(address(this)) >= totalAmount, "Insufficient balance");
        require(usdc.transfer(address(vault), totalAmount), "Vault transfer failed");

        emit TransferredToVault(paymentAmount, feeAmount, totalAmount, block.timestamp);
    }

    /**
     * @notice Send USDC directly to another user's wallet (P2P transfer).
     *         Called by UserWalletFactory.transferByUsername().
     *
     * @param  recipientWallet  Address of the recipient's UserWallet contract
     * @param  amount           USDC amount in token units (6 decimals)
     */
    function transferToUser(address recipientWallet, uint256 amount)
        external
        onlyBackendOrFactory
        nonReentrant
    {
        require(amount > 0, "Amount must be > 0");
        require(recipientWallet != address(0), "Invalid recipient");
        require(recipientWallet != address(this), "Cannot send to self");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient balance");

        require(usdc.transfer(recipientWallet, amount), "P2P transfer failed");

        emit TransferredToUser(recipientWallet, amount, block.timestamp);
    }

    // ========== WITHDRAWAL FUNCTIONS ==========

    /**
     * @notice Withdraw USDC from wallet (backend-initiated or owner recovery).
     * @param  amount     Amount to withdraw
     * @param  recipient  Address to receive USDC
     */
    function withdraw(uint256 amount, address recipient)
        external
        onlyBackendOrOwner
        nonReentrant
    {
        require(amount > 0, "Amount must be > 0");
        require(recipient != address(0), "Invalid recipient");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient balance");

        require(usdc.transfer(recipient, amount), "Withdrawal failed");

        emit Withdrawal(recipient, amount, block.timestamp);
    }

    /**
     * @notice Emergency drain — sends entire balance to owner address.
     *         Safety valve if backend is compromised.
     */
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "Nothing to withdraw");

        require(usdc.transfer(owner, balance), "Emergency withdrawal failed");

        emit EmergencyWithdrawal(balance, block.timestamp);
    }

    // ========== ADMIN FUNCTIONS ==========

    /**
     * @notice Register or update the user's recovery address.
     *         Only backend can set this — prevents user from self-assigning
     *         before KYC or other off-chain checks pass.
     * @param  newOwner  New recovery address
     */
    function setOwner(address newOwner) external onlyBackend {
        address oldOwner = owner;
        owner = newOwner;
        emit OwnerUpdated(oldOwner, newOwner);
    }
}
