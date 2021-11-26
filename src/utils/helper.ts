import {
  Account,
  Connection,
  Keypair,
  sendAndConfirmTransaction as realSendAndConfirmTransaction,
  Transaction,
  TransactionSignature,
} from '@solana/web3.js';

export const isEmpty = (str?: string | null): boolean => {
  if (!str) {
    return true;
  }
  return str.trim() === '';
};

export const stringToUnit8Array = (str: string) => {
  return Buffer.from(str, 'base64');
};

export const unit8ArrayToString = (arr: Uint8Array) => {
  return Buffer.from(arr).toString('base64');
};

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendAndConfirmTransaction(
  title: string,
  connection: Connection,
  transaction: Transaction,
  ...signers: Array<Account | Keypair>
): Promise<TransactionSignature> {
  return realSendAndConfirmTransaction(connection, transaction, signers, {
    skipPreflight: false,
    commitment: 'confirmed',
    preflightCommitment: 'recent',
  });
}

export function round(num: number, decimals: number) {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
