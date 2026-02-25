import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

export function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate form submission
      // In production, you would send this to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitted(true);
      toast({
        title: "Success!",
        description: "Your inquiry has been received. We'll be in touch soon!",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-background rounded-xl p-8 border border-border flex flex-col items-center justify-center text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h4 className="text-2xl font-bold mb-2">Thank You!</h4>
        <p className="text-muted-foreground">
          We've received your inquiry and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-background rounded-xl p-8 border border-border space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          disabled={loading}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          disabled={loading}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subject</label>
        <Input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Inquiry Subject"
          disabled={loading}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Your message..."
          disabled={loading}
          className="w-full min-h-32"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Inquiry"
        )}
      </Button>
    </form>
  );
}
