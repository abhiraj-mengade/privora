#!/usr/bin/env python3
"""
ZEC Transfer Script using zecwallet Python library

This script demonstrates how to perform Zcash (ZEC) transfers
using the zecwallet-python library.
"""

import sys
import json
import argparse
from typing import Optional, Dict, Any

try:
    from zecwallet import ZecWallet
except ImportError:
    print("Error: zecwallet library not found.")
    print("Install it using: pip install zecwallet-python")
    sys.exit(1)


class ZecTransferManager:
    """Manager class for ZEC transfers"""

    def __init__(self, wallet_path: Optional[str] = None):
        """
        Initialize ZEC Wallet

        Args:
            wallet_path: Path to wallet file. If None, uses default location
        """
        try:
            self.wallet = ZecWallet(wallet_path)
            print("✓ Wallet initialized successfully")
        except Exception as e:
            print(f"✗ Failed to initialize wallet: {e}")
            sys.exit(1)

    def get_balance(self) -> Dict[str, Any]:
        """
        Get wallet balance information

        Returns:
            Dictionary containing balance details
        """
        try:
            balance = self.wallet.balance()
            return {
                "transparent": balance.get("transparent", 0),
                "shielded": balance.get("shielded", 0),
                "total": balance.get("total", 0)
            }
        except Exception as e:
            print(f"✗ Failed to get balance: {e}")
            return {}

    def transfer(
        self,
        recipient_address: str,
        amount: float,
        memo: Optional[str] = None,
        use_shielded: bool = True
    ) -> Dict[str, Any]:
        """
        Transfer ZEC to a recipient address

        Args:
            recipient_address: Recipient's ZEC address
            amount: Amount in ZEC to transfer
            memo: Optional memo for the transaction
            use_shielded: Whether to use shielded transaction (default: True)

        Returns:
            Transaction details dictionary
        """
        try:
            # Validate recipient address
            if not recipient_address:
                raise ValueError("Recipient address cannot be empty")

            # Validate amount
            if amount <= 0:
                raise ValueError("Amount must be greater than 0")

            print("Preparing transfer...")
            print(f"  Recipient: {recipient_address}")
            print(f"  Amount: {amount} ZEC")
            if memo:
                print(f"  Memo: {memo}")
            print(f"  Type: {'Shielded' if use_shielded else 'Transparent'}")

            # Create transaction
            tx_data = {
                "to": recipient_address,
                "amount": amount,
            }

            if memo:
                tx_data["memo"] = memo

            # Send transaction
            result = self.wallet.send_transaction(
                tx_data,
                use_shielded=use_shielded
            )

            return {
                "success": True,
                "txid": result.get("txid"),
                "amount": amount,
                "recipient": recipient_address,
                "status": "sent"
            }

        except ValueError as e:
            return {
                "success": False,
                "error": f"Validation error: {e}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Transfer failed: {e}"
            }

    def get_address(self, address_type: str = "shielded") -> Optional[str]:
        """
        Get wallet address

        Args:
            address_type: "shielded" or "transparent"

        Returns:
            Wallet address or None if failed
        """
        try:
            if address_type == "shielded":
                return self.wallet.shielded_address()
            elif address_type == "transparent":
                return self.wallet.transparent_address()
            else:
                raise ValueError(f"Invalid address type: {address_type}")
        except Exception as e:
            print(f"✗ Failed to get {address_type} address: {e}")
            return None

    def get_transactions(self, limit: int = 10) -> list:
        """
        Get recent transactions

        Args:
            limit: Maximum number of transactions to retrieve

        Returns:
            List of transaction details
        """
        try:
            return self.wallet.transactions(limit=limit)
        except Exception as e:
            print(f"✗ Failed to get transactions: {e}")
            return []


def main():
    """Main function with CLI argument parsing"""

    parser = argparse.ArgumentParser(
        description="ZEC Transfer Tool using zecwallet library"
    )

    parser.add_argument(
        "command",
        choices=["transfer", "balance", "address", "transactions"],
        help="Command to execute"
    )

    parser.add_argument(
        "--wallet",
        type=str,
        default=None,
        help="Path to wallet file (optional)"
    )

    parser.add_argument(
        "--recipient",
        type=str,
        help="Recipient ZEC address (required for transfer)"
    )

    parser.add_argument(
        "--amount",
        type=float,
        help="Amount in ZEC to transfer (required for transfer)"
    )

    parser.add_argument(
        "--memo",
        type=str,
        default=None,
        help="Optional memo for the transaction"
    )

    parser.add_argument(
        "--address-type",
        choices=["shielded", "transparent"],
        default="shielded",
        help="Address type (default: shielded)"
    )

    parser.add_argument(
        "--transparent",
        action="store_true",
        help="Use transparent transaction (default: shielded)"
    )

    args = parser.parse_args()

    # Initialize wallet manager
    manager = ZecTransferManager(args.wallet)

    # Execute command
    if args.command == "transfer":
        if not args.recipient or args.amount is None:
            print("✗ Error: --recipient and --amount are required for transfer")
            sys.exit(1)

        result = manager.transfer(
            recipient_address=args.recipient,
            amount=args.amount,
            memo=args.memo,
            use_shielded=not args.transparent
        )

        print("\nTransfer Result:")
        print(json.dumps(result, indent=2))

        if result["success"]:
            print(f"✓ Transaction sent! TXID: {result['txid']}")
            sys.exit(0)
        else:
            print(f"✗ {result['error']}")
            sys.exit(1)

    elif args.command == "balance":
        balance = manager.get_balance()
        print("\nWallet Balance:")
        print(json.dumps(balance, indent=2))

    elif args.command == "address":
        address = manager.get_address(args.address_type)
        if address:
            print(f"\n{args.address_type.capitalize()} Address:")
            print(address)
        else:
            sys.exit(1)

    elif args.command == "transactions":
        txs = manager.get_transactions(limit=10)
        print("\nRecent Transactions:")
        print(json.dumps(txs, indent=2))


if __name__ == "__main__":
    main()
