
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TruConsentModal } from "@truconsent/consent-notice";
import { creditCardFormSchema, CreditCardFormData } from "./creditCard/creditCardSchema";
import { FinancialInfoSection } from "./creditCard/FinancialInfoSection";
import { PersonalInfoSection } from "./creditCard/PersonalInfoSection";
import { IdentityVerificationSection } from "./creditCard/IdentityVerificationSection";
import { ContactInfoSection } from "./creditCard/ContactInfoSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";

// truConsent collection point shown before this form is submitted.
const BANNER_ID = "CP016";

interface CreditCardFormProps {
  onBack: () => void;
}

export const CreditCardForm = ({ onBack }: CreditCardFormProps) => {
  const { user, profile, logout } = useAuth();
  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: {
      name: "",
      panNumber: "",
      gender: "",
      dateOfBirth: "",
      emailAddress: "",
      address: "",
      aadharNumber: "",
      maritalStatus: "",
      mobileNumber: "",
      salaryDetails: "",
    },
  });

  const [showBanner, setShowBanner] = useState(false);
  const [formData, setFormData] = useState<CreditCardFormData | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  const saveApplication = async (data: CreditCardFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          application_type: 'credit_card',
          application_data: data,
          status: 'submitted'
        });

      if (error) {
        console.error('Error saving application:', error);
        toast({
          title: "Error",
          description: "Failed to save application. Please try again.",
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving application:', error);
      return false;
    }
  };

  const onSubmit = async (data: CreditCardFormData) => {
    console.log("Credit Card Application: Form submitted. Data captured:", data);
    setFormData(data);
    console.log("Credit Card Application: Setting showBanner to true to display TruConsentModal.");
    if (!user) {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    }
    setShowBanner(true);
    console.log("Credit Card Application: showBanner state is now:", true);
  };

  const onSubmitted = async (type: string) => {
    console.log("Credit Card Application: TruConsentModal onClose triggered with type:", type);
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);

    if (outcome === "consented" && formData) {
      const saved = await saveApplication(formData);
      if (saved) {
        toast({
          title: "Application Submitted",
          description: "Your credit card application has been submitted successfully! We will review and contact you soon.",
        });
        console.log("Credit Card Application: Consent approved. Hiding banner and navigating back.");
        setShowBanner(false);
        onBack();
      }
    } else if (outcome === "declined") {
      toast({
        variant: "destructive",
        title: "Application Cancelled",
        description: "Your credit card application was not submitted as consent was declined.",
      });
      console.log("Credit Card Application: Consent declined. Hiding banner and navigating back.");
      setShowBanner(false);
      onBack();
    } else {
      // For no_action or closing without decision, just hide the banner
      setShowBanner(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {showBanner && (user || guestId) && (
        <TruConsentModal
          organizationId={import.meta.env.VITE_TRU_CONSENT_ORGANIZATION_ID}
          apiKey={import.meta.env.VITE_TRU_CONSENT_API_KEY}
          assetId={import.meta.env.VITE_TRU_CONSENT_ASSET_ID}
          bannerId={BANNER_ID}
          apiUrl={import.meta.env.VITE_TRU_CONSENT_API_URL}
          userId={user ? user.id : guestId!}
          logoUrl={"/lovable-uploads/d3d83a6e-8210-420a-a23b-0c89fc7ee3f4.png"}
          onClose={(type) => {
            onSubmitted(type);
          }}
        />
      )}

      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
              Credit Card Application
            </CardTitle>
            <CardDescription className="text-sm md:text-base">
              Powered by Catholic Syrian Bank • Credit Card Application (CSB)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FinancialInfoSection form={form} />
            <PersonalInfoSection form={form} />
            <IdentityVerificationSection form={form} />
            <ContactInfoSection form={form} />

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 order-2 sm:order-1" size="lg">
                Back to Services
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 order-1 sm:order-2" size="lg">
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
