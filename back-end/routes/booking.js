const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Create a new booking with selected slots
router.post('/', async (req, res) => {
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
router.get('/user/:userId', async (req, res) => {
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
router.get('/:bookingId', async (req, res) => {
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
router.patch('/:bookingId/status', async (req, res) => {
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
router.get('/admin/:adminId', async (req, res) => {
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

module.exports = router;
