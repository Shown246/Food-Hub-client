'use server';

import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.type";
import { ILoginResponse } from "@/types/auth.type";
import { IloginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";
import { setSessionIdentity } from "@/lib/auth/session-identity";

export const loginAction = async (
  payload: IloginPayload,
  callbackUrl?: string | null
): Promise<ILoginResponse | ApiErrorResponse> => {
  const parseedPayload = loginZodSchema.safeParse(payload);
  if (!parseedPayload.success) {
    const firstError = parseedPayload.error.issues[0].message || "Invalid Input";
    return{
      success: false,
      message: firstError
    }
  }
  const response = await httpClient.post<ILoginResponse>("/api/auth/login", parseedPayload.data, {});
  
  if (!response.success) {
    return {
      success: false,
      message: response.message
    }
  }
  if(!response.data){
    return {
      success: false,
      message: "LogIn Failed"
    }
  }
  const { token, accessToken, refreshToken, user } = response.data;
  if (!user) {
    return {
      success: false,
      message: "User data not found",
    };
  }
  if(token){await setTokenInCookies("better-auth.session_token", token)}
  if(accessToken){await setTokenInCookies("accessToken", accessToken)}
  if(refreshToken){await setTokenInCookies("refreshToken", refreshToken)}
  await setSessionIdentity({
    user,
    providerProfile: response.data.providerProfile,
  });

  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    redirect(callbackUrl);
  }

  const role = user.role.toUpperCase();
  switch (role) {
    case 'CUSTOMER':
      redirect("/console/customer");

    case 'PROVIDER':
      redirect("/console/provider");

    case 'ADMIN':
      redirect("/console/admin");

    default:
      redirect("/");
  }
}
