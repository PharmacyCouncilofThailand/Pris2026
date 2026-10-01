export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "revoked";

export type InvitationDecision = "accepted" | "declined";

export interface PublicInvitationDto {
  invitationId: string;
  status: InvitationStatus;
  respondedAt: string | null;
  effectiveDeadline: string;
  recipientFirstName: string | null;
  session: {
    sessionName: string;
    sessionType: string | null;
    startTime: string;
    endTime: string;
    room: string | null;
  };
}

export interface InvitationErrorDto {
  error: string;
  code: string;
  invitation?: PublicInvitationDto;
}

export async function requestInvitation(
  apiOrigin: string,
  token: string,
  decision: InvitationDecision | null,
  signal?: AbortSignal,
): Promise<{ httpStatus: number; body: PublicInvitationDto | InvitationErrorDto }> {
  const origin = apiOrigin.replace(/\/$/, "");
  const response = await fetch(
    `${origin}/api/session-invitations/current${decision ? "/response" : ""}`,
    {
      method: decision ? "PUT" : "GET",
      cache: "no-store",
      signal,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(decision ? { "Content-Type": "application/json" } : {}),
      },
      ...(decision ? { body: JSON.stringify({ decision }) } : {}),
    },
  );
  return {
    httpStatus: response.status,
    body: await response.json() as PublicInvitationDto | InvitationErrorDto,
  };
}
