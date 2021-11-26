import * as BufferLayout from 'buffer-layout';
import * as assert from 'assert';
import * as BN from 'bn.js';

/**
 * Layout for a public key
 */
export const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const int64 = (property = 'int64') => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 128bit unsigned value
 */
export const uint128 = (property = 'uint128') => {
  return BufferLayout.blob(16, property);
};

/**
 * Layout for a Rust String type
 */
export const rustString = (property = 'string') => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property,
  );
  const _decode = rsl.decode.bind(rsl);
  const _encode = rsl.encode.bind(rsl);

  rsl.decode = (buffer: Buffer, offset: number) => {
    const data = _decode(buffer, offset);
    return data.chars.toString('utf8');
  };

  rsl.encode = (str: string, buffer: Buffer, offset: number) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
    };
    return _encode(data, buffer, offset);
  };

  return rsl;
};

export class Numberu64 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) {
      return b;
    }
    assert(b.length < 8, 'Numberu64 too large');

    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): Numberu64 {
    assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
    return new Numberu64(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16,
    );
  }
}

export interface EncodeDecode<T> {
  decode: (buffer: Buffer, offset?: number) => T;
  encode: (src: T, buffer: Buffer, offset?: number) => number;
}

export const encodeDecode = <T>(layout: BufferLayout.Layout<T>): EncodeDecode<T> => {
  const decode = layout.decode.bind(layout);
  const encode = layout.encode.bind(layout);
  return {decode, encode};
};

export const bool = (property = 'bool'): BufferLayout.Layout<boolean> => {
  const layout = BufferLayout.u8(property);
  const {encode, decode} = encodeDecode(layout);

  const boolLayout = (layout as BufferLayout.Layout<unknown>) as BufferLayout.Layout<boolean>;

  boolLayout.decode = (buffer: Buffer, offset: number) => {
    const src = decode(buffer, offset);
    return !!src;
  };

  boolLayout.encode = (value: boolean, buffer: Buffer, offset: number) => {
    const src = Number(value);
    return encode(src, buffer, offset);
  };

  return boolLayout;
};

export const getNumberU64 = (num: number) => {
  return new Numberu64(num).toBuffer();
};

export function getAlloc(type: any, fields: any): number {
  let alloc = 0;
  type.layout.fields.forEach((item: any) => {
    if (item.span >= 0) {
      alloc += item.span;
    } else if (typeof item.alloc === 'function') {
      alloc += item.alloc(fields[item.property]);
    }
  });
  return alloc;
}

/**
 * Layout for a 144bit unsigned value
 *
 * @param property string
 * @returns any
 */
export const poolId = (property = 'uint144'): any => {
  return BufferLayout.blob(18, property);
};

export const rate = (property = 'rate'): any => {
  return BufferLayout.blob(16, property);
};

export const fees = (property = 'fees'): any => {
  return BufferLayout.blob(16, property);
};

export const seeds = (property = 'seeds'): any => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for campaign
 *
 * @param property string
 * @returns Object
 */
export const campaign = (property = 'campaign'): any => {
  return BufferLayout.blob(130, property);
};

/**
 * Layout for admins
 *
 * @param property string
 * @returns Object
 */
export const admins = (property = 'admins'): any => {
  return BufferLayout.blob(32, property);
};

export const poolPhase = (property = 'poolPhase'): any => {
  return BufferLayout.blob(49, property);
};

export const userLevel = (property = 'userLevel'): any => {
  return BufferLayout.blob(9, property);
};

export const tier = (property = 'tier'): any => {
  return BufferLayout.blob(24, property);
};
