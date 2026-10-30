import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TruConsentModal } from "@truconsent/consent-notice"
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";

// truConsent collection point shown before this form is submitted.
const BANNER_ID = "CP040";

interface SavingsAccountFormProps {
  onBack: () => void;
}
interface SavingsFormData {
  fullName: string;
  email: string;
  phone: string;
  pan: string;
  aadhar: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  accountType: string;
  initialDeposit: string;
}
export const SavingsAccountForm = ({ onBack }: SavingsAccountFormProps) => {
  const { user, profile, logout } = useAuth();
  const [step, setStep] = useState(1);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SavingsFormData>();
  const [showBanner, setShowBanner] = useState(false)
  const [guestId, setGuestId] = useState<string | null>(null)
  const onSubmit = async (data: SavingsFormData) => {
    console.log("Savings Account Application:", data);
    if (!user) {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    }
    setShowBanner(true)

  };
  const onSubmitted = async (type: string) => {
    console.log("Savings Account Application: TruConsentModal onClose triggered with type:", type);
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);

    if (outcome === "consented") {
      toast({
        title: "Application Submitted",
        description: "Your savings account application has been submitted successfully!",
      });
      onBack();
      setShowBanner(false);
    } else if (outcome === "declined") {
      toast({
        variant: "destructive",
        title: "Application Cancelled",
        description: "Your application was not submitted as consent was declined.",
      });
      onBack();
      setShowBanner(false);
    } else {
      // For no_action or closing without decision, just hide the banner
      setShowBanner(false);
    }
  };
  return (
    <Card className="w-full max-w-4xl mx-auto">
      {showBanner && (user || guestId) && (
        <>
          {/* <TruConsentModal
            assetId={import.meta.env.VITE_TRU_CONSENT_ASSET_ID}
            userId={user ? user.id : guestId!}
            logoUrl={"/lovable-uploads/d3d83a6e-8210-420a-a23b-0c89fc7ee3f4.png"}
            bannerId={"CP003"}
            onClose={(type) => {
              // console.log("close")
              onSubmitted(type)
            }}
          /> */}
          <TruConsentModal
            assetId={import.meta.env.VITE_TRU_CONSENT_ASSET_ID}
            userId={user ? user.id : guestId!}
            logoUrl={"/lovable-uploads/d3d83a6e-8210-420a-a23b-0c89fc7ee3f4.png"}
            bannerId={BANNER_ID}
            apiUrl={import.meta.env.VITE_TRU_CONSENT_API_URL}
            apiKey={import.meta.env.VITE_TRU_CONSENT_API_KEY}
            organizationId={import.meta.env.VITE_TRU_CONSENT_ORGANIZATION_ID}
            onClose={(type) => {
              onSubmitted(type);
            }}
          />
        </>
      )}
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <PiggyBank className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Savings Account Application
            </CardTitle>
            <CardDescription>
              Powered by Federal Bank • Zero balance accounts with attractive interest rates
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-xl text-gray-900 border-b pb-3">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    {...register("fullName", { required: "Full name is required" })}
                    placeholder="Enter your full name"
                    className="mt-2"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="Enter your email"
                    className="mt-2"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    {...register("phone", { required: "Phone number is required" })}
                    placeholder="Enter your phone number"
                    className="mt-2"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="pan">PAN Number *</Label>
                  <Input
                    id="pan"
                    {...register("pan", { required: "PAN is required" })}
                    placeholder="Enter your PAN number"
                    className="mt-2"
                  />
                  {errors.pan && (
                    <p className="text-sm text-red-600 mt-1">{errors.pan.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="aadhar">Aadhar Number *</Label>
                  <Input
                    id="aadhar"
                    {...register("aadhar", { required: "Aadhar is required" })}
                    placeholder="Enter your Aadhar number"
                    className="mt-2"
                  />
                  {errors.aadhar && (
                    <p className="text-sm text-red-600 mt-1">{errors.aadhar.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-6">
                <Button type="button" onClick={() => setStep(2)} size="lg">
                  Next Step
                </Button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-semibold text-xl text-gray-900 border-b pb-3">Address & Account Details</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    {...register("address", { required: "Address is required" })}
                    placeholder="Enter your address"
                    className="mt-2"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register("city", { required: "City is required" })}
                      placeholder="Enter city"
                      className="mt-2"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      {...register("state", { required: "State is required" })}
                      placeholder="Enter state"
                      className="mt-2"
                    />
                    {errors.state && (
                      <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      {...register("pincode", { required: "Pincode is required" })}
                      placeholder="Enter pincode"
                      className="mt-2"
                    />
                    {errors.pincode && (
                      <p className="text-sm text-red-600 mt-1">{errors.pincode.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="accountType">Account Type *</Label>
                    <Select onValueChange={(value) => setValue("accountType", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular Savings</SelectItem>
                        <SelectItem value="premium">Premium Savings</SelectItem>
                        <SelectItem value="senior">Senior Citizen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="initialDeposit">Initial Deposit *</Label>
                    <Input
                      id="initialDeposit"
                      {...register("initialDeposit", { required: "Initial deposit is required" })}
                      placeholder="Enter amount"
                      className="mt-2"
                    />
                    {errors.initialDeposit && (
                      <p className="text-sm text-red-600 mt-1">{errors.initialDeposit.message}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={() => setStep(1)} size="lg">
                  Previous
                </Button>
                <Button type="submit" size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                  Submit Application
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
