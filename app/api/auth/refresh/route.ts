import { generateTokens, decrypt } from "@/services/auth";
import { apiResponse, apiError } from "@/utils/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    let refreshToken = body.refreshToken;

    if (!refreshToken) {
      const { cookies } = await import("next/headers");
      refreshToken = (await cookies()).get("refreshToken")?.value;
    }

    if (!refreshToken) return apiError("Refresh token missing", 400);

    const payload = await decrypt(refreshToken);
    if (!payload || !payload.user) return apiError("Invalid refresh token", 401);

    const tokens = await generateTokens(payload.user);
    
    // Set Cookies
    const { setAuthCookies, login } = await import("@/services/auth");
    await setAuthCookies(tokens.accessToken, tokens.refreshToken);
    // Cập nhật session cookie để đồng bộ is_super, roles, permissions mới nhất
    await login(tokens.sessionPayload);

    return apiResponse({ user: payload.user });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return apiError("Internal server error", 500);
  }
}
