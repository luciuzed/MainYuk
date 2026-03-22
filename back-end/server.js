const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const app = express();

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const otpStore = {}; 

const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const sendOtpEmail = async (recipient, otpCode) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"MainYuk Support" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject: `Your Verification Code: ${otpCode}`,
    html: `
      <div style="font-family: Poppins,sans-serif; min-width:1000px; overflow:auto; line-height:2">
        <div style="margin:50px auto; width:70%; padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em; color: #009966; text-decoration:none; font-weight:600">MainYuk!</a>
          </div>
          <p style="font-size:1.1em">Your MainYuk Verification Code</p>
          <p>This code expires after 1 minute or if you request a new one.</p>
          <h2 style="background: #009966; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">
            ${otpCode}
          </h2>
          <p style="font-size:0.9em;">Regards,<br />MainYuk Team</p>
          <hr style="border:none; border-top:1px solid #eee" />
          <div style="float:right; padding:8px 0; color:#aaa; font-size:0.8em; line-height:1; font-weight:300">
            <p>MainYuk Support</p>
            <p>Indonesia</p>
          </div>
        </div>
      </div>
    `,
  });

  console.log('OTP email sent:', info.messageId);
  return info;
};

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


//REGISTER
app.post('/api/register', async (req, res) => {
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

app.post('/api/register-business', async (req, res) => {
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

//LOGIN
app.post('/api/login', async (req, res) => {
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

app.post('/api/login-business', async (req, res) => {
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

app.post('/api/resend-otp', async (req, res) => {
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

app.post('/api/verify-otp', async (req, res) => {
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

// FIELD MANAGEMENT ENDPOINTS

// Get all fields for a specific admin
app.get('/api/fields/:adminId', async (req, res) => {
  const { adminId } = req.params;
  try {
    const [fields] = await db.execute(
      'SELECT * FROM field WHERE admin_id = ? ORDER BY is_active DESC, created_at DESC',
      [adminId]
    );
    res.json(fields);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// Get all fields including inactive ones (for users to browse - active ones prioritized)
app.get('/api/fields-public', async (req, res) => {
  try {
    const [fields] = await db.execute(
      'SELECT id, admin_id, name, category, description, address, city, image_url, is_active, rating FROM field ORDER BY is_active DESC, created_at DESC'
    );
    res.json(fields);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// Get field details with slots
app.get('/api/field/:fieldId', async (req, res) => {
  const { fieldId } = req.params;
  try {
    const [field] = await db.execute(
      'SELECT * FROM field WHERE id = ?',
      [fieldId]
    );
    if (field.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    const [slots] = await db.execute(
      'SELECT * FROM field_slot WHERE field_id = ? ORDER BY start_time ASC',
      [fieldId]
    );

    res.json({ ...field[0], slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch field details' });
  }
});

// Create a new field
app.post('/api/fields', async (req, res) => {
  const { adminId, name, category, description, address, city, imageUrl, isActive, googleMapsLink } = req.body;

  // Validate required fields: Name, Category, Address, City
  if (!adminId || !name || !category || !address || !city) {
    return res.status(400).json({ error: 'Missing required fields: name, category, address, city' });
  }

  try {
    // Verify admin exists
    const [admin] = await db.execute('SELECT id FROM admin WHERE id = ?', [adminId]);
    if (admin.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const [result] = await db.execute(
      'INSERT INTO field (admin_id, name, category, description, address, city, image_url, is_active, google_maps_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [adminId, name, category, description || null, address, city, imageUrl || null, isActive !== false ? 1 : 0, googleMapsLink || null]
    );

    res.status(201).json({
      id: result.insertId,
      adminId,
      name,
      category,
      description,
      address,
      city,
      imageUrl,
      isActive: isActive !== false ? 1 : 0,
      googleMapsLink: googleMapsLink || null,
      message: 'Field created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create field' });
  }
});

// Update a field
app.put('/api/fields/:fieldId', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId, name, category, description, address, city, imageUrl, isActive, googleMapsLink } = req.body;

  // Validate required fields: Name, Category, Address, City
  if (!name || !category || !address || !city) {
    return res.status(400).json({ error: 'Missing required fields: name, category, address, city' });
  }

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT admin_id FROM field WHERE id = ?', [fieldId]);
    if (field.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    if (field[0].admin_id !== parseInt(adminId)) {
      return res.status(403).json({ error: 'Unauthorized: Field does not belong to this admin' });
    }

    await db.execute(
      'UPDATE field SET name = ?, category = ?, description = ?, address = ?, city = ?, image_url = ?, is_active = ?, google_maps_link = ? WHERE id = ?',
      [name, category, description || null, address, city, imageUrl || null, isActive !== undefined ? (isActive ? 1 : 0) : 1, googleMapsLink || null, fieldId]
    );

    res.json({ message: 'Field updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update field' });
  }
});

// Delete a field (hard delete - removes row from database entirely)
app.delete('/api/fields/:fieldId', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId } = req.body;

  try {
    const [field] = await db.execute('SELECT admin_id FROM field WHERE id = ?', [fieldId]);
    if (field.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    if (field[0].admin_id !== parseInt(adminId)) {
      return res.status(403).json({ error: 'Unauthorized: Field does not belong to this admin' });
    }

    await db.execute('DELETE FROM field WHERE id = ?', [fieldId]);
    res.json({ message: 'Field removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove field' });
  }
});

// Toggle field status (open/close)
app.patch('/api/fields/:fieldId/toggle-status', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId, isActive } = req.body;

  try {
    const [field] = await db.execute('SELECT admin_id FROM field WHERE id = ?', [fieldId]);
    if (field.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    if (field[0].admin_id !== parseInt(adminId)) {
      return res.status(403).json({ error: 'Unauthorized: Field does not belong to this admin' });
    }

    await db.execute('UPDATE field SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, fieldId]);
    res.json({ message: isActive ? 'Field opened successfully' : 'Field closed successfully', isActive });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle field status' });
  }
});

// Create field slots
app.post('/api/field-slots', async (req, res) => {
  const { fieldId, adminId, slots } = req.body;

  if (!fieldId || !slots || !Array.isArray(slots)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT admin_id FROM field WHERE id = ?', [fieldId]);
    if (field.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    if (field[0].admin_id !== parseInt(adminId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    for (const slot of slots) {
      const price = slot.price || 100000;
      await db.execute(
        'INSERT INTO field_slot (field_id, start_time, end_time, price, is_booked) VALUES (?, ?, ?, ?, 0)',
        [fieldId, slot.startTime, slot.endTime, price]
      );
    }

    res.status(201).json({ message: 'Slots created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create slots' });
  }
});

// Delete a field slot
app.delete('/api/field-slots/:slotId', async (req, res) => {
  const { slotId } = req.params;
  const { adminId } = req.body;

  try {
    // Verify slot exists and get its field
    const [slot] = await db.execute(
      'SELECT fs.id, f.admin_id FROM field_slot fs JOIN field f ON fs.field_id = f.id WHERE fs.id = ?',
      [slotId]
    );

    if (slot.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot[0].admin_id !== parseInt(adminId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Don't allow deletion of booked slots
    const [bookedCheck] = await db.execute('SELECT is_booked FROM field_slot WHERE id = ?', [slotId]);
    if (bookedCheck[0] && bookedCheck[0].is_booked === 1) {
      return res.status(409).json({ error: 'Cannot delete booked slot' });
    }

    await db.execute('DELETE FROM field_slot WHERE id = ?', [slotId]);
    res.json({ message: 'Slot deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

// ============ BOOKING ENDPOINTS (UC-03) ============

// Get all available slots for a field with pricing and court info
app.get('/api/field/:fieldId/slots', async (req, res) => {
  const { fieldId } = req.params;
  try {
    const [slots] = await db.execute(
      `SELECT 
        fs.id, 
        fs.field_id, 
        fs.court_id,
        c.name as court_name,
        fs.start_time, 
        fs.end_time, 
        fs.price, 
        fs.is_booked 
      FROM field_slot fs
      LEFT JOIN court c ON fs.court_id = c.id
      WHERE fs.field_id = ? 
      ORDER BY fs.court_id, fs.start_time ASC`,
      [fieldId]
    );
    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Create a new booking with selected slots
app.post('/api/bookings', async (req, res) => {
  const { userId, fieldId, selectedSlotIds } = req.body;

  if (!userId || !fieldId || !selectedSlotIds || !Array.isArray(selectedSlotIds) || selectedSlotIds.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid required fields: userId, fieldId, selectedSlotIds (non-empty array)' });
  }

  try {
    // Verify field exists
    const [fieldRows] = await db.execute('SELECT id FROM field WHERE id = ?', [fieldId]);
    if (fieldRows.length === 0) {
      return res.status(404).json({ error: 'Field not found' });
    }

    // Get slot details and prices
    const [slots] = await db.execute(
      'SELECT id, price, is_booked FROM field_slot WHERE id IN (?) AND field_id = ?',
      [selectedSlotIds, fieldId]
    );

    // Check if all requested slots exist
    if (slots.length !== selectedSlotIds.length) {
      return res.status(400).json({ error: 'One or more selected slots do not exist or do not belong to this field' });
    }

    // Check if any slot is already booked
    const bookedSlot = slots.find(s => s.is_booked === 1);
    if (bookedSlot) {
      return res.status(409).json({ error: 'One or more selected slots are already booked' });
    }

    // Calculate total amount
    const totalAmount = slots.reduce((sum, slot) => sum + parseFloat(slot.price), 0);

    // Create booking record
    const [bookingResult] = await db.execute(
      'INSERT INTO booking (user_id, status, total_amount) VALUES (?, ?, ?)',
      [userId, 'pending', totalAmount]
    );

    const bookingId = bookingResult.insertId;

    // Link slots to booking via booking_slots junction table
    for (const slotId of selectedSlotIds) {
      await db.execute(
        'INSERT INTO booking_slots (booking_id, slot_id) VALUES (?, ?)',
        [bookingId, slotId]
      );
    }

    res.status(201).json({
      id: bookingId,
      userId,
      fieldId,
      status: 'pending',
      totalAmount,
      selectedSlots: selectedSlotIds,
      message: 'Booking created successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Get all bookings for a user
app.get('/api/user/:userId/bookings', async (req, res) => {
  const { userId } = req.params;
  try {
    const [bookings] = await db.execute(`
      SELECT 
        b.id,
        b.user_id,
        b.booking_date,
        b.status,
        b.total_amount,
        f.id as field_id,
        f.name as field_name,
        f.category,
        f.image_url,
        f.address,
        f.city,
        GROUP_CONCAT(CONCAT(fs.start_time, ' - ', fs.end_time) SEPARATOR ', ') as time_slots
      FROM booking b
      JOIN booking_slots bs ON b.id = bs.booking_id
      JOIN field_slot fs ON bs.slot_id = fs.id
      JOIN field f ON fs.field_id = f.id
      WHERE b.user_id = ?
      GROUP BY b.id, b.user_id, b.booking_date, b.status, b.total_amount, f.id, f.name, f.category, f.image_url, f.address, f.city
      ORDER BY b.booking_date DESC
    `, [userId]);

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get booking details
app.get('/api/bookings/:bookingId', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const [booking] = await db.execute(`
      SELECT 
        b.id,
        b.user_id,
        b.booking_date,
        b.status,
        b.total_amount,
        f.id as field_id,
        f.name as field_name,
        f.category,
        f.image_url,
        f.address,
        f.city,
        f.admin_id
      FROM booking b
      JOIN booking_slots bs ON b.id = bs.booking_id
      JOIN field_slot fs ON bs.slot_id = fs.id
      JOIN field f ON fs.field_id = f.id
      WHERE b.id = ?
      LIMIT 1
    `, [bookingId]);

    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Get all slots for this booking
    const [slots] = await db.execute(`
      SELECT fs.id, fs.start_time, fs.end_time, fs.price
      FROM booking_slots bs
      JOIN field_slot fs ON bs.slot_id = fs.id
      WHERE bs.booking_id = ?
      ORDER BY fs.start_time ASC
    `, [bookingId]);

    res.json({
      ...booking[0],
      slots
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status (e.g., mark as confirmed after payment)
app.patch('/api/bookings/:bookingId/status', async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be one of: pending, confirmed, cancelled' });
  }

  try {
    const [booking] = await db.execute('SELECT id FROM booking WHERE id = ?', [bookingId]);
    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status
    await db.execute('UPDATE booking SET status = ? WHERE id = ?', [status, bookingId]);

    // If confirmed, mark slots as booked
    if (status === 'confirmed') {
      await db.execute(`
        UPDATE field_slot 
        SET is_booked = 1 
        WHERE id IN (
          SELECT slot_id FROM booking_slots WHERE booking_id = ?
        )
      `, [bookingId]);
    }

    // If cancelled, unmark slots as booked
    if (status === 'cancelled') {
      await db.execute(`
        UPDATE field_slot 
        SET is_booked = 0 
        WHERE id IN (
          SELECT slot_id FROM booking_slots WHERE booking_id = ?
        )
      `, [bookingId]);
    }

    res.json({ 
      message: `Booking status updated to ${status}`,
      bookingId,
      status 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Get all bookings for an admin's fields (for admin dashboard)
app.get('/api/admin/:adminId/bookings', async (req, res) => {
  const { adminId } = req.params;
  try {
    const [bookings] = await db.execute(`
      SELECT 
        b.id,
        b.user_id,
        b.booking_date,
        b.status,
        b.total_amount,
        f.id as field_id,
        f.name as field_name,
        f.category,
        u.name as user_name,
        u.email as user_email,
        u.phone_number as user_phone,
        GROUP_CONCAT(CONCAT(DATE_FORMAT(fs.start_time, '%Y-%m-%d %H:%i'), ' - ', DATE_FORMAT(fs.end_time, '%H:%i')) SEPARATOR ', ') as time_slots
      FROM booking b
      JOIN booking_slots bs ON b.id = bs.booking_id
      JOIN field_slot fs ON bs.slot_id = fs.id
      JOIN field f ON fs.field_id = f.id
      JOIN users u ON b.user_id = u.id
      WHERE f.admin_id = ?
      GROUP BY b.id, b.user_id, b.booking_date, b.status, b.total_amount, f.id, f.name, f.category, u.id, u.name, u.email, u.phone_number
      ORDER BY b.booking_date DESC
    `, [adminId]);

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// ============ COURT-BASED SCHEDULING ENDPOINTS ============

// Get all courts for a field
app.get('/api/field/:fieldId/courts', async (req, res) => {
  const { fieldId } = req.params;
  try {
    const [courts] = await db.execute(
      'SELECT id, field_id, name FROM court WHERE field_id = ? ORDER BY name ASC',
      [fieldId]
    );
    res.json(courts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

// Create a new court for a field
app.post('/api/field/:fieldId/courts', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId, name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Court name is required' });
  }

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT id FROM field WHERE id = ? AND admin_id = ?', [fieldId, adminId]);
    if (field.length === 0) {
      return res.status(403).json({ error: 'Not authorized to modify this field' });
    }

    const [result] = await db.execute(
      'INSERT INTO court (field_id, name) VALUES (?, ?)',
      [fieldId, name]
    );

    res.status(201).json({ id: result.insertId, field_id: fieldId, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create court' });
  }
});

// Delete a court
app.delete('/api/field/:fieldId/courts/:courtId', async (req, res) => {
  const { fieldId, courtId } = req.params;
  const { adminId } = req.body;

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT id FROM field WHERE id = ? AND admin_id = ?', [fieldId, adminId]);
    if (field.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete court (cascade will delete related slots)
    const [result] = await db.execute(
      'DELETE FROM court WHERE id = ? AND field_id = ?',
      [courtId, fieldId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Court not found' });
    }

    res.json({ message: 'Court deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete court' });
  }
});

// Generate hourly slots for a court based on schedule
app.post('/api/field/:fieldId/generate-slots', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId, courtId, courtName, openingTime, closingTime, price, startDate, duration, durationType, daysOfWeek } = req.body;

  if (!courtId || !openingTime || !closingTime || !price || !startDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT id FROM field WHERE id = ? AND admin_id = ?', [fieldId, adminId]);
    if (field.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Parse times
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);

    // Generate all dates to create slots for
    const baseDate = new Date(startDate);
    baseDate.setHours(0, 0, 0, 0);
    
    const datesForSlots = [];
    const endDate = new Date(baseDate);
    
    if (durationType === 'specific') {
      // Just one date
      datesForSlots.push(new Date(baseDate));
    } else if (durationType === 'weekly') {
      // Repeat for N days, only on selected days of week
      endDate.setDate(baseDate.getDate() + duration);
      
      for (let d = new Date(baseDate); d < endDate; d.setDate(d.getDate() + 1)) {
        if (daysOfWeek.includes(d.getDay())) {
          datesForSlots.push(new Date(d));
        }
      }
    }

    // For each date, create hourly slots
    let slotsCreated = 0;
    for (const date of datesForSlots) {
      const currentTime = new Date(date);
      currentTime.setHours(openHour, openMin, 0, 0);

      const closeDateTime = new Date(date);
      closeDateTime.setHours(closeHour, closeMin, 0, 0);

      while (currentTime < closeDateTime) {
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime);
        endTime.setHours(endTime.getHours() + 1);

        // Check if slot already exists
        const [existing] = await db.execute(
          'SELECT id FROM field_slot WHERE field_id = ? AND court_id = ? AND start_time = ? AND end_time = ?',
          [fieldId, courtId, startTime, endTime]
        );

        if (existing.length === 0) {
          await db.execute(
            'INSERT INTO field_slot (field_id, court_id, start_time, end_time, price, is_booked) VALUES (?, ?, ?, ?, ?, 0)',
            [fieldId, courtId, startTime, endTime, price]
          );
          slotsCreated++;
        }

        currentTime.setHours(currentTime.getHours() + 1);
      }
    }

    res.json({ message: 'Slots generated', count: slotsCreated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate slots' });
  }
});

// Create or update a schedule override for a specific date
app.post('/api/field/:fieldId/slots/override', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId, courtId, overrideDate, openingTime, closingTime, price } = req.body;

  if (!courtId || !overrideDate || !openingTime || !closingTime || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT id FROM field WHERE id = ? AND admin_id = ?', [fieldId, adminId]);
    if (field.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Parse override times
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);

    const date = new Date(overrideDate);
    date.setHours(0, 0, 0, 0);

    // Delete existing slots for this court on this date
    await db.execute(
      `DELETE FROM field_slot 
       WHERE field_id = ? AND court_id = ? 
       AND DATE(start_time) = DATE(?)`,
      [fieldId, courtId, date]
    );

    // Create new slots with override schedule
    const currentTime = new Date(date);
    currentTime.setHours(openHour, openMin, 0, 0);

    const closeDateTime = new Date(date);
    closeDateTime.setHours(closeHour, closeMin, 0, 0);

    let slotsCreated = 0;
    while (currentTime < closeDateTime) {
      const startTime = new Date(currentTime);
      const endTime = new Date(currentTime);
      endTime.setHours(endTime.getHours() + 1);

      await db.execute(
        'INSERT INTO field_slot (field_id, court_id, start_time, end_time, price, is_booked) VALUES (?, ?, ?, ?, ?, 0)',
        [fieldId, courtId, startTime, endTime, price]
      );
      slotsCreated++;

      currentTime.setHours(currentTime.getHours() + 1);
    }

    res.json({ message: 'Schedule override applied', count: slotsCreated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to apply override' });
  }
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));