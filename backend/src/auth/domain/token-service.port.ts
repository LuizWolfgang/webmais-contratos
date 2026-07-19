export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface TokenPayload {
  sub: string;
  username: string;
}

export interface TokenService {
  sign(payload: TokenPayload): Promise<string>;
}
