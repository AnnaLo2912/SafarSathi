import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in rupees (will be converted to paise)
 * @param {string} currency - Currency code (default: 'INR')
 * @param {string} receipt - Receipt identifier
 * @returns {Promise<object>} Order object from Razorpay
 */
export async function createOrder(amount, currency = 'INR', receipt) {
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
    });
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
}

/**
 * Verify payment signature from Razorpay
 * @param {string} orderId - Order ID from Razorpay
 * @param {string} paymentId - Payment ID from Razorpay
 * @param {string} signature - Signature from Razorpay webhook
 * @returns {boolean} True if signature is valid, false otherwise
 */
export function verifyPaymentSignature(orderId, paymentId, signature) {
  try {
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}
