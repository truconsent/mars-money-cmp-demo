
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { TruConsentModal } from '@truconsent/consent-notice';
import { getOrCreateGuestId } from '@/utils/guestId';
import { getConsentOutcome } from '@/utils/consent';

// truConsent collection point shown before the account is created.
const BANNER_ID = 'CP018';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  // Redirect authenticated users to home page
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<SignupFormData | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  // Show the consent notice first; the account is created only once it is accepted.
  const onSubmit = async (data: SignupFormData) => {
    setGuestId(await getOrCreateGuestId());
    setFormData(data);
  };

  const onConsentClose = async (type: string) => {
    const data = formData;
    const outcome = await getConsentOutcome(type, BANNER_ID, guestId!);
    setFormData(null);
    if (outcome === 'consented' && data) {
      await createAccount(data);
    } else if (outcome === 'declined') {
      toast({
        title: "Account not created",
        description: "Your account was not created as consent was declined.",
        variant: "destructive",
      });
    }
  };

  const createAccount = async (data: SignupFormData) => {
    const result = await signup(data.email, data.password, data.name);
    
    if (result.success) {
      if (result.error) {
        toast({
          title: "Account created!",
          description: result.error,
        });
      } else {
        toast({
          title: "Welcome to mars.money!",
          description: "Your account has been created successfully.",
        });
        navigate('/', { replace: true });
      }
    } else {
      toast({
        title: "Signup failed",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Don't render the form if user is already authenticated
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center p-4">
      {formData && guestId && (
        <TruConsentModal
          organizationId={import.meta.env.VITE_TRU_CONSENT_ORGANIZATION_ID}
          apiKey={import.meta.env.VITE_TRU_CONSENT_API_KEY}
          assetId={import.meta.env.VITE_TRU_CONSENT_ASSET_ID}
          bannerId={BANNER_ID}
          apiUrl={import.meta.env.VITE_TRU_CONSENT_API_URL}
          userId={guestId}
          logoUrl={"/lovable-uploads/d3d83a6e-8210-420a-a23b-0c89fc7ee3f4.png"}
          onClose={(type) => {
            onConsentClose(type);
          }}
        />
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Join mars.money</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                {...register('name')}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
