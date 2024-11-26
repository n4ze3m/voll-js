import { SerializeOptions } from 'cookie';

export interface CookieOptions extends SerializeOptions {
    name: string;
    value: string;
}

export interface VollCookie {
    cookie(name: string, value: string | number | object, options?: SerializeOptions): void;
    clearCookie(name: string, options?: SerializeOptions): void;
}
