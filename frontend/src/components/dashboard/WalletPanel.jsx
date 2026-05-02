import { useState, useEffect } from 'react'
import {
  getWalletBalance,
  getTransactions,
  createRazorpayOrder,
  verifyTopUp,
  addDummyMoney,
  sendMoneyToPhone,
} from '../../services/walletService'

export default function WalletPanel() {
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpCurrency, setTopUpCurrency] = useState('USD')
  const [topUpSuccess, setTopUpSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usdBalance, setUsdBalance] = useState(0)
  const [inrBalance, setInrBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [testMode] = useState(true)

  const [sendPhone, setSendPhone] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [sendCurrency, setSendCurrency] = useState('INR')
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState(null)
  const [isSending, setIsSending] = useState(false)

  // Currency conversion rates (INR base)
  const conversionRates = {
    USD: 83.2,
    EUR: 92.5,
    GBP: 105.8,
    INR: 1,
    AUD: 55.2,
  }

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'AUD']
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    AUD: 'A$',
  }

  const quickAmounts = [25, 50, 100, 200]

  useEffect(() => {
    fetchWalletData()
  }, [])

  async function fetchWalletData() {
    try {
      setIsLoading(true)
      setError(null)
      const [balanceData, transactionsData] = await Promise.all([
        getWalletBalance(),
        getTransactions(),
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

  function formatTransaction(txn) {
    const date = new Date(txn.createdAt)
    const today = new Date()
    let dateStr = date.toLocaleDateString('en-IN')

    if (date.toDateString() === today.toDateString()) {
      dateStr = `Today, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    } else if (
      date.toDateString() ===
      new Date(today.getTime() - 86400000).toDateString()
    ) {
      dateStr = `Yesterday, ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    }

    const isCredit = txn.type === 'credit'
    const icon =
      txn.paymentMethod === 'razorpay' || txn.paymentMethod === 'stripe'
        ? '💳'
        : '💰'
    const symbol = txn.currency === 'INR' ? '₹' : '$'
    const amount = isCredit
      ? `+${symbol}${txn.amount}`
      : `-${symbol}${txn.amount}`

    return {
      id: txn._id,
      icon,
      title: txn.description || 'Transaction',
      subtitle:
        txn.paymentMethod.charAt(0).toUpperCase() + txn.paymentMethod.slice(1),
      amount,
      date: dateStr,
      color: isCredit ? 'text-green-600' : 'text-red-500',
    }
  }

  // ── Razorpay top-up ──────────────────────────────────────────────────────────
  async function handleTopUpConfirm() {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return

    try {
      setIsProcessing(true)
      const amountInINR = parseFloat(topUpAmount) * conversionRates[topUpCurrency]
      const orderData = await createRazorpayOrder(amountInINR)

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
            try {
              await verifyTopUp({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: amountInINR,
              })
              handleSuccess()
            } catch (err) {
              console.error('Payment verification failed:', err)
              showError('Payment verification failed. Please try again.')
            } finally {
              setIsProcessing(false)
            }
          },
          modal: {
            ondismiss: async () => {
              // Test mode: auto-add dummy money when modal is dismissed
              if (testMode) {
                try {
                  await addDummyMoney(amountInINR, topUpCurrency)
                  handleSuccess()
                } catch (err) {
                  console.error('Error adding dummy money:', err)
                  showError('Failed to add test funds. Please try again.')
                }
              } else {
                showError('Payment cancelled. No funds were added.')
              }
              setIsProcessing(false)
            },
          },
          prefill: {
            name: 'Tourist',
            email: 'tourist@safarsathi.com',
          },
          theme: { color: '#E8892B' },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      }

      document.body.appendChild(script)
    } catch (err) {
      console.error('Error creating order:', err)
      showError(err.message || 'Failed to create payment order')
      setIsProcessing(false)
    }
  }

  // ── Send Money to Phone ──────────────────────────────────────────────────────
  async function handleSendMoney() {
    if (!sendPhone || !sendAmount || parseFloat(sendAmount) <= 0) return
    try {
      setIsSending(true)
      setSendError(null)
      const amountInINR = parseFloat(sendAmount) * conversionRates[sendCurrency]
      await sendMoneyToPhone({
        recipientPhone: sendPhone,
        amount: amountInINR,
        currency: sendCurrency,
      })
      setSendSuccess(true)
      setSendAmount('')
      setSendPhone('')
      await fetchWalletData()
      setTimeout(() => setSendSuccess(false), 3000)
    } catch (err) {
      console.error('Error sending money:', err)
      setSendError(err.message || 'Failed to send money')
      setTimeout(() => setSendError(null), 3000)
    } finally {
      setIsSending(false)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  async function handleSuccess() {
    setTopUpSuccess(true)
    setTopUpAmount('')
    setError(null)
    await fetchWalletData()
    setTimeout(() => setTopUpSuccess(false), 3000)
  }

  function showError(msg) {
    setError(msg)
    setTimeout(() => setError(null), 3000)
  }

  function downloadQRCode(qrRef, name) {
    const canvas = qrRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `${name}-qr.png`
    link.click()
  }

  const amountInINR = topUpAmount
    ? parseFloat(topUpAmount) * conversionRates[topUpCurrency]
    : 0
  const sym = currencySymbols[topUpCurrency]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="page-fade-in">
      {/* ── HEADER ── */}
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

      {/* ── BALANCE CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* USD */}
        <div className="bg-cream rounded-3xl p-8 relative overflow-hidden border-2 border-deepblue/10">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-deepblue/5" />
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
          </div>
        </div>

        {/* INR */}
        <div className="bg-cream rounded-3xl p-8 relative overflow-hidden border-2 border-saffron/20">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-saffron/10" />
          <div className="relative z-10">
            <div className="font-garamond text-xs uppercase tracking-widest text-charcoal/50 mb-3">
              INR Balance
            </div>
            <div className="font-playfair text-5xl text-charcoal font-bold mb-1">
              ₹{inrBalance.toLocaleString('en-IN')}
            </div>
            <div className="font-garamond text-sm text-charcoal/60">
              For local payments &amp; guides
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIONS (ADD / SEND MONEY) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* LEFT COLUMN: Add Money + Payment Methods */}
        <div className="flex flex-col gap-6">
          {/* ── ADD MONEY SECTION ── */}
          <div className="bg-sand rounded-3xl p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-playfair text-xl text-charcoal font-semibold">
                  Add Money to Wallet
                </h2>
                <p className="font-garamond text-sm text-charcoal/60 mt-1">
                  Choose your currency and amount, then select a payment method
                </p>
              </div>
              <div className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full whitespace-nowrap">
                1 {topUpCurrency} = ₹{conversionRates[topUpCurrency]}
              </div>
            </div>

            {/* Currency selector */}
            <div className="mb-6">
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-3 block">
                Select Currency
              </label>
              <div className="grid grid-cols-5 gap-3">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setTopUpCurrency(curr)}
                    className={`border-2 rounded-xl py-3 text-center transition-all duration-300 ${
                      topUpCurrency === curr
                        ? 'border-saffron bg-saffron/10'
                        : 'border-sand bg-cream hover:border-saffron/50'
                    }`}
                  >
                    <div className="font-playfair text-xl text-charcoal font-bold">
                      {currencySymbols[curr]}
                    </div>
                    <div className="font-garamond text-xs text-charcoal/50 mt-1">
                      {curr}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="mb-6">
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
                Enter Amount ({topUpCurrency})
              </label>
              <input
                type="number"
                min="0"
                placeholder={`e.g. 50 ${topUpCurrency}`}
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
              />
              {topUpAmount && (
                <div className="mt-2 text-sm font-garamond text-charcoal/60">
                  ≈ ₹{amountInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR
                </div>
              )}
            </div>

            {/* Quick amounts */}
            <div className="mb-8">
              <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-3 block">
                Quick Select
              </label>
              <div className="grid grid-cols-4 gap-3">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className={`border-2 rounded-2xl py-3 text-center transition-all duration-300 ${
                      topUpAmount === amount.toString()
                        ? 'border-saffron bg-saffron/10'
                        : 'border-sand bg-cream hover:border-saffron/50'
                    }`}
                  >
                    <div className="font-playfair text-2xl text-charcoal font-bold">
                      {sym}{amount}
                    </div>
                    <div className="font-garamond text-xs text-charcoal/50 mt-1">
                      ≈ ₹{(amount * conversionRates[topUpCurrency]).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="w-full bg-red-100 text-red-700 font-garamond text-sm px-4 py-3 rounded-2xl mb-6">
                {error}
              </div>
            )}

            {/* Ready-to-pay indicator */}
            {topUpAmount && !topUpSuccess && (
              <div className="p-4 bg-saffron/10 border border-saffron rounded-2xl mb-6">
                <p className="font-garamond text-sm text-charcoal font-semibold">
                  ✓ Ready to pay: {sym}{topUpAmount}{' '}
                  (₹{amountInINR.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                </p>
                <p className="font-garamond text-xs text-charcoal/60 mt-1">
                  Select a payment method below to proceed
                </p>
              </div>
            )}

            {/* Success banner */}
            {topUpSuccess && (
              <div className="w-full bg-green-500 text-white font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl text-center">
                ✓ Top-up Successful!
              </div>
            )}
          </div>

          {/* ── PAYMENT METHOD CARDS (shown only when amount is entered) ── */}
          {topUpAmount && !topUpSuccess && (
            <div className="mb-8">
              <h3 className="font-playfair text-lg text-charcoal font-semibold mb-4">
                Select Payment Method
              </h3>

              <div className="grid grid-cols-1 gap-6">
                {/* Razorpay */}
                <div
                  className="bg-saffron/5 border-2 border-saffron rounded-3xl p-6 cursor-pointer hover:shadow-lg transition-all"
                  onClick={handleTopUpConfirm}
                >
                  <div className="text-4xl mb-3">💳</div>
                  <h4 className="font-playfair text-lg text-charcoal font-semibold mb-2">
                    Razorpay
                  </h4>
                  <p className="font-garamond text-sm text-charcoal/60 mb-4">
                    UPI / Cards / NetBanking
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTopUpConfirm() }}
                    disabled={isProcessing}
                    className="w-full bg-charcoal text-cream font-garamond text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-saffron hover:text-charcoal transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing…' : 'Pay Now →'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Send Money */}
        {/* ── SEND MONEY SECTION ── */}
        <div className="bg-sand rounded-3xl p-8 h-fit">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-playfair text-xl text-charcoal font-semibold">
                Send Money
              </h2>
              <p className="font-garamond text-sm text-charcoal/60 mt-1">
                Send money instantly to any phone number
              </p>
            </div>
          </div>

          {/* Phone input */}
          <div className="mb-6">
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +919876543210"
              value={sendPhone}
              onChange={(e) => setSendPhone(e.target.value)}
              className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
            />
          </div>

          {/* Currency selector for Send */}
          <div className="mb-6">
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-3 block">
              Select Currency
            </label>
            <div className="grid grid-cols-5 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSendCurrency(curr)}
                  className={`border-2 rounded-xl py-2 text-center transition-all duration-300 ${
                    sendCurrency === curr
                      ? 'border-saffron bg-saffron/10'
                      : 'border-sand bg-cream hover:border-saffron/50'
                  }`}
                >
                  <div className="font-playfair text-lg text-charcoal font-bold">
                    {currencySymbols[curr]}
                  </div>
                  <div className="font-garamond text-[10px] text-charcoal/50 mt-1">
                    {curr}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount input */}
          <div className="mb-6">
            <label className="font-garamond text-xs uppercase tracking-widest text-charcoal/60 mb-2 block">
              Enter Amount ({sendCurrency})
            </label>
            <input
              type="number"
              min="0"
              placeholder={`e.g. 50 ${sendCurrency}`}
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="w-full bg-cream border border-cream focus:border-saffron focus:outline-none font-garamond text-lg text-charcoal px-5 py-4 rounded-2xl transition-colors"
            />
            {sendAmount && (
              <div className="mt-2 text-sm font-garamond text-charcoal/60">
                ≈ ₹{(parseFloat(sendAmount) * conversionRates[sendCurrency]).toLocaleString('en-IN', { maximumFractionDigits: 0 })} INR
              </div>
            )}
          </div>

          {/* Send Error */}
          {sendError && (
            <div className="w-full bg-red-100 text-red-700 font-garamond text-sm px-4 py-3 rounded-2xl mb-6">
              {sendError}
            </div>
          )}

          {/* Send Success banner */}
          {sendSuccess && (
            <div className="w-full bg-green-500 text-white font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl text-center mb-6">
              ✓ Money Sent Successfully!
            </div>
          )}

          {/* Send Button */}
          {!sendSuccess && (
            <button
              onClick={handleSendMoney}
              disabled={isSending || !sendPhone || !sendAmount}
              className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all disabled:opacity-50"
            >
              {isSending ? 'Sending…' : 'Send Money →'}
            </button>
          )}
        </div>
      </div>






      {/* ── TRANSACTION HISTORY ── */}
      <div className="bg-sand rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-playfair text-xl text-charcoal font-semibold">
            Transaction History
          </h2>
          <button className="border border-sand text-charcoal/50 font-garamond text-xs px-4 py-2 rounded-full hover:border-saffron hover:text-saffron transition-all">
            Export CSV
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="font-garamond text-charcoal/60">Loading transactions…</p>
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
                  <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-lg shrink-0">
                    {formatted.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-playfair text-sm text-charcoal font-semibold truncate">
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
                  <div className="text-right shrink-0">
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