export interface IPayload {
  address: string;
  iat: number;
  exp: number;
}

export interface IPayloadWithSignature extends IPayload {
  signature: string;
}
