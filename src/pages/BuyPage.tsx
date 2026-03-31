import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckSquare, LogOut, Square, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import BruteButton from '../components/BruteButton';
import ProfileCompletionModal from '../components/ProfileCompletionModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { enrollAfterPurchase } from '../services/enrollService';
import { logActivity } from '../services/activityLogger';
import { markOrderFailed } from '../services/orderService';
import { isProfileComplete } from '../utils/profile';
import type { Course } from '../types/app';

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
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const incomingCourseId = searchParams.get('course');

  const { user, profile, signOut, isProfileComplete: profileReady } = useAuth();
  const {
    items,
    selectedIds,
    addToCart,
    removeFromCart,
    toggleSelection,
    selectAll,
    selectOnly,
    clearPurchasedCourses,
  } = useCart();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'success' | 'processing'>('idle');
  const [razorpayData, setRazorpayData] = useState<RazorpayDetails | null>(null);
  const [processedCourseIds, setProcessedCourseIds] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!incomingCourseId) return;

    if (!items.includes(incomingCourseId)) {
      addToCart(incomingCourseId);
      return;
    }

    if (!selectedIds.includes(incomingCourseId)) {
      selectOnly([...selectedIds, incomingCourseId]);
    }
  }, [addToCart, incomingCourseId, items, selectOnly, selectedIds]);

  useEffect(() => {
    async function fetchCartCourses() {
      if (items.length === 0) {
        setCourses([]);
        setLoadingCourses(false);
        return;
      }

      setLoadingCourses(true);
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select('*')
        .in('id', items);

      if (fetchError) {
        console.error('Failed to load cart courses', fetchError);
        setError('Failed to load cart courses. Please refresh the page.');
        setCourses([]);
        setLoadingCourses(false);
        return;
      }

      const courseMap = new Map((data as Course[]).map((course) => [course.id, course]));
      const orderedCourses = items.map((courseId) => courseMap.get(courseId)).filter((course): course is Course => Boolean(course));
      const missingCourseIds = items.filter((courseId) => !courseMap.has(courseId));

      if (missingCourseIds.length > 0) {
        missingCourseIds.forEach((courseId) => removeFromCart(courseId));
      }

      setCourses(orderedCourses);
      setLoadingCourses(false);
    }

    fetchCartCourses();
  }, [items, removeFromCart]);

  useEffect(() => {
    if (!loadingCourses && !profileReady && selectedIds.length > 0) {
      setShowProfileModal(true);
    }
  }, [loadingCourses, profileReady, selectedIds.length]);

  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedIds.includes(course.id)),
    [courses, selectedIds],
  );

  const totalAmount = useMemo(
    () => selectedCourses.reduce((sum, course) => sum + Number(course.price), 0),
    [selectedCourses],
  );

  const courseSummaryText = selectedCourses.map((course) => course.name).join(', ');

  const logFailedPurchase = (reason: string, metadata?: Record<string, unknown>) => {
    selectedCourses.forEach((course) => {
      logActivity({
        action: 'FAILED_PURCHASE',
        courseId: course.id,
        courseName: course.name,
        email: profile?.email || user?.email || undefined,
        userId: user?.id,
        userName: profile?.name || null,
        metadata: {
          reason,
          ...(metadata || {}),
        },
      });
    });
  };

  const handlePayment = async () => {
    setError(null);

    if (!user || !profile) {
      setError('User session not found.');
      return;
    }

    if (selectedCourses.length === 0) {
      setError('Select at least one course before continuing to payment.');
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
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseIds: selectedCourses.map((course) => course.id),
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
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Alpha IITIAN',
        description: `Course Enrollment: ${courseSummaryText}`,
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

        try {
          await markOrderFailed(failedOrderId, failureReason);
        } catch (updateError) {
          console.error('Failed to update order failure state', updateError);
        }

        setIsProcessing(false);
        setCheckoutStatus('idle');
        setError(`Payment failed: ${failureReason}`);
        logFailedPurchase('PAYMENT_FAILED', {
          orderId: failedOrderId,
          gatewayCode: response?.error?.code,
        });
      });

      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to initialize payment. Please try again.';
      console.error('Checkout initialization failed', err);
      setError(message);
      setIsProcessing(false);
      setCheckoutStatus('idle');
      logFailedPurchase('ORDER_CREATION_FAILED', { message });
    }
  };

  const completeEnrollment = async (details: RazorpayDetails) => {
    setIsProcessing(true);
    setCheckoutStatus('processing');

    const result = await enrollAfterPurchase({
      userId: user?.id,
      email: profile?.email || '',
      name: profile?.name || '',
      phone: profile?.phone || '',
      gender: profile?.gender || undefined,
      ...details,
    });

    setIsProcessing(false);

    if (!result.success) {
      setCheckoutStatus('idle');
      setError(result.message || 'Payment succeeded but enrollment failed.');
      logFailedPurchase('LMS_SYNC_FAILED', {
        orderId: details.razorpay_order_id,
        message: result.message,
      });
      return;
    }

    const purchasedCourseIds = selectedCourses.map((course) => course.id);
    setProcessedCourseIds(purchasedCourseIds);
    clearPurchasedCourses(purchasedCourseIds);
    setCheckoutStatus('success');

    selectedCourses.forEach((course) => {
      logActivity({
        action: 'SUCCESS_PURCHASE',
        courseId: course.id,
        courseName: course.name,
        email: profile?.email || undefined,
        userId: user?.id,
        userName: profile?.name || null,
        metadata: {
          orderId: details.razorpay_order_id,
          paymentId: details.razorpay_payment_id,
        },
      });
    });
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 min-h-[70vh] flex flex-col items-center text-center">
        <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mb-8 mx-auto brute-card border-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CheckSquare size={48} />
        </div>
        <h1 className="text-5xl font-black font-headline uppercase mb-4">Checkout Complete</h1>
        <p className="text-xl text-surface/80 font-bold mb-12">
          Payment succeeded for {processedCourseIds.length} course{processedCourseIds.length === 1 ? '' : 's'} and access has been processed for {profile?.email}.
        </p>
        <Link to="/orders">
          <BruteButton variant="primary">View Order History</BruteButton>
        </Link>
      </div>
    );
  }

  return (
    <>
      <ProfileCompletionModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Complete Your Profile First"
        description="Name, phone number, and gender are required before payment can continue."
        onCompleted={() => setError(null)}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <Link to="/courses" className="inline-flex items-center gap-2 text-surface/60 font-bold uppercase tracking-widest text-sm hover:text-primary mb-12 transition-colors">
          <ArrowLeft size={16} /> Continue Browsing
        </Link>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-10 items-start">
          <div>
            <div className="flex items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-5xl md:text-6xl font-black font-headline uppercase text-white mb-3">Course Cart</h1>
                <p className="text-surface/70 font-bold uppercase tracking-widest text-sm">Select the courses you want to purchase in this checkout.</p>
              </div>
              {courses.length > 0 && (
                <button
                  type="button"
                  onClick={selectAll}
                  className="border-2 border-primary text-primary px-4 py-3 font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors"
                >
                  Select All
                </button>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-900 border-2 border-red-500 text-white font-bold flex gap-3 text-sm">
                <AlertCircle className="shrink-0 text-red-400" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              {loadingCourses ? (
                <div className="brute-card bg-surface p-8 text-primary font-black uppercase tracking-widest animate-pulse">
                  Loading cart...
                </div>
              ) : courses.length === 0 ? (
                <div className="brute-card bg-surface p-10 text-center text-black">
                  <h2 className="text-3xl font-black uppercase mb-3">Cart Is Empty</h2>
                  <p className="text-black/60 font-bold mb-6">Add one or more courses before you checkout.</p>
                  <Link to="/courses">
                    <BruteButton variant="primary">Browse Courses</BruteButton>
                  </Link>
                </div>
              ) : (
                courses.map((course) => {
                  const isSelected = selectedIds.includes(course.id);

                  return (
                    <div key={course.id} className={`brute-card bg-surface p-6 text-black border-b-8 transition-colors ${isSelected ? 'border-primary' : 'border-black'}`}>
                      <div className="flex items-start gap-4">
                        <button
                          type="button"
                          onClick={() => toggleSelection(course.id)}
                          className={`mt-1 border-2 p-1 ${isSelected ? 'border-primary text-primary bg-primary/10' : 'border-black/30 text-black/40'}`}
                          aria-label={isSelected ? `Deselect ${course.name}` : `Select ${course.name}`}
                        >
                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                        </button>

                        <div className="flex-1">
                          <div className="flex justify-between gap-4 items-start">
                            <div>
                              <h2 className="text-2xl font-black uppercase leading-tight">{course.name}</h2>
                              <p className="text-black/60 font-bold mt-2">{course.description}</p>
                            </div>
                            <div className="text-primary font-black text-3xl italic whitespace-nowrap">₹{course.price}</div>
                          </div>

                          <div className="flex gap-3 mt-6">
                            <Link to={`/course/${course.id}`} className="flex-1">
                              <BruteButton variant="outline" className="w-full">Details</BruteButton>
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeFromCart(course.id)}
                              className="flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 px-4 py-3 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="sticky top-28 space-y-6">
            <div className="brute-card bg-surface text-black p-8 border-b-8 border-primary">
              <h2 className="text-3xl font-black uppercase mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8">
                {selectedCourses.length === 0 ? (
                  <div className="text-black/50 font-bold uppercase tracking-widest text-sm">No courses selected</div>
                ) : (
                  selectedCourses.map((course) => (
                    <div key={course.id} className="flex justify-between gap-4 text-sm font-black uppercase tracking-widest">
                      <span className="max-w-[70%]">{course.name}</span>
                      <span>₹{course.price}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t-2 border-dashed border-black/20 pt-6 mb-6">
                <div className="flex justify-between items-center text-xl font-black">
                  <span>Total Amount</span>
                  <span className="text-primary italic text-3xl">₹{totalAmount}</span>
                </div>
              </div>

              <div className="mb-6 p-4 border-2 border-black bg-black text-white">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2">Purchasing As</div>
                <div className="font-bold text-sm break-all">{profile?.email || user?.email || '---'}</div>
                <p className="mt-3 text-[11px] font-bold leading-relaxed text-white/70">
                  Please note: course access will be granted to this email. If you want to use a different email, log out and continue with that account.
                </p>
              </div>

              <div className="mb-6 p-4 border-2 border-black bg-white">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2">Profile Status</div>
                <div className="font-bold text-sm">{profileReady ? 'Profile complete' : 'Profile incomplete'}</div>
                {!profileReady && (
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="mt-3 text-xs font-black uppercase tracking-widest text-primary hover:text-black transition-colors"
                  >
                    Complete profile first
                  </button>
                )}
              </div>

              {user && (
                <div className="mb-6 p-4 border-2 border-black bg-black text-white flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Google Account</div>
                    <div className="font-bold text-sm">{user.email}</div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase bg-white text-black px-3 py-2 border-2 border-black hover:bg-primary hover:text-white transition-colors"
                  >
                    <LogOut size={12} /> Logout
                  </button>
                </div>
              )}

              <BruteButton
                variant="primary"
                className="w-full text-xl py-4"
                onClick={handlePayment}
                disabled={isProcessing || selectedCourses.length === 0 || !profileReady}
                isTyping={checkoutStatus === 'processing'}
              >
                {checkoutStatus === 'processing' ? 'Processing...' : 'Continue To Payment'}
              </BruteButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
