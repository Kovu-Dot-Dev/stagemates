import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// should be int but lazy change
export async function sendInvites(
  jamId: string,
  bandId: string,
  userId: string
) {
  console.log(
    "Sending invites for jam:",
    jamId,
    "and band:",
    bandId,
    "from user:",
    userId
  );

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

export async function addUserToBand(bandId: string, userId: string) {
  console.log("Adding user to band:", bandId, "user:", userId);

  try {
    const response = await fetch("/api/band-members", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bandId: parseInt(bandId),
        userId: parseInt(userId),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("User added to band successfully:", result);
      return { success: true, message: result.message, data: result.data };
    } else {
      console.error("Error adding user to band:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Error calling add user to band API:", error);
    return { success: false, error: "Failed to add user to band" };
  }
}
