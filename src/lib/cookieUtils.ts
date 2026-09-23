import { cookies } from "next/headers";

export const setCookie = async (name: string, value: string, maxAge: number) => {
  const cookieStore = await cookies();
  cookieStore.set(name, value, {
    maxAge: maxAge,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const getCookie = async (name: string) => {
  const cookieStore = await cookies();
  return cookieStore.get(name)?.value;
};

export const deleteCookie = async (name: string) => {
  const cookieStore = await cookies();
  cookieStore.delete(name);
  cookieStore.set(name, "", {
    maxAge: 0,
    path: "/",
  });
};

export const forwardSetCookieHeaders = async (rawSetCookies?: string[] | string) => {
  if (!rawSetCookies) return;
  const cookieStrings = Array.isArray(rawSetCookies) ? rawSetCookies : [rawSetCookies];
  const cookieStore = await cookies();

  for (const cookieStr of cookieStrings) {
    if (!cookieStr) continue;
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [first, ...attrs] = parts;
    const equalIdx = first.indexOf("=");
    if (equalIdx === -1) continue;
    const name = first.substring(0, equalIdx).trim();
    const value = first.substring(equalIdx + 1).trim();

    const options: {
      path?: string;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "lax" | "strict" | "none";
      maxAge?: number;
      expires?: Date;
    } = {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };

    for (const attr of attrs) {
      const [attrKey, attrVal] = attr.split("=").map((a) => a.trim());
      const lowerKey = attrKey.toLowerCase();
      if (lowerKey === "max-age" && attrVal) {
        const parsed = parseInt(attrVal, 10);
        if (!isNaN(parsed)) options.maxAge = parsed;
      } else if (lowerKey === "expires" && attrVal) {
        const parsed = new Date(attrVal);
        if (!isNaN(parsed.getTime())) options.expires = parsed;
      } else if (lowerKey === "path" && attrVal) {
        options.path = attrVal;
      } else if (lowerKey === "httponly") {
        options.httpOnly = true;
      } else if (lowerKey === "secure") {
        options.secure = true;
      } else if (lowerKey === "samesite" && attrVal) {
        const s = attrVal.toLowerCase();
        if (s === "lax" || s === "strict" || s === "none") {
          options.sameSite = s;
        }
      }
    }

    cookieStore.set(name, value, options);
  }
};

