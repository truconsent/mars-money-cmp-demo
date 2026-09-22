
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import "@truconsent/consent-notice/RightCenter.css"
import { RightCenter } from "@truconsent/consent-notice"



const RightsCenter = () => {
  const { user } = useAuth();

  // No forced login redirect here: a non-SSO customer (no site login) must
  // still be able to reach this page and verify via mobile OTP inside the
  // widget itself. When `user` is signed in, its id is passed as the SSO
  // identity; otherwise the widget falls back to its own non-SSO flow.

  return (
    <div className="">
      <Navigation />
      <RightCenter
        userId={user?.id}
        apiUrl={import.meta.env.VITE_TRU_CONSENT_API_URL}
        apiKey={import.meta.env.VITE_TRU_CONSENT_API_KEY_RIGHT}
        assetId={import.meta.env.VITE_TRU_CONSENT_ASSET_ID}
        organizationId={import.meta.env.VITE_TRU_CONSENT_ORGANIZATION_ID}
      />

      <Footer />
    </div>
  );
};

export default RightsCenter;
