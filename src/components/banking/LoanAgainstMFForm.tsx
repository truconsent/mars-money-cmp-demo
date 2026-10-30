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
import { TrendingUp } from "lucide-react";
import { TruConsentModal } from "@truconsent/consent-notice";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";
import { toast } from "@/components/ui/use-toast";

// truConsent collection point shown before this form is submitted.
const BANNER_ID = "CP014";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number (e.g., ABCDE1234F)"),
  emailAddress: z.string().email("Please enter a valid email address"),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  portfolioValue: z.string().min(1, "Please enter portfolio value"),
  loanAmount: z.string().min(1, "Please enter required loan amount"),
  loanPurpose: z.string().min(1, "Please select loan purpose"),
  repaymentTenure: z.string().min(1, "Please select repayment tenure"),
});

type FormData = z.infer<typeof formSchema>;

interface LoanAgainstMFFormProps {
  onBack: () => void;
}

export const LoanAgainstMFForm = ({ onBack }: LoanAgainstMFFormProps) => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      panNumber: "",
      emailAddress: "",
      mobileNumber: "",
      portfolioValue: "",
      loanAmount: "",
      loanPurpose: "",
      repaymentTenure: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Loan Against MF Form submitted:", data);
    if (!user) {
      const id = await getOrCreateGuestId();
      setGuestId(id);
    }
    setShowBanner(true);
  };

  const onSubmitted = async (type: string) => {
    console.log("Loan Against MF Application: TruConsentModal onClose triggered with type:", type);
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);

    if (outcome === "consented") {
      toast({
        title: "Application Submitted",
        description: "Your loan against mutual funds application has been submitted successfully!",
      });
      onBack();
      setShowBanner(false);
    } else if (outcome === "declined") {
      toast({
        variant: "destructive",
        title: "Application Cancelled",
        description: "Your loan against mutual funds application was not submitted as consent was declined.",
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
          <TruConsentModal
            assetId={import.meta.env.VITE_TRU_CONSENT_ASSET_ID}
            userId={user ? user.id : guestId!}
            logoUrl={"/lovable-uploads/d3d83a6e-8210-420a-a23b-0c89fc7ee3f4.png"}
            apiUrl={import.meta.env.VITE_TRU_CONSENT_API_URL}
            apiKey={import.meta.env.VITE_TRU_CONSENT_API_KEY}
            organizationId={import.meta.env.VITE_TRU_CONSENT_ORGANIZATION_ID}
            bannerId={BANNER_ID}
            onClose={(type) => {
              onSubmitted(type);
            }}
          />
        </>
      )}
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Loan Against Mutual Funds
            </CardTitle>
            <CardDescription>
              Powered by mars.money • Get instant loans against your MF portfolio
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

            {/* Portfolio & Loan Details */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900 border-b pb-3">
                Portfolio & Loan Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="portfolioValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Portfolio Value *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Current market value"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Loan Amount *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Up to 70% of portfolio"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="loanPurpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Purpose *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select loan purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="emergency">Emergency Fund</SelectItem>
                          <SelectItem value="medical">Medical Expenses</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="business">Business Investment</SelectItem>
                          <SelectItem value="home-improvement">Home Improvement</SelectItem>
                          <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repaymentTenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repayment Tenure *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenure" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="3months">3 Months</SelectItem>
                          <SelectItem value="6months">6 Months</SelectItem>
                          <SelectItem value="12months">12 Months</SelectItem>
                          <SelectItem value="24months">24 Months</SelectItem>
                          <SelectItem value="36months">36 Months</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl">
              <h4 className="font-semibold text-blue-900 mb-3">Key Benefits</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Continue earning returns on your mutual fund investments</li>
                <li>• Lower interest rates compared to personal loans</li>
                <li>• No processing fees or hidden charges</li>
                <li>• Instant approval and disbursal</li>
                <li>• Flexible repayment options</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1" size="lg">
                Back to Services
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700" size="lg">
                Apply for Loan
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
