import {Keypair, PublicKey} from '@solana/web3.js';
import {IPayload, IPayloadWithSignature} from './interfaces/authentication';
import * as nacl from 'tweetnacl';
import * as bs58 from 'bs58';
import Wallet from '@project-serum/sol-wallet-adapter';

export const expiredTime = 24 * 60 * 60 * 1000; // 1d

export const createPayload = (address: PublicKey): IPayload => {
  const now = new Date().getTime();
  return {
    address: address.toString(),
    iat: now,
    exp: now + expiredTime,
  };
};

export const createPayloadBuffer = (address: PublicKey): Buffer => {
  const payload = createPayload(address);
  return Buffer.from(JSON.stringify(payload));
};

export const createTokenWithAccount = (account: Keypair): string => {
  const payload = createPayload(account.publicKey);
  const signature = nacl.sign.detached(Buffer.from(JSON.stringify(payload)), account.secretKey);
  const signedData = {
    ...payload,
    signature: Buffer.from(signature).toString('hex'),
  };
  return bs58.encode(Buffer.from(JSON.stringify(signedData)));
};

export const createTokenWithWalletAdapter = async (wallet: Wallet): Promise<string> => {
  const payload = createPayload(wallet.publicKey);
  const {signature} = await wallet.sign(Buffer.from(JSON.stringify(payload)), 'object');
  const signedData = {
    ...payload,
    signature: Buffer.from(signature).toString('hex'),
  };
  return bs58.encode(Buffer.from(JSON.stringify(signedData)));
};

export const createTokenWithSignMessageFunc = async (
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  publicKey: PublicKey,
): Promise<string> => {
  const payload = createPayload(publicKey);

  const signature = await signMessage(Buffer.from(JSON.stringify(payload)));
  const signedData = {
    ...payload,
    signature: Buffer.from(signature).toString('hex'),
  };
  return bs58.encode(Buffer.from(JSON.stringify(signedData)));
};

export const decodeToken = (token: string): IPayloadWithSignature => {
  return JSON.parse(bs58.decode(token).toString()) as IPayloadWithSignature;
};

export const verifyAndDecode = (
  token: string,
): {isValid: boolean; isExpired?: boolean; data?: IPayloadWithSignature; error?: any} => {
  try {
    const payloadWithSig = decodeToken(token);
    const {iat, exp, address, signature} = payloadWithSig;
    const payload = {
      address,
      iat,
      exp,
    };
    return {
      isValid: nacl.sign.detached.verify(
        Buffer.from(JSON.stringify(payload)),
        Buffer.from(signature, 'hex'),
        new PublicKey(payload.address).toBuffer(),
      ),
      isExpired: exp < new Date().getTime(),
      data: payloadWithSig,
    };
  } catch (error) {
    return {
      isValid: false,
      error,
    };
  }
};

export const isTokenOwnedByAddress = (token: string, address: PublicKey) => {
  try {
    const payloadWithSig = decodeToken(token);
    return payloadWithSig.address === address.toString();
  } catch (error) {
    console.log('isTokenOwnedByAddress: error', error);
    return false;
  }
};
