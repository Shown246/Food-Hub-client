'use server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { setCookie } from './cookieUtils';
const JWT_SECRET = process.env.JWT_SECRET;
// if (!JWT_SECRET) {
//   throw new Error('JWT_SECRET is not set');
// }
const getTokenSecondsRemaining = async (token: string) => {
  if (!token) return 0;
  try {
    // const payload = JWT_SECRET ? jwt.verify(token, JWT_SECRET) as JwtPayload: jwt.decode(token) as JwtPayload;
    // console.log("payload", payload);
    // if (payload && !payload.exp) return 0;
    // const now = Date.now() / 1000;
    // const secondsRemaining = Math.round(payload.exp as number - now);
    const secondsRemaining = 60 * 60 * 24 * 7; // 7 days
    return secondsRemaining;
  } catch (error) {
    console.error("Error getting token seconds remaining", error);
    return 0;
  }
};

export const setTokenInCookies = async (name: string, token: string) => {
  const secondsRemaining = await getTokenSecondsRemaining(token);
  await setCookie(name, token, secondsRemaining);
}