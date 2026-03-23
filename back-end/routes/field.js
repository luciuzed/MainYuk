const express = require('express');
const db = require('../config/database');

const router = express.Router();

// Get all fields for a specific admin
router.get('/:adminId', async (req, res) => {
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
router.get('/', async (req, res) => {
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
router.get('/detail/:fieldId', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:fieldId', async (req, res) => {
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
router.delete('/:fieldId', async (req, res) => {
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
router.patch('/:fieldId/toggle-status', async (req, res) => {
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
router.post('/slots', async (req, res) => {
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
router.delete('/slots/:slotId', async (req, res) => {
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

// COURT ROUTES (nested under field)
// Get all courts for a field
router.get('/:fieldId/courts', async (req, res) => {
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
router.post('/:fieldId/courts', async (req, res) => {
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
router.delete('/:fieldId/courts/:courtId', async (req, res) => {
  const { fieldId, courtId } = req.params;
  const { adminId } = req.body;

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT id FROM field WHERE id = ? AND admin_id = ?', [fieldId, adminId]);
    if (field.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete court
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
router.post('/:fieldId/generate-slots', async (req, res) => {
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

    res.status(201).json({ message: `${slotsCreated} slots created` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate slots' });
  }
});

// Slot override endpoint
router.post('/:fieldId/slots/override', async (req, res) => {
  const { fieldId } = req.params;
  const { adminId, slotId, newPrice } = req.body;

  if (!slotId || newPrice === undefined) {
    return res.status(400).json({ error: 'slotId and newPrice are required' });
  }

  try {
    // Verify field belongs to admin
    const [field] = await db.execute('SELECT id FROM field WHERE id = ? AND admin_id = ?', [fieldId, adminId]);
    if (field.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Verify slot belongs to field
    const [slot] = await db.execute('SELECT id FROM field_slot WHERE id = ? AND field_id = ?', [slotId, fieldId]);
    if (slot.length === 0) {
      return res.status(404).json({ error: 'Slot not found' });
    }

    // Update price
    await db.execute('UPDATE field_slot SET price = ? WHERE id = ?', [newPrice, slotId]);
    res.json({ message: 'Slot price updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

module.exports = router;
