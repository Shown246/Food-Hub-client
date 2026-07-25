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
};
