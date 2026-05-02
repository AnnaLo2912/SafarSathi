import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getWalletBalance,
  createRazorpayOrder,
  verifyAndTopUp,
  getTransactionHistory,
  addDummyMoney,
  processPhonePayment,
  sendMoneyToPhone,
} from '../controllers/wallet.controller.js';

const router = express.Router();

// All wallet routes require authentication
router.use(protect);

// Get wallet balance
router.get('/balance', getWalletBalance);

// Create Razorpay order for top-up
router.post('/order', createRazorpayOrder);

// Verify payment signature and top up wallet
router.post('/verify-topup', verifyAndTopUp);

// Add dummy money for testing
router.post('/add-dummy-money', addDummyMoney);

// Process phone number payment (ADDS money to self wallet)
router.post('/phone-payment', processPhonePayment);

// Send money to phone number (DEDUCTS from wallet)
router.post('/send-to-phone', sendMoneyToPhone);

// Get transaction history
router.get('/transactions', getTransactionHistory);

export default router;
