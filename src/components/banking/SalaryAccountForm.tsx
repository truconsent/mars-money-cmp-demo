import React, { useState } from "react"; // Added useState import
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
import { Building2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast"; // Importing toast
import { TruConsentModal } from "@truconsent/consent-notice"; // Importing TruConsentModal
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";

// truConsent collection point shown before this form is submitted.
const BANNER_ID = "CP039";

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
  businessPartner: z.string().min(1, "Please select your business partner"),
});

type FormData = z.infer<typeof formSchema>;

interface SalaryAccountFormProps {
  onBack: () => void;
}

const businessPartners = [
  "TruConsent",
  "HTS Consulting",
  "Tech Mahindra",
  "Wipro Limited",
  "Infosys Technologies"
];

export const SalaryAccountForm = ({ onBack }: SalaryAccountFormProps) => {
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
      businessPartner: "",
    },
  });

  // State to control the visibility of the TruConsentModal
  const [showBanner, setShowBanner] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  // onSubmit function, now triggers the consent banner
  const onSubmit = async (data: FormData) => {
    console.log("Salary Account Form data captured:", data);
    // Instead of direct submission, show the consent banner
    if (!user) {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    }
    setShowBanner(true);
  };

  // onSubmitted function, handles the response from the TruConsentModal
  const onSubmitted = async (type: string) => {
    console.log("Salary Account Application: TruConsentModal onClose triggered with type:", type);
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);

    if (outcome === "consented") {
      // If consent is approved, proceed with application submission success
      toast({
        title: "Application Submitted",
        description: "Salary account application submitted successfully! We will contact you soon.",
      });
      setShowBanner(false); // Hide the banner as consent is given and processed
      onBack(); // Navigate back or reset form
    } else if (outcome === "declined") {
      // If consent is declined, inform the user and go back
      toast({
        variant: "destructive",
        title: "Application Cancelled",
        description: "Your salary account application was not submitted as consent was declined.",
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
      {/* Conditionally render the TruConsentModal.
          It will appear when showBanner state is true, typically after the user attempts to submit the form. */}
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Salary Account Application
            </CardTitle>
            <CardDescription>
              Powered by Federal Bank • Corporate salary account with exclusive benefits
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          {/* The form's onSubmit event is now tied to our custom onSubmit function,
              which will trigger the consent banner display. */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Business Partnership */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Business Partnership
              </h3>

              <FormField
                control={form.control}
                name="businessPartner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Your Company *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessPartners.map((partner) => (
                          <SelectItem key={partner} value={partner}>
                            {partner}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1" size="lg">
                Back to Services
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" size="lg">
                Submit Application
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
