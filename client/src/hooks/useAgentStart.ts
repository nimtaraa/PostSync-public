// FILE: src/hooks/useAgentStart.ts

import { useState } from "react";
// 1. Import AxiosError
import axios from "axios";

// Get the backend URL from environment variables
const API_URL = import.meta.env.VITE_BACKEND_URL;

export const useAgentStart = () => {
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [startMessage, setStartMessage] = useState<string | null>(null);

  // Accept 'token' as a new argument
  const startAgent = async (niche: string, token: string) => {
    setStarting(true);
    setStartError(null);
    setStartMessage(null);

    try {
      // Make the API call with the token in the headers
      const res = await axios.post(
        `${API_URL}/agent/start`, // Use the live backend URL
        { niche }, // This is the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStartMessage(res.data.message || "Agent started successfully!");

    // 2. Catch the error as 'unknown'
    } catch (err: unknown) {
      console.error("Failed to start agent:", err);
      let message = "Failed to start agent";

      // 3. Safely check if it's an Axios error
      if (axios.isAxiosError(err)) {
        // Now we know 'err' is an AxiosError, so we can safely
        // access err.response and err.response.data
        if (err.response?.data?.detail) {
          message = err.response.data.detail;
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        // Handle standard JavaScript errors
        message = err.message;
      }
      
      setStartError(message);
    } finally {
      setStarting(false);
    }
  };

  return { startAgent, starting, startError, startMessage };
};