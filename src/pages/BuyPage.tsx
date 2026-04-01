import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckSquare, LogOut, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import BruteButton from '../components/BruteButton';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { enrollAfterPurchase } from '../services/enrollService';
import { logActivity } from '../services/activityLogger';
import { markOrderFailed } from '../services/orderService';
import { isProfileComplete } from '../utils/profile';
import type { Course, BundleItem } from '../types/app';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayDetails {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export default function BuyPage() {
  const { id } = useParams<{ id: string }>(); 
  const location = useLocation();
  const navigate = useNavigate();
  // Fallback for query param ?course=... if needed, though we use /buy/:id
  const incomingCourseId = id || new URLSearchParams(location.search).get('course');

  const { user, profile, signOut, isProfileComplete: profileReady } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Which bundle items the user has checked? (Array of courseIds)
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'processing'>('idle');
  const [razorpayData, setRazorpayData] = useState<RazorpayDetails | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!incomingCourseId) {
      setLoading(false);
      return;
    }

    async function fetchCourse() {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', incomingCourseId)
        .single();

      if (fetchError || !data) {
        console.error('Failed to load course', fetchError);
        setError('Failed to load course details. Please refresh or return to registry.');
        setCourse(null);
      } else {
        const c = data as unknown as Course;
        setCourse(c);
        // By default, select all items in the bundle (or the single item)
        if (c.bundleItems && c.bundleItems.length > 0) {
          setSelectedBundleIds(c.bundleItems.map(item => item.courseId));
        } else if (!c.isBundle && c.lms_id) {
          // Legacy support for older DB records without bundleItems array
           setSelectedBundleIds([c.lms_id]);
        }
      }
      setLoading(false);
    }

    fetchCourse();
  }, [incomingCourseId]);

  useEffect(() => {
    if (!loading && !profileReady && course) {
      setShowProfileModal(true);
    }
  }, [loading, profileReady, course]);

  const selectedItems = useMemo(() => {
    if (!course) return [];
    if (course.bundleItems) {
      return course.bundleItems.filter(item => selectedBundleIds.includes(item.courseId));
    }
    if (!course.isBundle && course.lms_id && selectedBundleIds.includes(course.lms_id)) {
      return [{ courseId: course.lms_id, courseName: course.name, price: course.price }];
    }
    return [];
  }, [course, selectedBundleIds]);

  const totalAmount = useMemo(() => {
    if (!course) return 0;
    if (course.isBundle) {
      // Dynamic sum of selected bundle items
      return selectedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
    } else {
      // For non-bundle courses, use the top level price (or discountPrice if we supported it dynamically here, but we'll stick to top level price)
      return selectedItems.length > 0 ? (course.discountPrice || course.price) : 0;
    }
  }, [course, selectedItems]);

  const toggleSelection = (courseId: string) => {
    setSelectedBundleIds(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const logFailedPurchase = (reason: string, metadata?: Record<string, unknown>) => {
    if (!course) return;
    logActivity({
      action: 'FAILED_PURCHASE',
      courseId: course.id,
      courseName: course.name,
      email: profile?.email || user?.email || undefined,
      userId: user?.id,
      userName: profile?.name || null,
      metadata: { reason, ...metadata },
    });
  };

  const handlePayment = async () => {
    setError(null);

    if (!user || !profile) {
      setError('User session not found.');
      return;
    }

    if (!course) {
      setError('Course not found.');
      return;
    }

    if (selectedItems.length === 0) {
      setError('You must select at least one item to proceed.');
      return;
    }

    if (!isProfileComplete(profile)) {
      setShowProfileModal(true);
      logFailedPurchase('INCOMPLETE_PROFILE');
      return;
    }

    if (!window.Razorpay) {
      setError('Payment gateway failed to load. Please refresh the page and try again.');
      logFailedPurchase('RAZORPAY_NOT_LOADED');
      return;
    }

    if (razorpayData) {
      await completeEnrollment(razorpayData);
      return;
    }

    setIsProcessing(true);
    setCheckoutStatus('processing');

    try {
      // We pass the physical internal course IDs to the backend for enrollment
      const payloadCourseIds = selectedItems.map(item => item.courseId);

      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteCourseId: course.id,
          selectedLmsIds: payloadCourseIds,
          userId: user.id,
          email: profile.email.toLowerCase(),
          userName: profile.name,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }

      const options = {
        key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID || 'TEST_KEY_PLACEHOLDER',
        amount: orderData.amount, // from backend
        currency: orderData.currency,
        name: 'Alpha IITIAN',
        description: `Enrollment: ${course.name}`,
        order_id: orderData.orderId,
        theme: { color: '#CE1234' },
        prefill: {
          name: profile.name,
          email: profile.email.toLowerCase(),
          contact: profile.phone,
        },
        handler: async (response: RazorpayDetails) => {
          setRazorpayData(response);
          await completeEnrollment(response);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setCheckoutStatus('idle');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', async (response: any) => {
        const failureReason = response?.error?.description || 'Payment failed';
        const failedOrderId = response?.error?.metadata?.order_id || orderData.orderId;

        try { await markOrderFailed(failedOrderId, failureReason); } catch (e) {}

        setIsProcessing(false);
        setCheckoutStatus('idle');
        setError(`Payment failed: ${failureReason}`);
        logFailedPurchase('PAYMENT_FAILED', { orderId: failedOrderId });
      });

      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to initialize payment.';
      setError(message);
      setIsProcessing(false);
      setCheckoutStatus('idle');
      logFailedPurchase('ORDER_CREATION_FAILED', { message });
    }
  };

  const completeEnrollment = async (details: RazorpayDetails) => {
    setIsProcessing(true);
    setCheckoutStatus('processing');
    
    // We only enroll them into what they explicitly selected!
    const purchasedCourseIds = selectedItems.map(item => item.courseId);

    const result = await enrollAfterPurchase({
      userId: user?.id,
      email: profile?.email || '',
      name: profile?.name || '',
      phone: profile?.phone || '',
      gender: profile?.gender || undefined,
      lmsCourseIds: purchasedCourseIds, // Pass explicitly
      ...details,
    });

    setIsProcessing(false);

    if (!result.success) {
      setCheckoutStatus('idle');
      setError(result.message || 'Payment succeeded but enrollment failed.');
      logFailedPurchase('LMS_SYNC_FAILED', { message: result.message });
      return;
    }

    setCheckoutStatus('success');
    logActivity({
      action: 'SUCCESS_PURCHASE',
      courseId: course!.id,
      courseName: course!.name,
      email: profile?.email || undefined,
      userId: user?.id,
      userName: profile?.name || null,
      metadata: { orderId: details.razorpay_order_id, paymentId: details.razorpay_payment_id },
    });
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 mx-auto brute-card border-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CheckSquare size={48} />
        </div>
        <h1 className="text-5xl font-black font-headline uppercase mb-4">Access Granted</h1>
        <p className="text-xl text-surface/80 font-bold mb-12">
          Payment succeeded and LMS enrollment is complete for {selectedItems.length} course{selectedItems.length === 1 ? '' : 's'}. Invitation sent to {profile?.email}.
        </p>
        <Link to="/orders"><BruteButton variant="primary">View Order History</BruteButton></Link>
      </div>
    );
  }

  return (
    <>
      <ProfileCompletionModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Complete Profile First"
        description="Name, phone number, and gender are required before you can select and purchase courses."
        onCompleted={() => setError(null)}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <Link to="/courses" className="inline-flex items-center gap-2 text-surface/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-12 transition-colors">
          <ArrowLeft size={16} /> Cancel & Return
        </Link>

        {loading ? (
           <div className="brute-card bg-surface p-8 text-primary font-black uppercase tracking-widest animate-pulse max-w-xl">
             Loading Registry Target...
           </div>
        ) : !course ? (
           <div className="brute-card bg-surface p-10 text-center text-black">
              <h2 className="text-3xl font-black uppercase mb-3">Course Not Found</h2>
              <Link to="/courses"><BruteButton variant="primary">Browse Courses</BruteButton></Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-10 items-start">
            <div>
              <div className="mb-8">
                <h1 className="text-5xl md:text-6xl font-black font-headline uppercase text-white mb-3">
                  {course.isBundle ? 'Select Your Subjects' : 'Purchase Access'}
                </h1>
                <p className="text-surface/70 font-bold uppercase tracking-widest text-sm">
                  {course.isBundle ? 'Configure your learning bundle.' : `You are purchasing ${course.name}.`}
                </p>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-900 border-2 border-red-500 text-white font-bold flex gap-3 text-sm">
                  <AlertCircle className="shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-4">
                {course.isBundle && course.bundleItems ? (
                  course.bundleItems.map((item, index) => {
                    const isSelected = selectedBundleIds.includes(item.courseId);
                    return (
                      <div key={index} className={`brute-card bg-surface p-6 text-black border-b-8 transition-colors ${isSelected ? 'border-primary' : 'border-black'}`}>
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => toggleSelection(item.courseId)}
                            className={`border-2 p-1 ${isSelected ? 'border-primary text-primary bg-primary/10' : 'border-black/30 text-black/40 hover:border-black'}`}
                          >
                            {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                          </button>
                          <div className="flex-1">
                            <h2 className="text-2xl font-black uppercase leading-tight">{item.courseName}</h2>
                            <div className="text-[10px] font-mono mt-1 text-black/50">ID: {item.courseId}</div>
                          </div>
                          <div className="text-primary font-black text-3xl italic">
                            ₹{item.price}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="brute-card bg-surface p-6 text-black border-b-8 border-primary">
                     <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-black uppercase leading-tight">{course.name}</h2>
                          <p className="text-black/60 font-bold mt-2">{course.description}</p>
                        </div>
                        <div className="text-primary font-black text-3xl italic whitespace-nowrap">₹{course.price}</div>
                     </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky top-28 space-y-6">
              <div className="brute-card bg-surface text-black p-8 border-b-8 border-primary">
                <h2 className="text-3xl font-black uppercase mb-6">Enrollment Summary</h2>

                <div className="space-y-4 mb-8">
                  {selectedItems.length === 0 ? (
                    <div className="text-black/50 font-bold uppercase tracking-widest text-sm">No items selected</div>
                  ) : (
                    selectedItems.map((item, i) => (
                      <div key={i} className="flex justify-between gap-4 text-sm font-black uppercase tracking-widest">
                        <span className="max-w-[70%]">{item.courseName}</span>
                        <span>₹{item.price || (course.discountPrice || course.price)}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t-2 border-dashed border-black/20 pt-6 mb-6 flex flex-col items-center">
                  <div className="text-xs font-black uppercase tracking-widest text-black/50 mb-1 w-full text-left">Total Amount</div>
                  <div className="text-primary font-black text-5xl italic w-full text-left">₹{totalAmount}</div>
                </div>

                <div className="mb-6 p-4 border-2 border-black bg-black text-white">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Purchasing As</div>
                  <div className="font-bold text-sm lg:break-all">{profile?.email || user?.email || '---'}</div>
                  <p className="mt-2 text-[11px] font-bold text-white/50 leading-tight">Access is exclusively granted to this address.</p>
                </div>

                <div className="mb-6 p-4 border-2 border-black bg-white">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">Profile Status</div>
                  <div className="font-bold text-sm block md:flex md:justify-between">{profileReady ? 'Verified' : 'Incomplete'}
                  {!profileReady && (
                    <button type="button" onClick={() => setShowProfileModal(true)} className="text-[10px] mt-1 md:mt-0 bg-primary text-white px-2 py-1 font-black uppercase">
                      Finish Setup
                    </button>
                  )}
                  </div>
                </div>

                {user && (
                 <button onClick={() => signOut()} className="flex items-center justify-center w-full gap-2 text-[10px] font-black uppercase bg-white text-black px-3 py-3 border-2 border-black hover:bg-black hover:text-white transition-colors mb-6">
                    <LogOut size={12} /> Logout / Switch User
                 </button>
                )}

                <BruteButton
                  variant="primary"
                  className="w-full text-xl py-4"
                  onClick={handlePayment}
                  disabled={isProcessing || selectedItems.length === 0 || !profileReady}
                  isTyping={checkoutStatus === 'processing'}
                >
                  {checkoutStatus === 'processing' ? 'Processing...' : 'Proceed To Payment'}
                </BruteButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
