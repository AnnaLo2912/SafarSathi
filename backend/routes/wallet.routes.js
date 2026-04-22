import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getWalletBalance,
  createRazorpayOrder,
  verifyAndTopUp,
  getTransactionHistory,
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

// Get transaction history
router.get('/transactions', getTransactionHistory);

export default router;
