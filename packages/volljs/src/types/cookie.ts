import { SerializeOptions } from 'cookie';

export interface CookieOptions extends SerializeOptions {
    name: string;
    value: string;
}


export type VollSerializeOptions = SerializeOptions & { signed?: boolean }


export interface VollCookie {
    cookie(name: string, value: string | number | object, options?: VollSerializeOptions): void;
    clearCookie(name: string, options?: VollSerializeOptions): void;
}
