import { sign } from 'cookie-signature';
import { serialize as serializeCookie, SerializeOptions } from 'cookie';
import { VollSerializeOptions } from "@/types/cookie";
import { millisecondsToSeconds } from "@/utils/ms-to-sec";

export class CookieManager {
    private cookies: Map<string, { value: string; options?: SerializeOptions }> = new Map();
    private cookieSecret: string = "voll-secret-key";

    setCookieSecret(secret: string): void {
        this.cookieSecret = secret;
    }

    signedCookie(name: string, value: string | number | object, options?: SerializeOptions): void {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const jsonValue = typeof value !== 'string' ? `j:${stringValue}` : stringValue;
        const signedValue = 's:' + sign(jsonValue, this.cookieSecret);
        this.setCookie(name, signedValue, options);
    }

    setCookie(name: string, value: string | number | object, options?: VollSerializeOptions): void {
        let stringValue = typeof value === "string" ? value : JSON.stringify(value);

        if (options?.signed) {
            const jsonValue = typeof value !== 'string' ? `j:${stringValue}` : stringValue;
            stringValue = 's:' + sign(jsonValue, this.cookieSecret);
            options.signed = undefined;
        }

        const cookieOptions = { path: "/", ...options };
        
        if (cookieOptions.maxAge) {
            cookieOptions.maxAge = millisecondsToSeconds(cookieOptions.maxAge);
            if (cookieOptions.maxAge === 1) {
                cookieOptions.expires = new Date(0);
            }
        }
        
        this.cookies.set(name, { value: stringValue, options: cookieOptions });
    }

    clearCookie(name: string, options?: VollSerializeOptions): void {
        this.setCookie(name, "", { ...options, maxAge: undefined, expires: new Date(0) });
    }

    getSetCookieHeader(): string {
        const cookieHeaders = Array.from(this.cookies.entries()).map(
            ([cookieName, cookieData]) => {
                return serializeCookie(
                    cookieName,
                    cookieData.value,
                    cookieData.options
                );
            }
        );
        return cookieHeaders.join(",");
    }
}
