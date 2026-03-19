import { useState } from 'react'

export default function WalletPanel() {
  const [showQR, setShowQR] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpSuccess, setTopUpSuccess] = useState(false)

  const walletData = {
    usd: 47.5,
    inr: 3940,
    transactions: [
      {
        id: 1,
        type: 'credit',
        title: 'Wallet Top-up',
        subtitle: 'Razorpay · USD to INR',
        amount: '+₹8,300',
        amountUSD: '+$100',
        date: 'Today, 2:30 PM',
        icon: '💳',
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'debit',
        title: 'ITC Rajputana Hotel',
        subtitle: 'Stripe · 2 nights',
        amount: '-$95.00',
        amountUSD: null,
        date: 'Today, 11:00 AM',
        icon: '🏨',
        color: 'text-terracotta'
      },
      {
        id: 3,
        type: 'debit',
        title: 'Lassiwala Restaurant',
        subtitle: 'UPI QR Scan',
        amount: '-₹250',
        amountUSD: null,
        date: 'Yesterday, 1:15 PM',
        icon: '🍽️',
        color: 'text-terracotta'
      },
      {
        id: 4,
        type: 'debit',
        title: 'Rajesh Kumar — Guide',
        subtitle: 'Booking · 1 day',
        amount: '-₹2,000',
        amountUSD: null,
        date: 'Yesterday, 9:00 AM',
        icon: '🧭',
        color: 'text-terracotta'
      },
      {
        id: 5,
        type: 'debit',
        title: 'Amber Fort Entry',
        subtitle: 'UPI QR Scan',
        amount: '-₹500',
        amountUSD: null,
        date: '2 days ago',
        icon: '🏯',
        color: 'text-terracotta'
      },
      {
        id: 6,
        type: 'credit',
        title: 'Wallet Top-up',
        subtitle: 'Razorpay · USD to INR',
        amount: '+₹4,150',
        amountUSD: '+$50',
        date: '3 days ago',
        icon: '💳',
        color: 'text-green-600'
      }
    ]
  }

  const quickAmounts = [25, 50, 100, 200]

  function handleTopUpConfirm() {
    if (!topUpAmount) return
    setTopUpSuccess(true)
    setTimeout(() => {
      setTopUpSuccess(false)
      setTopUpAmount('')
    }, 2500)
  }

  const conversionRate = 83.2

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
              ${walletData.usd.toFixed(2)}
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
              ₹{walletData.inr.toLocaleString('en-IN')}
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
            <div className="text-5xl mb-3">📱</div>
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
        {topUpSuccess ? (
          <button className="w-full bg-green-500 text-white cursor-default font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl text-center">
            ✓ Top-up Successful!
          </button>
        ) : (
          <button
            onClick={handleTopUpConfirm}
            disabled={!topUpAmount}
            className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-2xl hover:bg-saffron hover:text-charcoal transition-all duration-300 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {topUpAmount
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
        <div className="space-y-2">
          {walletData.transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 bg-cream rounded-2xl px-5 py-4 border border-sand hover:border-saffron/30 transition-all duration-200"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-sand flex items-center justify-center text-lg shrink-0">
                {transaction.icon}
              </div>

              {/* Center Content */}
              <div className="flex-1">
                <div className="font-playfair text-sm text-charcoal font-semibold">
                  {transaction.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-garamond text-xs text-charcoal/50">
                    {transaction.subtitle}
                  </span>
                  <span className="font-garamond text-xs text-charcoal/40">·</span>
                  <span className="font-garamond text-xs text-charcoal/40">
                    {transaction.date}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className={`font-playfair text-base font-bold ${transaction.color}`}>
                  {transaction.amount}
                </div>
                {transaction.amountUSD && (
                  <div className="font-garamond text-xs text-charcoal/40 mt-0.5">
                    {transaction.amountUSD}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
