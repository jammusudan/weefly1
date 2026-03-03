import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// ✅ Fixed OTP for testing
const FIXED_OTP = '123456';

// Simple in-memory store (still used for consistency)
const otpStore = new Map<string, string>();

/**
 * CUSTOMER AUTH (OTP)
 */
router.post('/otp', async (req, res) => {
  try {
    const { phoneNumber, otp, action } = req.body;
    console.log(`[AUTH] Action: ${action}, Phone: ${phoneNumber}, OTP: ${otp}`);

    if (!phoneNumber || !action) {
      return res.status(400).json({ success: false, message: 'Missing phoneNumber or action' });
    }

    // 📩 SEND OTP
    if (action === 'send') {
      otpStore.set(phoneNumber, FIXED_OTP);
      console.log(`[AUTH] OTP set for ${phoneNumber}: ${FIXED_OTP}`);
      return res.json({
        success: true,
        message: 'OTP sent successfully (TEST MODE: 123456)',
      });
    }

    // ✅ VERIFY OTP
    if (action === 'verify') {
      const storedOtp = otpStore.get(phoneNumber);
      console.log(`[AUTH] Verifying OTP. Stored: ${storedOtp}, Received: ${otp}`);

      if (otp !== FIXED_OTP) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      let user = await User.findOne({ phoneNumber });
      if (!user) {
        user = await User.create({ phoneNumber, role: 'customer' });
      }

      console.log(`[AUTH] Login success. User ID: ${user._id}`);
      return res.json({
        success: true,
        user,
        message: 'OTP verified successfully',
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error: any) {
    console.error('[AUTH] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DRIVER AUTH (OTP + PASSWORD)
 */
router.post('/driver-auth', async (req, res) => {
  try {
    const { phoneNumber, otp, password, action } = req.body;
    console.log(`[DRIVER-AUTH] Phone: ${phoneNumber}, Action: ${action}`);

    if (!phoneNumber || !action) {
      return res.status(400).json({ success: false, message: 'Missing phoneNumber or action' });
    }

    let user = await User.findOne({ phoneNumber });

    // 🔐 VERIFY OTP
    if (action === 'verify_otp') {
      if (otp !== FIXED_OTP) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      if (!user) {
        user = await User.create({ phoneNumber, role: 'driver' });
        return res.json({ success: true, user, actionRequired: 'set_password' });
      }

      if (!user.password) {
        return res.json({ success: true, user, actionRequired: 'set_password' });
      }

      return res.json({ success: true, user, actionRequired: 'enter_password' });
    }

    // 🔑 SET PASSWORD
    if (action === 'set_password') {
      if (otp !== FIXED_OTP) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      if (!user) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }

      user.password = password;
      user.role = 'driver';
      await user.save();

      return res.json({ success: true, user, message: 'Password set successfully' });
    }

    // 🔓 VERIFY PASSWORD
    if (action === 'verify_password') {
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: 'Incorrect password' });
      }

      return res.json({ success: true, user, message: 'Login successful' });
    }

    return res.status(400).json({ success: false, message: 'Invalid action' });
  } catch (error: any) {
    console.error('[DRIVER-AUTH] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;