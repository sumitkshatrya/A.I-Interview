import { useState } from 'react'
import axios from 'axios'
import { motion as Motion } from 'framer-motion'
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { ServerUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 'Rs. 0',
    credits: 100,
    description: 'Perfect for beginners starting interview preparations.',
    features: [
      '100 AI Interview Credits',
      'Basic Performance Report',
      'Voice Interview Access',
      'Limited History Tracking',
    ],
    badge: 'Default',
    default: true,
  },
  {
    id: 'basic',
    name: 'Starter Pack',
    price: 'Rs. 100',
    credits: 1500,
    description: 'Great for focused practice and skill improvement.',
    features: [
      '1500 AI Interview Credits',
      'Detailed Feedback',
      'Performance Analytics',
      'Full Interview History',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    price: 'Rs. 500',
    credits: 6500,
    description: 'Best value for serious job preparation.',
    features: [
      '6500 AI Interview Credits',
      'Advanced AI Feedback',
      'Skill Trend Analysis',
      'Priority AI Processing',
    ],
    badge: 'Best Value',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
}

const Pricing = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [selectedPlan, setSelectedPlan] = useState('free')
  const [loadingPlan, setLoadingPlan] = useState(null)

  const handlePayment = async (plan) => {
    if (plan.default) return

    if (!window.Razorpay) {
      alert('Payment service is not ready. Please refresh the page and try again.')
      return
    }

    try {
      setLoadingPlan(plan.id)

      const amount = plan.id === 'basic' ? 100 : plan.id === 'pro' ? 500 : 0

      const result = await axios.post(
        ServerUrl + '/api/payment/order',
        {
          planId: plan.id,
          amount,
          credits: plan.credits,
        },
        { withCredentials: true }
      )

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: 'INR',
        name: 'A.I Interview',
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: result.data.id,
        handler: async (response) => {
          const verifiedPayment = await axios.post(
            ServerUrl + '/api/payment/verify',
            response,
            { withCredentials: true }
          )

          dispatch(setUserData(verifiedPayment.data.user))
          alert('Payment successful. Credits added!')
          navigate('/')
        },
        theme: {
          color: '#16a34a',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.log(error)
      alert(error.response?.data?.message || 'Unable to start payment. Please try again.')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f3f3] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <Motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="mx-auto max-w-6xl"
      >
        <div className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-start">
          <Motion.button
            type="button"
            onClick={() => navigate('/')}
            whileHover={{ x: -3, scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-700 hover:shadow-md"
            aria-label="Back to home"
          >
            <FaArrowLeft />
          </Motion.button>

          <div className="w-full text-center sm:pr-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-600">
              Pricing
            </p>
            <h1 className="mx-auto max-w-3xl text-3xl font-semibold leading-tight text-gray-950 sm:text-4xl lg:text-6xl">
              Choose the plan that fits your interview practice
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Flexible credits, clear reports, and AI interview practice that scales from quick
              warmups to serious preparation.
            </p>
          </div>
        </div>
      </Motion.section>

      <Motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.18 }}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const isLoading = loadingPlan === plan.id

          return (
            <Motion.article
              key={plan.id}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.015 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative flex min-h-[430px] cursor-pointer flex-col rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 sm:p-6 lg:p-8 ${
                isSelected
                  ? 'border-green-500 shadow-2xl shadow-green-100'
                  : 'border-gray-200 hover:border-green-200 hover:shadow-xl'
              }`}
            >
              {plan.badge && (
                <span
                  className={`absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-semibold sm:right-6 sm:top-6 ${
                    plan.default
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-green-600 text-white shadow-sm shadow-green-200'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="pr-24">
                <h2 className="text-xl font-semibold text-gray-950">{plan.name}</h2>
                <p className="mt-5 text-4xl font-semibold tracking-tight text-green-600 sm:text-5xl">
                  {plan.price}
                </p>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  {plan.credits.toLocaleString('en-IN')} credits
                </p>
              </div>

              <p className="mt-6 min-h-12 text-sm leading-6 text-gray-500">{plan.description}</p>

              <div className="mt-7 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <FaCheckCircle className="mt-0.5 shrink-0 text-green-500" />
                    <span className="text-sm leading-6 text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-8">
                {plan.default ? (
                  <div className="flex min-h-12 items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-600">
                    Included by default
                  </div>
                ) : (
                  <Motion.button
                    type="button"
                    disabled={isLoading}
                    whileHover={!isLoading ? { scale: 1.02 } : undefined}
                    whileTap={!isLoading ? { scale: 0.98 } : undefined}
                    onClick={(event) => {
                      event.stopPropagation()

                      if (!isSelected) {
                        setSelectedPlan(plan.id)
                        return
                      }

                      handlePayment(plan)
                    }}
                    className={`flex min-h-12 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition ${
                      isSelected
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                    } disabled:bg-gray-300 disabled:text-gray-500`}
                  >
                    {isLoading ? 'Processing...' : isSelected ? 'Proceed to Pay' : 'Select Plan'}
                  </Motion.button>
                )}
              </div>
            </Motion.article>
          )
        })}
      </Motion.section>
    </main>
  )
}

export default Pricing
