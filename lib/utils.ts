import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// should be int but lazy change
export async function sendInvites(jamId: string, bandId: string, userId: string) {
  console.log("Sending invites for jam:", jamId, "and band:", bandId, "from user:", userId);

  try {
    const response = await fetch("/api/invites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jamId: parseInt(jamId),
        bandId: parseInt(bandId),
        userId: parseInt(userId),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Invites sent successfully:", result);
      return { success: true, message: result.message, data: result.data };
    } else {
      console.error("Error sending invites:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error calling invites API:", error);
    return { success: false, error: "Failed to send invites" };
  }
}