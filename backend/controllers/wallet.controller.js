import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import PaymentRecord from '../models/PaymentRecord.model.js';
import { createOrder, verifyPaymentSignature } from '../services/razorpay.service.js';
import { sendPaymentRequestSMS, sendTopUpConfirmationSMS, sendSMS } from '../services/twilio.service.js';

/**
 * Get wallet balance for authenticated user
 * Creates wallet if it doesn't exist
 */
export async function getWalletBalance(req, res) {
  try {
    const userId = req.user.uid;

    // Find or create wallet
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({ userId, inrBalance: 2000 });
      await wallet.save();
    } else if (wallet.inrBalance === 0) {
      wallet.inrBalance = 2000;
      await wallet.save();
    }

    res.json({
      success: true,
      data: {
        usdBalance: wallet.usdBalance,
        inrBalance: wallet.inrBalance,
        status: wallet.status,
      },
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch wallet balance',
    });
  }
}

/**
 * Create a Razorpay order for wallet top-up
 */
export async function createRazorpayOrder(req, res) {
  try {
    const userId = req.user.uid;
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Create order with Razorpay
    const order = await createOrder(amount, currency || 'INR', `rcpt_${Date.now().toString().slice(-8)}`);

    // Save payment record
    const paymentRecord = new PaymentRecord({
      userId,
      paymentGateway: 'razorpay',
      orderId: order.id,
      amount,
      currency: currency || 'INR',
      status: 'created',
      gatewayResponse: order,
    });

    await paymentRecord.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create order',
    });
  }
}

/**
 * Verify payment signature and top up wallet
 */
export async function verifyAndTopUp(req, res) {
  try {
    const userId = req.user.uid;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment details',
      });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Update wallet balance
    wallet.inrBalance += amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `txn_${Date.now()}`,
      userId,
      type: 'credit',
      currency: 'INR',
      amount,
      description: 'Wallet top-up via Razorpay',
      paymentMethod: 'razorpay',
      externalTransactionId: razorpay_payment_id,
      status: 'completed',
      metadata: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    });
    await transaction.save();

    // Update payment record status
    await PaymentRecord.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'paid' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Wallet top-up successful',
      data: {
        usdBalance: wallet.usdBalance,
        inrBalance: wallet.inrBalance,
        status: wallet.status,
        transactionId: transaction.transactionId,
      },
    });
  } catch (error) {
    console.error('Error in verify and top up:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to top up wallet',
    });
  }
}

/**
 * Get transaction history for authenticated user
 */
export async function getTransactionHistory(req, res) {
  try {
    const userId = req.user.uid;

    const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch transaction history',
    });
  }
}

/**
 * Add dummy money to wallet for testing purposes
 */
export async function addDummyMoney(req, res) {
  try {
    const userId = req.user.uid;
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount',
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Add amount to wallet (assuming amount is in INR)
    wallet.inrBalance += amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      transactionId: `test_${Date.now()}`,
      userId,
      type: 'credit',
      currency: 'INR',
      amount,
      description: `Test funds added (${currency})`,
      paymentMethod: 'wallet',
      status: 'completed',
      metadata: {
        testMode: true,
        originalCurrency: currency,
      },
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Test funds added to wallet successfully',
      data: {
        usdBalance: wallet.usdBalance,
        inrBalance: wallet.inrBalance,
        status: wallet.status,
        transactionId: transaction.transactionId,
      },
    });
  } catch (error) {
    console.error('Error adding dummy money:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add test funds',
    });
  }
}

/**
 * Process phone number payment and add funds to wallet
 */
export async function processPhonePayment(req, res) {
  try {
    const userId = req.user.uid;
    const { phoneNumber, amount, currency } = req.body;

    if (!phoneNumber || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number or amount',
      });
    }

    // Validate phone number format (E.164 standard)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format (E.164 required: +country code)',
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Check if user has sufficient balance
    if (wallet.inrBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance',
      });
    }

    // DEDUCT amount from wallet (paying a vendor)
    wallet.inrBalance -= amount;
    await wallet.save();

    // Create transaction record (DEBIT type)
    const transaction = new Transaction({
      transactionId: `phone_payment_${Date.now()}`,
      userId,
      type: 'debit',
      currency: 'INR',
      amount,
      description: `Vendor Payment via Phone (₹${amount})`,
      paymentMethod: 'wallet',
      status: 'completed',
      metadata: {
        paymentMethod: 'phone_vendor',
        vendorPhone: phoneNumber.slice(-4), // Store only last 4 digits for security
        originalCurrency: currency,
      },
    });
    await transaction.save();

    // Send SMS notification to vendor
    try {
      const vendorMessage = `SafarSathi: You received ₹${amount} from a tourist. Transaction ID: ${transaction.transactionId}`;
      await sendSMS(phoneNumber, vendorMessage);
    } catch (smsError) {
      console.warn('SMS notification failed, but payment was processed:', smsError);
      // Don't fail the transaction if SMS fails
    }

    res.json({
      success: true,
      message: 'Payment to vendor completed successfully.',
      data: {
        usdBalance: wallet.usdBalance,
        inrBalance: wallet.inrBalance,
        status: wallet.status,
        transactionId: transaction.transactionId,
      },
    });
  } catch (error) {
    console.error('Error processing phone payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process phone payment',
    });
  }
}

// ── Send money to phone (DEDUCT from wallet) ────────────────────────────────
export async function sendMoneyToPhone(req, res) {
  try {
    const userId = req.user.uid;
    const { recipientPhone, amount } = req.body;

    // Validate inputs
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(recipientPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format (E.164 required: +country code)',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    // Get or create wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId });
    }

    // Check if user has sufficient balance
    if (wallet.inrBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available: ₹${wallet.inrBalance}, Required: ₹${amount}`,
      });
    }

    // DEDUCT amount from wallet
    wallet.inrBalance -= amount;
    await wallet.save();

    // Create debit transaction record
    const transaction = new Transaction({
      transactionId: `send_phone_${Date.now()}`,
      userId,
      type: 'debit',
      currency: 'INR',
      amount: amount,
      description: `Money sent via phone to ${recipientPhone.slice(-4)}`,
      paymentMethod: 'wallet',
      status: 'completed',
      metadata: {
        recipientPhone: recipientPhone,
        transferType: 'phone_send',
      },
    });
    await transaction.save();

    // Send SMS notification to recipient
    try {
      const message = `💰 SafarSathi Money Received
Amount: ₹${amount}
You have received money via SafarSathi. 
Check your wallet for details.`;
      await sendSMS(recipientPhone, message);
    } catch (smsError) {
      console.warn('SMS to recipient failed, but transfer completed:', smsError);
    }

    res.json({
      success: true,
      message: 'Money sent successfully. Recipient will receive SMS.',
      data: {
        inrBalance: wallet.inrBalance,
        amountSent: amount,
        recipientPhone: recipientPhone,
        transactionId: transaction.transactionId,
      },
    });
  } catch (error) {
    console.error('Error sending money to phone:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send money',
    });
  }
}
