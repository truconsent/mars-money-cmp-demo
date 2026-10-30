// Decides what a TruConsentModal close means for the form behind it, so a form
// is only submitted once the user has consented on the truConsent banner.
//
// The banner closes with one of: "Approved", "Partially Consented", "Declined",
// "No Action" (closed without choosing), "notice_shown" (a notice-only banner,
// where every purpose is legitimate use, was acknowledged) or "no_action" (the
// banner had nothing to show).

export type ConsentOutcome = "consented" | "declined" | "dismissed";

interface BannerPurpose {
  isMandatory: boolean;
  isLegitimate: boolean;
  consented?: string;
}

// "Partially Consented" is also what the banner reports when the user switches
// a mandatory purpose off and proceeds anyway, so re-read the recorded consent
// and require every mandatory consent purpose to be accepted.
async function mandatoryPurposesAccepted(bannerId: string, userId: string): Promise<boolean> {
  const url =
    `${import.meta.env.VITE_TRU_CONSENT_API_URL}/api/v1/internal/consent/` +
    `${import.meta.env.VITE_TRU_CONSENT_ASSET_ID}/${bannerId}?userId=${encodeURIComponent(userId)}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": import.meta.env.VITE_TRU_CONSENT_API_KEY,
        "X-Org-Id": import.meta.env.VITE_TRU_CONSENT_ORGANIZATION_ID,
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { purposes = [] } = (await res.json()) as { purposes?: BannerPurpose[] };
    return purposes
      .filter((p) => p.isMandatory && !p.isLegitimate)
      .every((p) => p.consented === "accepted");
  } catch (error) {
    // Without proof of consent the form must not be submitted.
    console.error("TruConsent: could not verify consent for", bannerId, error);
    return false;
  }
}

export async function getConsentOutcome(
  closeType: string | undefined,
  bannerId: string,
  userId: string,
): Promise<ConsentOutcome> {
  const type = (closeType || "no_action").toLowerCase().replace(/ /g, "_");

  if (type === "approved" || type === "notice_shown") return "consented";
  if (type === "declined" || type === "rejected") return "declined";
  if (type === "partially_consented" || type === "partial_consent") {
    return (await mandatoryPurposesAccepted(bannerId, userId)) ? "consented" : "declined";
  }
  return "dismissed";
}
