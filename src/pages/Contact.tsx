
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones } from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { TruConsentModal } from "@truconsent/consent-notice";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateGuestId } from "@/utils/guestId";
import { getConsentOutcome } from "@/utils/consent";

// truConsent collection point shown before the message is sent.
const BANNER_ID = "CP011";

const Contact = () => {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  // Show the consent notice first; the message is sent only once it is accepted.
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setGuestId(await getOrCreateGuestId());
    }
    setShowBanner(true);
  };

  const onConsentClose = async (type: string) => {
    const outcome = await getConsentOutcome(type, BANNER_ID, user ? user.id : guestId!);
    setShowBanner(false);
    if (outcome === "consented") {
      toast({
        title: "Message Sent",
        description: "Thanks for reaching out! Our support team will get back to you soon.",
      });
      formRef.current?.reset();
    } else if (outcome === "declined") {
      toast({
        variant: "destructive",
        title: "Message Not Sent",
        description: "Your message was not sent as consent was declined.",
      });
    }
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our customer service team",
      details: "1800-123-4567",
      availability: "24/7 Available"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us your queries and we'll respond promptly",
      details: "support@mars.money",
      availability: "Response within 24 hours"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Get instant help through our live chat feature",
      details: "Available on our app",
      availability: "9 AM - 9 PM"
    },
    {
      icon: Headphones,
      title: "Video Call Support",
      description: "Face-to-face assistance for complex queries",
      details: "Schedule a call",
      availability: "9 AM - 6 PM"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      <Navigation />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help! Get in touch with our support team for any questions or assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                        <method.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {method.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{method.description}</p>
                      <p className="font-semibold text-purple-600 mb-2">{method.details}</p>
                      <p className="text-sm text-gray-500">{method.availability}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
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
                    onConsentClose(type);
                  }}
                />
              )}
              <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="john.doe@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>General Inquiry</option>
                    <option>Account Support</option>
                    <option>Technical Issue</option>
                    <option>Investment Query</option>
                    <option>Loan Application</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <MapPin className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Head Office</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  mars.money Headquarters<br />
                  Electronic City, Bangalore<br />
                  Karnataka 560100, India
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 9:00 AM - 2:00 PM<br />
                  Sunday: Emergency support only
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <Headphones className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Emergency support available<br />
                  round the clock for critical<br />
                  banking and payment issues
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Contact;
