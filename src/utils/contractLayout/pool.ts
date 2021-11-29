import * as BufferLayout from 'buffer-layout';
import * as Layout from '../layout';

export const PoolLayout = BufferLayout.struct([
  BufferLayout.u8('nonce'),
  Layout.publicKey('token_x'),
  BufferLayout.nu64('fee'),
  BufferLayout.nu64('fee_amount'),
  Layout.publicKey('root_admin'),
  Layout.publicKey('admin'),
]);

export const InitPoolLayout = [
  BufferLayout.u8('instruction'),
  BufferLayout.u8('nonce'),
  BufferLayout.nu64('fee'),
];

export const CreateTxNoteLayout = [
  BufferLayout.blob(18, 'tx_id'),
]
