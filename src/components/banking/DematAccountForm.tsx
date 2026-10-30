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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TruConsentModal } from "@truconsent/consent-notice";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";

// truConsent collection point shown before this form is submitted.
const BANNER_ID = "CP037";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number (e.g., ABCDE1234F)"),
  aadharNumber: z
    .string()
    .regex(/^\d{12}$/, "Please enter a valid 12-digit Aadhar number"),
  gender: z.string().min(1, "Please select your gender"),
  dateOfBirth: z.string().min(1, "Please enter your date of birth"),
  emailAddress: z.string().email("Please enter a valid email address"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  address: z.string().min(10, "Please enter your complete address"),
  annualIncome: z.string().min(1, "Please select your annual income"),
  tradingExperience: z.string().min(1, "Please select your trading experience"),
  investmentObjective: z.string().min(1, "Please select your investment objective"),
});

type FormData = z.infer<typeof formSchema>;

interface DematAccountFormProps {
  onBack: () => void;
}

export const DematAccountForm = ({ onBack }: DematAccountFormProps) => {
  const { user } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      panNumber: "",
      aadharNumber: "",
      gender: "",
      dateOfBirth: "",
      emailAddress: "",
      mobileNumber: "",
      address: "",
      annualIncome: "",
      tradingExperience: "",
      investmentObjective: "",
    },
  });

  const [showBanner, setShowBanner] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  const saveApplication = async (data: FormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          user_id: user.id,
          application_type: 'demat_account',
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

  const onSubmit = async (data: FormData) => {
    console.log("Demat Account Form data captured:", data);
    setFormData(data);
    console.log("Demat Account Application: Setting showBanner to true to display TruConsentModal.");
    if (!user) {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    }
    setShowBanner(true);
    console.log("Demat Account Application: showBanner state is now:", true);
  };

  const onSubmitted = async (type: string) => {
    console.log("Demat Account Application: TruConsentModal onClose triggered with type:", type);
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);

    if (outcome === "consented" && formData) {
      const saved = await saveApplication(formData);
      if (saved) {
        toast({
          title: "Application Submitted",
          description: "Your Demat account application has been submitted successfully! You can now proceed to mutual fund selection.",
        });
        console.log("Demat Account Application: Consent approved. Hiding banner and navigating back.");
        setShowBanner(false);
        onBack();
      }
    } else if (outcome === "declined") {
      toast({
        variant: "destructive",
        title: "Application Cancelled",
        description: "Your Demat account application was not submitted as consent was declined.",
      });
      console.log("Demat Account Application: Consent declined. Hiding banner and navigating back.");
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
      )}

      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Demat Account Application
            </CardTitle>
            <CardDescription>
              Powered by mars.money • Start your investment journey
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Identity Verification */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Identity Verification
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  name="aadharNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhar Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456789012"
                          {...field}
                          maxLength={12}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your complete address with pincode"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Investment Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Investment Profile
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="annualIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select income" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="below-1lakh">Below ₹1 Lakh</SelectItem>
                          <SelectItem value="1-5lakh">₹1-5 Lakhs</SelectItem>
                          <SelectItem value="5-10lakh">₹5-10 Lakhs</SelectItem>
                          <SelectItem value="10-25lakh">₹10-25 Lakhs</SelectItem>
                          <SelectItem value="above-25lakh">Above ₹25 Lakhs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tradingExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trading Experience *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="1-2years">1-2 Years</SelectItem>
                          <SelectItem value="3-5years">3-5 Years</SelectItem>
                          <SelectItem value="above-5years">Above 5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investmentObjective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Objective *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select objective" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="wealth-creation">Wealth Creation</SelectItem>
                          <SelectItem value="income-generation">Income Generation</SelectItem>
                          <SelectItem value="tax-saving">Tax Saving</SelectItem>
                          <SelectItem value="capital-appreciation">Capital Appreciation</SelectItem>
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
              <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700" size="lg">
                Open Demat Account
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
