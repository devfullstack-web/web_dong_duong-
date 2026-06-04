import { generateTokens, decrypt, logout } from "@/services/auth";
import { apiResponse, apiError } from "@/utils/api-response";

export async function POST() {
  try {
    const { cookies } = await import("next/headers");
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (!refreshToken) return apiError("Refresh token missing", 400);

    const payload = await decrypt(refreshToken);
    if (!payload || !payload.user) {
      await logout();
      return apiError("Invalid refresh token", 401);
    }

    const tokens = await generateTokens(payload.user);
    
    // Set Cookies
    const { setAuthCookies } = await import("@/services/auth");
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return apiResponse({ user: tokens.sessionPayload });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    await logout();
    if (error instanceof Error && error.message === 'USER_INACTIVE_OR_LOCKED') {
      return apiError("Invalid refresh token", 401);
    }
    return apiError("Internal server error", 500);
  }
}
