import { useState, useEffect } from 'react'
import { FiSmartphone } from 'react-icons/fi'
import { getWalletBalance, getTransactions, createRazorpayOrder, verifyTopUp } from '../../services/walletService'

export default function WalletPanel() {
  const [showQR, setShowQR] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpSuccess, setTopUpSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usdBalance, setUsdBalance] = useState(0)
  const [inrBalance, setInrBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)

  const quickAmounts = [25, 50, 100, 200]
  const conversionRate = 83.2

  // Fetch wallet balance and transactions on mount
  useEffect(() => {
    fetchWalletData()
  }, [])

  async function fetchWalletData() {
    try {
      setIsLoading(true)
      setError(null)
      const [balanceData, transactionsData] = await Promise.all([
        getWalletBalance(),
        getTransactions()
      ])

      setUsdBalance(balanceData.usdBalance || 0)
      setInrBalance(balanceData.inrBalance || 0)
      setTransactions(transactionsData || [])
    } catch (err) {
      console.error('Error fetching wallet data:', err)
      setError(err.message || 'Failed to load wallet')
    } finally {
      setIsLoading(false)
    }
  }

  // Format transaction for display
  function formatTransaction(txn) {
    const date = new Date(txn.createdAt)
    const today = new Date()
    let dateStr = date.toLocaleDateString('en-IN')
    
    if (date.toDateString() === today.toDateString()) {
      dateStr = `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === new Date(today.getTime() - 86400000).toDateString()) {
      dateStr = `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    }

    const isCredit = txn.type === 'credit'
    const icon = txn.paymentMethod === 'razorpay' ? '💳' : txn.paymentMethod === 'stripe' ? '💳' : '💰'
    const amount = isCredit ? `+${txn.currency === 'INR' ? '₹' : '$'}${txn.amount}` : `-${txn.currency === 'INR' ? '₹' : '$'}${txn.amount}`
    
    return {
      id: txn._id,
      icon,
      title: txn.description || 'Transaction',
      subtitle: `${txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1)}`,
      amount,
      date: dateStr,
      color: isCredit ? 'text-green-600' : 'text-terracotta'
    }
  }

  // Handle Razorpay top-up
  async function handleTopUpConfirm() {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return

    try {
      setIsProcessing(true)
      
      // Step 1: Create Razorpay order
      const orderData = await createRazorpayOrder(parseFloat(topUpAmount))
      
      // Step 2: Load Razorpay checkout script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      
      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id: orderData.orderId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'SafarSathi',
          description: 'Wallet Top-up',
          handler: async (response) => {
            // Step 3: Verify payment
            try {
              await verifyTopUp({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: parseFloat(topUpAmount)
              })

              setTopUpSuccess(true)
              setTopUpAmount('')
              
              // Refresh wallet balance
              await fetchWalletData()
              
              setTimeout(() => {
                setTopUpSuccess(false)
              }, 3000)
            } catch (err) {
              console.error('Payment verification failed:', err)
              setError('Payment verification failed. Please try again.')
              setTimeout(() => setError(null), 3000)
            } finally {
              setIsProcessing(false)
            }
          },
          prefill: {
            name: 'Tourist',
            email: 'tourist@safarsathi.com'
          },
          theme: {
            color: '#E8892B'
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }

      document.body.appendChild(script)
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err.message || 'Failed to create payment order')
      setIsProcessing(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="page-fade-in">
      {/* SECTION HEADER */}
      <div className="mb-10">
        <div className="font-garamond text-xs uppercase tracking-widest text-terracotta mb-2">
          ✦ Your Wallet
        </div>
        <h1 className="font-playfair text-4xl text-charcoal font-bold mb-1">
          Spend smart,
        </h1>
        <h1 className="font-playfair text-4xl text-saffron italic font-bold">
          travel further.
        </h1>
      </div>

      {/* BALANCE CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* USD BALANCE CARD */}
        <div className="bg-cream rounded-3xl p-8 relative overflow-hidden border-2 border-deepblue/10">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-deepblue/5"></div>

          <div className="relative z-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 mb-3">
              USD Balance
            </div>
            <div className="font-playfair text-5xl text-charcoal font-bold mb-1">
              ${usdBalance.toFixed(2)}
            </div>
            <div className="font-garamond text-sm text-charcoal/60">
              Available for hotel payments
            </div>

            <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between">
              <span className="font-garamond text-xs text-charcoal/40">Via Stripe</span>
              <button
                onClick={() => setTopUpAmount('50')}
                className="bg-deepblue text-cream font-garamond text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-deepblue/80 transition-colors"
              >
                Top Up →
              </button>
            </div>
          </div>
        </div>

        {/* INR BALANCE CARD */}
        <div className="bg-cream rounded-3xl p-8 relative overflow-hidden border-2 border-saffron/20">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-saffron/10"></div>

          <div className="relative z-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 mb-3">
              INR Balance
            </div>
            <div className="font-playfair text-5xl text-charcoal font-bold mb-1">
              ₹{inrBalance.toLocaleString('en-IN')}
            </div>
            <div className="font-garamond text-sm text-charcoal/60">
              For local payments & guides
            </div>

            <div className="mt-6 pt-4 border-t border-charcoal/10 flex items-center justify-between">
              <span className="font-garamond text-xs text-charcoal/40">Via Razorpay</span>
              <button
                onClick={() => setTopUpAmount('100')}
                className="bg-saffron text-cream font-garamond text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-amber-600 transition-colors"
              >
                Add Money →
              </button>
            </div>
          </div>
        </div>

        {/* UPI QR CARD */}
        <div
          onClick={() => setShowQR(!showQR)}
          className="bg-sand rounded-3xl p-8 relative overflow-hidden cursor-pointer hover:border-saffron border border-sand transition-all duration-300"
        >
          <div className="relative z-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 mb-3">
              UPI Scanner
            </div>
            <div className="mb-3 text-5xl flex items-center justify-center">
              <FiSmartphone size={56} className="text-charcoal" />
            </div>
            <h3 className="font-playfair text-2xl text-charcoal font-bold mb-1">
              Scan & Pay
            </h3>
            <p className="font-garamond text-sm text-charcoal/60">
              Scan any UPI QR code to pay instantly in INR
            </p>

            <div className="mt-6 pt-4 border-t border-sand">
              <button className="bg-charcoal text-cream font-garamond text-xs uppercase tracking-wider px-4 py-2 rounded-full inline-block">
                {showQR ? 'Close Scanner' : 'Open Scanner →'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UPI QR SCANNER */}
      {showQR && (
        <div className="bg-sand rounded-3xl p-8 mb-8 text-center">
          <h2 className="font-playfair text-2xl text-charcoal font-bold mb-2">
            UPI QR Scanner
          </h2>
          <p className="font-garamond text-sm text-charcoal/60 mb-8">
            Point your camera at any UPI QR code to pay at restaurants, shops, and attractions.
          </p>

          {/* Mock Camera Viewfinder */}
          <div className="w-64 h-64 mx-auto rounded-2xl bg-charcoal relative overflow-hidden mb-6">
            {/* Corner Brackets */}
            <div className="absolute top-3 left-3 w-8 h-8 border-2 border-saffron rounded-tl-lg" style={{ borderRight: 'none', borderBottom: 'none' }}></div>
            <div className="absolute top-3 right-3 w-8 h-8 border-2 border-saffron rounded-tr-lg" style={{ borderLeft: 'none', borderBottom: 'none' }}></div>
            <div className="absolute bottom-3 left-3 w-8 h-8 border-2 border-saffron rounded-bl-lg" style={{ borderRight: 'none', borderTop: 'none' }}></div>
            <div className="absolute bottom-3 right-3 w-8 h-8 border-2 border-saffron rounded-br-lg" style={{ borderLeft: 'none', borderTop: 'none' }}></div>

            {/* Scanning Line */}
            <div
              className="absolute left-3 right-3 h-0.5 bg-saffron/80 animate-bounce"
              style={{ top: '50%' }}
            ></div>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-garamond text-white/50 text-sm">Camera preview</p>
              <p className="font-garamond text-white/30 text-xs mt-2">(requires device camera)</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button className="bg-charcoal text-cream font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all">
              📷 Activate Camera
            </button>
            <button className="border border-charcoal text-charcoal font-garamond text-sm uppercase tracking-wider px-8 py-3 rounded-xl hover:bg-charcoal hover:text-cream transition-all">
              Enter UPI ID Manually
            </button>
          </div>
        </div>
      )}

      {/* QUICK TOP-UP SECTION */}
      <div className="bg-sand rounded-3xl p-8 mb-8">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-playfair text-xl text-charcoal font-semibold">
              Quick Top-up
            </h2>
            <p className="font-garamond text-sm text-charcoal/60 mt-1">
              USD → INR auto conversion at live rates
            </p>
          </div>
          <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full whitespace-nowrap">
            1 USD = ₹{conversionRate}
          </div>
        </div>

        {/* Amount Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setTopUpAmount(amount.toString())}
              className={`border-2 rounded-2xl py-4 text-center cursor-pointer transition-all duration-300 ${
                topUpAmount === amount.toString()
                  ? 'border-saffron bg-saffron/10'
                  : 'border-sand bg-cream hover:border-saffron/50'
              }`}
            >
              <div className="font-playfair text-2xl text-charcoal font-bold">
                ${amount}
              </div>
              <div className="font-garamond text-xs text-charcoal/50 mt-1">
                ≈ ₹{(amount * conversionRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-6">
          <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
            Or enter custom amount (USD)
          </label>
          <input
            type="number"
            placeholder="e.g. 75"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
          />
        </div>

        {/* Payment Method Selection */}
        <div className="flex gap-4 mb-6">
          {/* Razorpay */}
          <div className="flex-1 border-2 border-saffron bg-saffron/5 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div>
              <div className="font-playfair text-sm text-charcoal font-semibold">
                Razorpay
              </div>
              <div className="font-garamond text-xs text-charcoal/50">
                UPI / Cards / NetBanking
              </div>
            </div>
            <div className="ml-auto w-5 h-5 rounded-full bg-saffron flex items-center justify-center text-white text-xs">
              ✓
            </div>
          </div>

          {/* Stripe */}
          <div className="flex-1 border-2 border-sand bg-cream rounded-2xl p-4 flex items-center gap-3 opacity-60">
            <span className="text-2xl">💳</span>
            <div>
              <div className="font-playfair text-sm text-charcoal font-semibold">
                Stripe
              </div>
              <div className="font-garamond text-xs text-charcoal/50">
                International Cards
              </div>
            </div>
          </div>
        </div>

        {/* Top-up Button */}
        {error && (
          <div className="w-full bg-red-100 text-red-700 font-garamond text-sm px-4 py-3 rounded-2xl mb-4">
            {error}
          </div>
        )}
        {topUpSuccess ? (
          <button className="w-full bg-green-500 text-white cursor-default font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl text-center">
            ✓ Top-up Successful!
          </button>
        ) : (
          <button
            onClick={handleTopUpConfirm}
            disabled={!topUpAmount || isProcessing}
            className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing
              ? 'Processing...'
              : topUpAmount
              ? `Add $${topUpAmount} → ₹${(parseFloat(topUpAmount) * conversionRate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
              : 'Select an amount'}
          </button>
        )}
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-sand rounded-3xl p-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-xl text-charcoal font-semibold">
            Transaction History
          </h2>
          <button className="border border-sand text-charcoal/50 font-garamond text-xs px-4 py-2 rounded-full cursor-pointer hover:border-saffron hover:text-saffron transition-all">
            Export CSV
          </button>
        </div>

        {/* Transactions List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="font-garamond text-charcoal/60">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-garamond text-charcoal/60">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((txn) => {
              const formatted = formatTransaction(txn)
              return (
                <div
                  key={formatted.id}
                  className="flex items-center gap-4 bg-cream rounded-2xl px-5 py-4 border border-sand hover:border-saffron/30 transition-all duration-200"
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-lg shrink-0">
                    {formatted.icon}
                  </div>

                  {/* Center Content */}
                  <div className="flex-1">
                    <div className="font-playfair text-sm text-charcoal font-semibold">
                      {formatted.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-garamond text-xs text-charcoal/50">
                        {formatted.subtitle}
                      </span>
                      <span className="font-garamond text-xs text-charcoal/40">·</span>
                      <span className="font-garamond text-xs text-charcoal/40">
                        {formatted.date}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className={`font-playfair text-base font-bold ${formatted.color}`}>
                      {formatted.amount}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
