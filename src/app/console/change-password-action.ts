'use server';

import axios from 'axios';
import { getBackendAuthHeaders } from '@/lib/auth/backend-auth-headers';
import { setTokenInCookies } from '@/lib/tokenUtils';
import {
  changePasswordZodSchema,
  type IChangePasswordPayload,
} from '@/zod/auth.validation';
import type { ApiErrorResponse, ApiResponse } from '@/types/api.type';

export interface ChangePasswordResult {
  passwordChanged: boolean;
}

export async function changePasswordAction(
  payload: IChangePasswordPayload
): Promise<ApiResponse<ChangePasswordResult> | ApiErrorResponse> {
  const parsed = changePasswordZodSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      success: false,
      message: issue?.message || 'Invalid password input',
    };
  }

  try {
    const headers = await getBackendAuthHeaders();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await axios.patch<ApiResponse<ChangePasswordResult>>(
      `${apiUrl}/api/auth/password`,
      {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      },
      {
        headers,
        withCredentials: true,
      }
    );

    // If backend returns rotated session token in cookies, sync it to Next.js cookie store
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const cookiesList = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : [setCookieHeader];
      for (const cookieStr of cookiesList) {
        const match = cookieStr.match(
          /(?:better-auth\.session_token|__Secure-better-auth\.session_token)=([^;]+)/
        );
        if (match && match[1]) {
          await setTokenInCookies('better-auth.session_token', match[1]);
        }
      }
    }

    return {
      success: true,
      message: response.data?.message || 'Password changed successfully!',
      data: response.data?.data || { passwordChanged: true },
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      const currentPasswordError =
        responseData?.error?.fields?.currentPassword ||
        responseData?.errors?.currentPassword;

      const newPasswordError =
        responseData?.error?.fields?.newPassword ||
        responseData?.errors?.newPassword;

      let message =
        currentPasswordError ||
        newPasswordError ||
        responseData?.error?.message ||
        responseData?.message;

      // When the current password check fails or generic validation failure occurs without new password error
      if (
        currentPasswordError ||
        message === 'The request contains invalid data.' ||
        message === 'The password could not be changed.' ||
        (error.response?.status === 422 && !newPasswordError)
      ) {
        message = 'The current password is incorrect.';
      } else if (error.response?.status === 401) {
        message = 'Your session has expired. Please sign in again.';
      } else if (!message) {
        message = 'The current password is incorrect.';
      }

      return {
        success: false,
        message,
        code: responseData?.error?.code || responseData?.code,
      };
    }


    return {
      success: false,
      message: 'An unexpected error occurred while updating your password.',
    };
  }
}
