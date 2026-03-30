import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BruteButton from '../components/BruteButton';
import { COURSE_PRICING } from '../data/coursePricing';
import { enrollAfterPurchase } from '../services/enrollService';

// Razorpay's window interface extension
declare global {
  interface Window {
    Razorpay: any;
  }
}

function BuyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const courseId = searchParams.get('course');
  
  // Validate course from query string immediately
  const course = courseId ? COURSE_PRICING[courseId] : null;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollStatus, setEnrollStatus] = useState<'idle' | 'success' | 'checking'>('idle');
  const [hasPaid, setHasPaid] = useState(false);
  const [razorpayData, setRazorpayData] = useState<{
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  } | null>(null);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Redirect back to courses if course is invalid
    if (!course) {
      navigate('/#courses');
    }
  }, [course, navigate]);

  // Sanitize simple inputs
  const sanitize = (val: string) => {
    return val.replace(/[<>]/g, '').trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: sanitize(e.target.value)
    });
  };

  const handlePayment = async () => {
    setError(null);

    // Front-end Validation
    if (!formData.name || formData.name.length > 100) {
      setError("Please enter a valid name (max 100 characters).");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const phoneRegex = /^[0-9]{7,15}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number (digits only, 7-15 length).");
      return;
    }

    if (!courseId || !course) {
      setError("Invalid course selection.");
      return;
    }

    const performEnrollment = async (rzpDetails?: typeof razorpayData) => {
      const details = rzpDetails || razorpayData;
      if (!details) {
        setError("Missing payment verification details.");
        return;
      }

      setEnrollStatus('checking');
      setIsProcessing(true);

      const result = await enrollAfterPurchase({
        email: formData.email.toLowerCase(),
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender || undefined,
        courseId: courseId!,
        ...details
      });

      setIsProcessing(false);

      if (result.success) {
        setEnrollStatus('success');
      } else {
        setEnrollStatus('idle'); // Allow "Retry Enrollment"
        setError(result.message || "Payment succeeded but enrollment failed. Please click 'Retry Enrollment'.");
        setHasPaid(true); // Don't trigger Razorpay again
      }
    };

    if (hasPaid) {
      await performEnrollment();
      return;
    }

    // Initialize Razorpay
    if (!window.Razorpay) {
      setError("Payment Gateway failed to load. Please refresh the page or check your connection.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create payment order");
      }

      const keyId = (import.meta as any).env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: keyId || "TEST_KEY_PLACEHOLDER", 
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Alpha IITIAN",
        description: `Course Enrollment: ${courseId}`,
        order_id: orderData.orderId, // Required for signature verification
        theme: {
          color: "#CE1234" // Match primary color
        },
        prefill: {
          name: formData.name,
          email: formData.email.toLowerCase(),
          contact: formData.phone
        },
        handler: async function (response: any) {
          const details = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          };
          setRazorpayData(details);
          setHasPaid(true);
          await performEnrollment(details);
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setError("Payment failed: " + response.error.description);
      });

      rzp.open();
    } catch (err: any) {
      console.error('[BuyPage] Order creation error:', err);
      setError(err.message || "Unable to initialize payment. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!course) return null; // Wait for redirect to happen

  if (enrollStatus === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 mx-auto brute-card border-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <ShieldCheck size={48} />
        </div>
        <h1 className="text-5xl font-black font-headline uppercase mb-4">Enrollment Complete!</h1>
        <p className="text-xl text-surface/80 font-bold mb-12">
          Your payment was successful and you have been added to the course.
          Check your email ({formData.email.toLowerCase()}) for login details.
        </p>
        <Link to="/#courses">
          <BruteButton variant="primary">Return to Dashboard</BruteButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
      <Link to={`/course/${courseId}`} className="inline-flex items-center gap-2 text-surface/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-12 transition-colors">
        <ArrowLeft size={16} /> Cancel Purchase
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Course Summary */}
        <div>
          <h2 className="text-4xl font-black font-headline uppercase mb-8">Order Summary</h2>
          <div className="brute-card bg-surface p-8 text-black mb-8 border-b-8 border-black">
            <div className="text-sm font-black uppercase text-black/50 tracking-widest mb-2">Selected Course</div>
            <h3 className="text-2xl font-black uppercase mb-6 leading-tight">
              {courseId!.split('-').join(' ')}
            </h3>
            
            <div className="border-t-2 border-dashed border-black/20 pt-6 mt-6">
              <div className="flex justify-between items-center text-xl font-black">
                <span>Total Amount:</span>
                <span className="text-primary italic text-3xl">{course.display}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-surface/70 font-bold text-sm bg-black/50 p-4 border-2 border-surface/20">
             <ShieldCheck className="text-primary" />
             <p>Secure SSL Encrypted Payment. Powered by Razorpay.</p>
          </div>
        </div>

        {/* User Form */}
        <div>
          <h2 className="text-4xl font-black font-headline uppercase mb-8">Your Details</h2>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-900 border-2 border-red-500 text-white font-bold flex gap-3 text-sm">
              <AlertCircle className="shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-6 brute-card bg-surface p-8 text-black">
            <div>
              <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Full Name *</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Email Address *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Phone Number *</label>
              <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary disabled:opacity-50"
                placeholder="10 digit mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-black uppercase mb-2 tracking-widest text-black/70">Gender (Optional)</label>
              <select 
                name="gender" 
                value={formData.gender} 
                onChange={handleChange}
                disabled={isProcessing}
                className="w-full bg-white border-2 border-black p-3 font-bold text-black focus:outline-none focus:border-primary disabled:opacity-50"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-6 border-t-2 border-black/10">
              <BruteButton 
                variant="primary" 
                className="w-full text-xl py-4" 
                onClick={handlePayment}
                disabled={isProcessing}
                isTyping={enrollStatus === 'checking'}
              >
                {enrollStatus === 'checking' ? 'Enrolling...' : isProcessing ? 'Processing Payment...' : hasPaid ? 'Retry Enrollment' : `Pay ${course.display}`}
              </BruteButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyPage;
