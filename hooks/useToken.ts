import { useCallback, useState } from "react";

export interface TokenResponse {
  token: string;
}

export function useToken() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = useCallback(async (room: string, username: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/livekit/get-token?room=${room}&username=${username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }
      const data: TokenResponse = await response.json();
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Possible server error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { token, error, isLoading, getToken };
}
