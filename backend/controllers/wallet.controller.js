import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import PaymentRecord from '../models/PaymentRecord.model.js';
import { createOrder, verifyPaymentSignature } from '../services/razorpay.service.js';

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
