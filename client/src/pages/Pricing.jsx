import { useState } from 'react';
import axios from 'axios';
import { motion as Motion } from 'framer-motion';
import { FaArrowLeft, FaCheckCircle, FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AuthModel from '../components/AuthModel';

const plans = [
  {
    id: 'free',
    name: 'Free Tier',
    price: '₹0',
    amount: 0,
    credits: 100,
    description: 'Perfect for initial mock interview evaluation and resume parsing.',
    features: [
      '100 AI Interview Credits',
      'Basic Performance Report',
      'Voice Interview Access',
      'Limited History Tracking',
    ],
    badge: 'Starter',
    default: true,
  },
  {
    id: 'basic',
    name: 'Pro Tech Developer',
    price: '₹100',
    amount: 100,
    credits: 500,
    description: 'Designed for active job seekers targeting US tech roles.',
    features: [
      '500 AI Interview Credits',
      'Detailed Multi-Dimensional Feedback',
      'Skill Graph Mastery Hierarchy',
      'Full Interview History',
      'ATS Resume Optimization Exporter',
    ],
    badge: 'Standard',
  },
  {
    id: 'pro',
    name: 'FAANG & Senior Executive',
    price: '₹249',
    amount: 249,
    credits: 1500,
    description: 'Complete career acceleration package for Senior/Staff roles.',
    features: [
      '1500 AI Interview Credits',
      'Advanced System Design Simulations',
      'STAR Behavioral Masterclass',
      '7-Day Personal Strategy Engine',
      'Unlimited PDF & Word ATS Exporter',
    ],
    badge: 'Most Popular',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const Pricing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (plan) => {
    if (plan.default) return;

    // Authorization Guard: Require login prior to payment processing
    if (!userData) {
      setShowAuth(true);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      alert('Unable to load Razorpay payment gateway SDK. Please check your network connection.');
      return;
    }

    try {
      setLoadingPlan(plan.id);

      const orderResponse = await axios.post(
        ServerUrl + '/api/payment/order',
        {
          planId: plan.id,
          amount: plan.amount,
          credits: plan.credits,
        },
        { withCredentials: true }
      );

      const orderData = orderResponse.data;

      const options = {
        key: orderData.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'SK Interview AI',
        description: `${plan.name} - ${plan.credits} AI Credits`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            const verifiedPayment = await axios.post(
              ServerUrl + '/api/payment/verify',
              response,
              { withCredentials: true }
            );

            if (verifiedPayment.data.success && verifiedPayment.data.user) {
              dispatch(setUserData(verifiedPayment.data.user));
              alert(`Payment Verified! ${plan.credits} credits added to your account.`);
              navigate('/');
            } else {
              alert(verifiedPayment.data.message || 'Payment verification failed.');
            }
          } catch (verifyErr) {
            console.error('Payment Verification Error:', verifyErr);
            alert(verifyErr.response?.data?.message || 'Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
          },
        },
        prefill: {
          name: userData?.name || '',
          email: userData?.email || '',
        },
        theme: {
          color: '#10b981',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (failureResponse) {
        console.error('Payment Failed:', failureResponse.error);
        alert(`Payment Failed: ${failureResponse.error.description}`);
        setLoadingPlan(null);
      });
      razorpay.open();
    } catch (error) {
      console.error('Order Creation Error:', error);
      alert(error.response?.data?.message || 'Unable to initiate payment authorization. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-start">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 shadow-md transition hover:bg-slate-800 hover:text-white cursor-pointer"
              aria-label="Back to home"
            >
              <FaArrowLeft />
            </button>

            <div className="w-full text-center sm:pr-10">
              <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl mt-1">
                Flexible AI Interview & Career Intelligence Credit Plans
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-400">
                Transparent credit packages designed for developers targeting top US compensation packages ($150k–$350k+).
              </p>
            </div>
          </div>
        </Motion.section>

        <Motion.section
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <Motion.article
                key={plan.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative flex min-h-[440px] cursor-pointer flex-col rounded-3xl border bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <span
                    className={`absolute right-6 top-6 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                      plan.default
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-emerald-500 text-slate-950 shadow-md'
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h2 className="text-xl font-extrabold text-white">{plan.name}</h2>
                  <p className="mt-4 text-4xl font-black text-emerald-400 sm:text-5xl">
                    {plan.price}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {plan.credits.toLocaleString('en-US')} AI Credits
                  </p>
                </div>

                <p className="mt-5 text-xs text-slate-400 leading-relaxed">{plan.description}</p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <FaCheckCircle className="mt-0.5 shrink-0 text-emerald-400 text-xs" />
                      <span className="text-xs text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  {plan.default ? (
                    <div className="flex min-h-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 px-5 py-3 text-xs font-bold text-slate-500">
                      Included Default Plan
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!isSelected) {
                          setSelectedPlan(plan.id);
                          return;
                        }
                        handlePayment(plan);
                      }}
                      className={`flex min-h-12 w-full items-center justify-center rounded-2xl px-5 py-3 text-xs font-extrabold shadow-md transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                      } disabled:bg-slate-800 disabled:text-slate-500`}
                    >
                      {isLoading ? (
                        'Securing Authorization...'
                      ) : !userData ? (
                        <span className="flex items-center gap-2">
                          <FaLock className="text-xs" /> Login to Purchase
                        </span>
                      ) : isSelected ? (
                        'Proceed to Secure Checkout'
                      ) : (
                        'Select Package'
                      )}
                    </button>
                  )}
                </div>
              </Motion.article>
            );
          })}
        </Motion.section>
      </main>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
      <Footer />
    </div>
  );
};

export default Pricing;
