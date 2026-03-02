import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Mock OTP storage
const otpStore = new Map<string, string>();

router.post('/otp', async (req, res) => {
    try {
        const { phoneNumber, otp, action } = req.body;
        console.log(`[AUTH] Action: ${action}, Phone: ${phoneNumber}, OTP: ${otp}`);

        if (action === 'send') {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            otpStore.set(phoneNumber, generatedOtp);
            console.log(`[AUTH] Set OTP for ${phoneNumber}: ${generatedOtp}`);
            return res.json({ success: true, message: 'OTP sent successfully.' });
        }

        if (action === 'verify') {
            const storedOtp = otpStore.get(phoneNumber);
            console.log(`[AUTH] Verifying OTP. Stored: ${storedOtp}, Received: ${otp}`);

            if (otp === storedOtp) {
                let user = await User.findOne({ phoneNumber });
                if (!user) {
                    user = await User.create({ phoneNumber });
                }
                console.log(`[AUTH] Success. User: ${user._id}`);
                return res.json({ success: true, user, message: 'Verification successful' });
            } else {
                console.log(`[AUTH] Failed. Invalid OTP.`);
                return res.status(400).json({ success: false, message: 'Invalid OTP' });
            }
        }

        return res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (error: any) {
        console.error(`[AUTH] Error: ${error.message}`);
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/driver-auth', async (req, res) => {
    try {
        const { phoneNumber, otp, password, action } = req.body;
        console.log(`[DRIVER-AUTH] Phone: ${phoneNumber}, Action: ${action}`);

        let user = await User.findOne({ phoneNumber });

        if (action === 'verify_otp') {
            const storedOtp = otpStore.get(phoneNumber);
            if (otp !== storedOtp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

            if (!user) {
                user = await User.create({ phoneNumber, role: 'driver' });
                return res.json({ success: true, user, actionRequired: 'set_password' });
            } else if (!user.password) {
                user.role = 'driver'; // ensure role
                await user.save();
                return res.json({ success: true, user, actionRequired: 'set_password' });
            } else {
                return res.json({ success: true, user, actionRequired: 'enter_password' });
            }
        }

        if (action === 'set_password') {
            const storedOtp = otpStore.get(phoneNumber);
            if (otp !== storedOtp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

            if (!user) return res.status(404).json({ success: false, message: 'Driver not found' });

            user.password = password;
            await user.save();
            return res.json({ success: true, user, message: 'Password set successfully' });
        }

        if (action === 'verify_password') {
            if (!user) return res.status(404).json({ success: false, message: 'Driver not found' });

            if (user.password === password) {
                return res.json({ success: true, user, message: 'Login successful' });
            } else {
                return res.status(401).json({ success: false, message: 'Incorrect password' });
            }
        }

        return res.status(400).json({ success: false, message: 'Invalid action' });
    } catch (error: any) {
        console.error(`[DRIVER-AUTH] Error: ${error.message}`);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
