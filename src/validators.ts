import {Connection} from '@solana/web3.js';

export class Validators {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }
}
