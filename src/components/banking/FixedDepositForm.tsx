import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TruConsentModal } from "@truconsent/consent-notice";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";

// truConsent collection point shown before this form is submitted.
const BANNER_ID = "CP036";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number (e.g., ABCDE1234F)"),
  emailAddress: z.string().email("Please enter a valid email address"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  depositAmount: z.string().min(1, "Please enter deposit amount"),
  tenure: z.string().min(1, "Please select tenure"),
  interestPayout: z.string().min(1, "Please select interest payout frequency"),
  nomineeType: z.string().min(1, "Please select nominee type"),
});

type FormData = z.infer<typeof formSchema>;

interface FixedDepositFormProps {
  onBack: () => void;
}

export const FixedDepositForm = ({ onBack }: FixedDepositFormProps) => {
  const { user } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      panNumber: "",
      emailAddress: "",
      mobileNumber: "",
      depositAmount: "",
      tenure: "",
      interestPayout: "",
      nomineeType: "",
    },
  });

  const saveApplication = async (data: FormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          application_type: 'fixed_deposit',
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

  const [showBanner, setShowBanner] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  // Show the consent banner first; the application is saved only after consent.
  const onSubmit = async (data: FormData) => {
    console.log("Fixed Deposit Form submitted:", data);
    setFormData(data);
    if (!user) {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    }
    setShowBanner(true);
  };

  const onSubmitted = async (type: string) => {
    console.log("Fixed Deposit Application: TruConsentModal onClose triggered with type:", type);
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);

    if (outcome === "consented" && formData) {
      const saved = await saveApplication(formData);
      setShowBanner(false);
      if (saved) {
        toast({
          title: "Application Submitted",
          description: "Fixed deposit application submitted successfully! We will process your request soon.",
        });
        onBack();
      }
    } else if (outcome === "declined") {
      toast({
        variant: "destructive",
        title: "Application Cancelled",
        description: "Your fixed deposit application was not submitted as consent was declined.",
      });
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
            <Wallet className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Fixed Deposit Application
            </CardTitle>
            <CardDescription>
              Powered by Federal Bank • Secure your savings with guaranteed returns
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="panNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ABCDE1234F" 
                          {...field}
                          style={{ textTransform: 'uppercase' }}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="9876543210" 
                          {...field}
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Deposit Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Fixed Deposit Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="depositAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Minimum ₹10,000" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenure *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="1year">1 Year</SelectItem>
                          <SelectItem value="2years">2 Years</SelectItem>
                          <SelectItem value="3years">3 Years</SelectItem>
                          <SelectItem value="5years">5 Years</SelectItem>
                          <SelectItem value="10years">10 Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestPayout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Payout *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payout frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                          <SelectItem value="maturity">At Maturity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nomineeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nominee Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nominee type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1" size="lg">
                Back to Services
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700" size="lg">
                Book Fixed Deposit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
