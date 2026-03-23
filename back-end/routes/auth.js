const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { otpStore, generateOtp, sendOtpEmail } = require('../utils/otp');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const key = `${email}:user`;
    otpStore[key] = {
      code: otp,
      expiresAt: Date.now() + 60_000,
      used: false,
      type: 'register',
      role: 'User',
      payload: {
        name,
        email,
        password: hashedPassword,
        phone,
      }
    };

    await sendOtpEmail(email, otp).catch((e) => {
      console.error('Email send failed', e);
    });

    res.status(201).json({ message: "OTP sent for registration", otpNeeded: true, role: 'User' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post('/register-business', async (req, res) => {
  const { email, password, name, phone } = req.body;
  
  try {
    const [existing] = await db.execute('SELECT id FROM admin WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const key = `${email}:business`;
    otpStore[key] = {
      code: otp,
      expiresAt: Date.now() + 60_000,
      used: false,
      type: 'register',
      role: 'Business',
      payload: {
        name,
        email,
        password: hashedPassword,
        phone,
      }
    };

    console.log(`[REGISTER-BUSINESS] Generated OTP for ${email} with key: ${key}, OTP: ${otp}`);
    console.log(`[REGISTER-BUSINESS] OTP expires at: ${new Date(otpStore[key].expiresAt)}`);

    await sendOtpEmail(email, otp).catch((e) => {
      console.error('Email send failed', e);
    });

    res.status(201).json({ message: "OTP sent for business registration", otpNeeded: true, role: 'Business' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: "User not found" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`${password} vs ${user.password}`);

    if (isMatch) {
      const otp = generateOtp();
      const key = `${email}:user`;
      otpStore[key] = {
        code: otp,
        expiresAt: Date.now() + 60_000,
        used: false,
        type: 'login',
        role: 'User',
      };

      await sendOtpEmail(email, otp).catch((e) => {
        console.error('Email send failed', e);
      });

      return res.json({ message: "OTP sent", otpNeeded: true, user: { name: user.name, email: user.email }, role: 'User' });
    } else {
      res.status(401).json({ error: "Wrong credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/login-business', async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email);
  try {
    const [rows] = await db.execute('SELECT * FROM admin WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: "Account not found" });

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log(`${password} vs ${admin.password}`);

    if (isMatch) {
      const otp = generateOtp();
      const key = `${email}:business`;
      otpStore[key] = {
        code: otp,
        expiresAt: Date.now() + 60_000,
        used: false,
        type: 'login',
        role: 'Business',
      };

      await sendOtpEmail(email, otp).catch((e) => {
        console.error('Email send failed', e);
      });

      return res.json({ message: "OTP sent", otpNeeded: true, admin: { name: admin.name, email: admin.email }, role: 'Business' });
    } else {
      res.status(401).json({ error: "Wrong credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post('/resend-otp', async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }

  const key = `${email}:${role.toLowerCase()}`;
  const entry = otpStore[key];

  if (!entry) {
    return res.status(404).json({ error: 'No pending OTP session found' });
  }

  const otp = generateOtp();
  otpStore[key] = {
    ...entry,
    code: otp,
    expiresAt: Date.now() + 60_000,
    used: false,
  };

  try {
    await sendOtpEmail(email, otp);
    return res.json({ message: 'OTP resent', otpNeeded: true });
  } catch (err) {
    console.error('Resend OTP email failed', err);
    return res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, role, otp } = req.body;
  if (!email || !role || !otp) {
    return res.status(400).json({ error: 'Email, role, and OTP are required' });
  }

  const key = `${email}:${role.toLowerCase()}`;
  const entry = otpStore[key];

  console.log(`[VERIFY-OTP] Attempting to verify OTP`);
  console.log(`[VERIFY-OTP] Email: ${email}, Role: ${role}, OTP: ${otp}`);
  console.log(`[VERIFY-OTP] Looking for key: ${key}`);
  console.log(`[VERIFY-OTP] Current OTP store keys:`, Object.keys(otpStore));
  console.log(`[VERIFY-OTP] Entry found:`, entry ? 'YES' : 'NO');

  if (!entry) {
    return res.status(401).json({ error: 'OTP not found or expired' });
  }

  if (entry.used) {
    return res.status(401).json({ error: 'OTP already used' });
  }

  if (Date.now() > entry.expiresAt) {
    console.log(`[VERIFY-OTP] OTP expired. Current time: ${new Date()}, Expires at: ${new Date(entry.expiresAt)}`);
    delete otpStore[key];
    return res.status(401).json({ error: 'OTP expired' });
  }

  if (entry.code !== otp) {
    console.log(`[VERIFY-OTP] OTP code mismatch. Expected: ${entry.code}, Received: ${otp}`);
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  console.log(`[VERIFY-OTP] OTP verified successfully for ${email}`);
  entry.used = true;
  delete otpStore[key];

  if (entry.type === 'register') {
    try {
      if (entry.role === 'Business') {
        await db.execute(
          'INSERT INTO admin (email, password, name, number) VALUES (?, ?, ?, ?)',
          [entry.payload.email, entry.payload.password, entry.payload.name, entry.payload.phone]
        );
      } else {
        await db.execute(
          'INSERT INTO users (email, password, name, phone_number) VALUES (?, ?, ?, ?)',
          [entry.payload.email, entry.payload.password, entry.payload.name, entry.payload.phone]
        );
      }
    } catch (err) {
      console.error('Registration commit failed', err);
      return res.status(500).json({ error: 'Could not complete registration after OTP' });
    }
  }

  if (entry.role === 'Business') {
    const [admin] = await db.execute('SELECT id, name, email FROM admin WHERE email = ?', [email]);
    if (admin.length > 0) {
      const adminData = admin[0];
      return res.json({ message: 'OTP verified', success: true, redirect: '/dashboard', adminId: adminData.id, adminName: adminData.name });
    }
  } else if (entry.role === 'User') {
    const [user] = await db.execute('SELECT id, name, email FROM users WHERE email = ?', [email]);
    if (user.length > 0) {
      const userData = user[0];
      return res.json({ 
        message: 'OTP verified', 
        success: true, 
        redirect: '/venue',
        user: { userId: userData.id, name: userData.name, email: userData.email, role: 'User' }
      });
    }
  }

  const redirect = entry.role === 'Business' ? '/dashboard' : '/venue';
  res.json({ message: 'OTP verified', success: true, redirect });
});

module.exports = router;
