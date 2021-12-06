import {TOKEN_PROGRAM_ID} from '@project-serum/serum/lib/token-instructions';
import {AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token, u64} from '@solana/spl-token';
import {
  AccountMeta,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';
import {POOL_PROGRAM_ID} from '../../index';
import {InitPoolLayout, PoolLayout} from './contractLayout';
import * as Layout from './layout';
import {Numberu64} from './layout';

export class Instructions {
  static createDepositInstruction(
    accounts: {
      poolAccount: PublicKey;
      userAccount: PublicKey;
    },
    inputData: {
      incoming_amount: number;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {poolAccount, userAccount} = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: userAccount, isSigner: true, isWritable: true},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('incoming_amount'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 4, // Early Join Pool instruction
          incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static createTestInstruction(
    accounts: {
      userAccount: PublicKey;
    },
    inputData: {
      incoming_amount: number;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {userAccount} = accounts;
    const keys = [{pubkey: userAccount, isSigner: true, isWritable: true}];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('incoming_amount'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 1, // Early Join Pool instruction
          incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static async createPoolAccountInstruction(connection: Connection, payer: PublicKey) {
    const poolAccount = Keypair.generate();
    const balanceNeeded = await connection.getMinimumBalanceForRentExemption(PoolLayout.span);

    return {
      poolAccount,
      instruction: SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: new PublicKey(poolAccount.publicKey),
        lamports: balanceNeeded,
        space: PoolLayout.span,
        programId: new PublicKey(POOL_PROGRAM_ID),
      }),
    };
  }

  /**
   * TODO: Should be deprecated at this package
   * @param payer
   * @param owner
   * @param mint
   * @param associatedTokenAddress
   */
  static createAssociatedTokenAccountInstruction(
    payer: PublicKey,
    owner: PublicKey,
    mint: PublicKey,
    associatedTokenAddress: PublicKey,
  ): TransactionInstruction {
    const keys = [
      {pubkey: payer, isSigner: true, isWritable: true},
      {pubkey: associatedTokenAddress, isSigner: false, isWritable: true},
      {pubkey: owner, isSigner: false, isWritable: false},
      {pubkey: mint, isSigner: false, isWritable: false},
      {pubkey: SystemProgram.programId, isSigner: false, isWritable: false},
      {pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false},
      {pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false},
    ];

    const data = Buffer.alloc(0);

    return new TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data,
    });
  }

  static updateFeeAmount(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;
      adminAddress: PublicKey;
    },
    inputData: {
      fee: number;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {poolAccount, userAuthority, adminAddress} = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: adminAddress, isSigner: true, isWritable: true},
      {pubkey: userAuthority, isSigner: false, isWritable: false},
    ];
    console.log(
      poolAccount.toString(),
      adminAddress.toString(),
      userAuthority.toString(),
      '----accounts',
    );

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('fee'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 4, // Update fee
          fee: new Numberu64(inputData.fee).toBuffer(),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static transferPoolAdmin(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;
      adminAddress: PublicKey;
      newAdminAddress: PublicKey;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {poolAccount, adminAddress, newAdminAddress, userAuthority} = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: adminAddress, isSigner: true, isWritable: true},
      {pubkey: newAdminAddress, isSigner: false, isWritable: true},
      {pubkey: userAuthority, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 5, // Transfer Admin
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static transferRootAdmin(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;
      rootAdminAddress: PublicKey;
      newRootAdminAddress: PublicKey;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {poolAccount, rootAdminAddress, newRootAdminAddress, userAuthority} = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: rootAdminAddress, isSigner: true, isWritable: true},
      {pubkey: newRootAdminAddress, isSigner: false, isWritable: true},
      {pubkey: userAuthority, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 6, // Transfer Root Admin
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static withdrawFeeAmount(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;
      poolTokenXAddress: PublicKey;
      poolAdminAddress: PublicKey;
      poolAdminTokenAddress: PublicKey;
      tokenProgramId: PublicKey;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {
      poolAccount,
      userAuthority,
      poolAdminAddress,
      poolTokenXAddress,
      poolAdminTokenAddress,
      tokenProgramId,
    } = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: userAuthority, isSigner: false, isWritable: false},
      {pubkey: poolAdminAddress, isSigner: true, isWritable: true},
      {pubkey: poolTokenXAddress, isSigner: false, isWritable: true},
      {pubkey: poolAdminTokenAddress, isSigner: false, isWritable: true},
      {pubkey: tokenProgramId, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 3, // Withdraw Fee Amount
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static deposit(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;

      userAccount: PublicKey;

      userSourceTokenAccount: PublicKey;
      poolSourceTokenAccount: PublicKey;
      tokenProgramId: PublicKey;
    },
    inputData: {
      incoming_amount: number;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {
      poolAccount,
      userAuthority,

      userAccount,

      userSourceTokenAccount,
      poolSourceTokenAccount,
      tokenProgramId,
    } = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: userAuthority, isSigner: false, isWritable: false},
      {pubkey: userAccount, isSigner: true, isWritable: true},
      {pubkey: userSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: tokenProgramId, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('incoming_amount'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 1, // Deposit
          incoming_amount: new Numberu64(inputData.incoming_amount).toBuffer(),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static withdraw(
    accounts: {
      poolAccount: PublicKey;
      userAuthority: PublicKey;

      adminAccount: PublicKey;
      poolSourceTokenAccount: PublicKey;
      withdrawAccount: PublicKey;

      tokenProgramId: PublicKey;
    },
    inputData: {
      outcoming_amount: number;
    },
    poolProgramId: PublicKey,
  ): TransactionInstruction {
    const {
      poolAccount,
      userAuthority,

      adminAccount,
      withdrawAccount,

      poolSourceTokenAccount,
      tokenProgramId,
    } = accounts;
    const keys = [
      {pubkey: poolAccount, isSigner: false, isWritable: true},
      {pubkey: userAuthority, isSigner: false, isWritable: false},
      {pubkey: adminAccount, isSigner: true, isWritable: true},
      {pubkey: poolSourceTokenAccount, isSigner: false, isWritable: true},
      {pubkey: withdrawAccount, isSigner: false, isWritable: true},
      {pubkey: tokenProgramId, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('outcoming_amount'),
    ]);

    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 2, // Withdraw
          outcoming_amount: new Numberu64(inputData.outcoming_amount).toBuffer(),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: poolProgramId,
      data,
    });
  }

  static closeAccountInstruction(params: {
    programId: PublicKey;
    account: PublicKey;
    dest: PublicKey;
    owner: PublicKey;
    signers: PublicKey[];
  }): TransactionInstruction {
    const keys = [
      {pubkey: params.account, isSigner: false, isWritable: true},
      {pubkey: params.dest, isSigner: false, isWritable: true},
    ];

    const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 9, // CloseAccount instruction
      },
      data,
    );

    this.addSigners(keys, params.owner, params.signers);

    return new TransactionInstruction({
      keys,
      programId: params.programId,
      data,
    });
  }

  /**
   * TODO: Should be deprecated at this package
   * @param params
   */
  static createApproveInstruction(params: {
    programId: PublicKey;
    source: PublicKey;
    delegate: PublicKey;
    owner: PublicKey;
    amount: number;
    signers: PublicKey[];
  }): TransactionInstruction {
    const {programId, source, delegate, owner, amount, signers} = params;
    const keys = [
      {pubkey: source, isSigner: false, isWritable: true},
      {pubkey: delegate, isSigner: false, isWritable: true},
    ];
    this.addSigners(keys, owner, signers);

    const dataLayout = BufferLayout.struct([
      BufferLayout.u8('instruction'),
      Layout.uint64('amount'),
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 4, // Approve instruction
        amount: new u64(amount).toBuffer(),
      },
      data,
    );

    return {
      keys,
      programId,
      data,
    };
  }

  private static addSigners(keys: AccountMeta[], owner: PublicKey, signers: PublicKey[]): void {
    if (signers && signers.length > 0) {
      keys.push({
        pubkey: owner,
        isSigner: false,
        isWritable: false,
      });
      signers.forEach((signer) => {
        keys.push({pubkey: signer, isSigner: true, isWritable: false});
      });
    } else {
      keys.push({pubkey: owner, isSigner: true, isWritable: false});
    }
  }

  static createInitPoolInstruction(
    accounts: {
      poolAccount: PublicKey;
      authority: PublicKey;
      rootAdminAccount: PublicKey;
      tokenAccountX: PublicKey;
      payerAccount: PublicKey;
    },
    inputData: {
      nonce: number;
      fee: number;
    },
  ) {
    const keys = [
      {pubkey: accounts.poolAccount, isSigner: false, isWritable: true},
      {pubkey: accounts.authority, isSigner: false, isWritable: false},
      {pubkey: accounts.tokenAccountX, isSigner: false, isWritable: false},
      {pubkey: accounts.rootAdminAccount, isSigner: false, isWritable: false},
    ];

    const commandDataLayout = BufferLayout.struct(InitPoolLayout);
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: 0, // InitializeSwap instruction
          nonce: inputData.nonce,
          fee: inputData.fee,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: new PublicKey(POOL_PROGRAM_ID),
      data,
    });
  }

  static async createTokenAccountInstruction(
    connection: Connection,
    payerPublicKey: PublicKey,
    newAccountPubkey: PublicKey,
  ) {
    const balanceNeeded = await Token.getMinBalanceRentForExemptAccount(connection);
    return SystemProgram.createAccount({
      fromPubkey: payerPublicKey,
      newAccountPubkey: newAccountPubkey,
      lamports: balanceNeeded,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    });
  }

  static createInitTokenAccountInstruction(
    tokenPublicKey: PublicKey,
    newTokenAccount: PublicKey,
    owner: PublicKey,
  ) {
    return Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      tokenPublicKey,
      newTokenAccount,
      owner,
    );
  }

  static createInstructionStoreTxId(txId: string, depositor: PublicKey) {
    const keys = [{pubkey: depositor, isSigner: true, isWritable: true}];

    const length = Buffer.from(txId, 'utf8').length;

    const commandDataLayout = BufferLayout.struct([BufferLayout.blob(length, 'tx_id')]);
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          tx_id: Buffer.from(txId, 'utf8'),
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }

    return new TransactionInstruction({
      keys,
      programId: new PublicKey(POOL_PROGRAM_ID),
      data,
    });
  }
}
