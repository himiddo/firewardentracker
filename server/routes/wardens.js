const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getContainer } = require('../config/db');

//helper function to get today's date string
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

//helper function to get current time string
function getCurrentTimeString() {
  const now = new Date();
  return now.toTimeString().split(' ')[0].substring(0, 5);
}

//get all warden entries for dashboard
router.get('/', async (req, res) => {
  try {
    const container = getContainer();
    const querySpec = {
      query: 'SELECT * FROM c ORDER BY c.created_at DESC'
    };
    const { resources: entries } = await container.items.query(querySpec).fetchAll();
    res.json(entries);
  } catch (err) {
    console.error('Error fetching wardens:', err);
    res.status(500).json({ error: 'Server error fetching warden data' });
  }
});

//get today's warden entries
router.get('/today', async (req, res) => {
  try {
    const container = getContainer();
    const today = getTodayDateString();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.entry_date = @today ORDER BY c.entry_time DESC',
      parameters: [{ name: '@today', value: today }]
    };
    const { resources: entries } = await container.items.query(querySpec).fetchAll();
    res.json(entries);
  } catch (err) {
    console.error('Error fetching today\'s wardens:', err);
    res.status(500).json({ error: 'Server error fetching today\'s warden data' });
  }
});

//get single warden entry by id
router.get('/:id', async (req, res) => {
  try {
    const container = getContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: req.params.id }]
    };
    const { resources: entries } = await container.items.query(querySpec).fetchAll();

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entries[0]);
  } catch (err) {
    console.error('Error fetching warden:', err);
    res.status(500).json({ error: 'Server error fetching warden' });
  }
});

//get warden entries by staff number
router.get('/staff/:staffNumber', async (req, res) => {
  try {
    const container = getContainer();
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.staff_number = @staffNumber ORDER BY c.entry_date DESC, c.entry_time DESC',
      parameters: [{ name: '@staffNumber', value: req.params.staffNumber }]
    };
    const { resources: entries } = await container.items.query(querySpec).fetchAll();
    res.json(entries);
  } catch (err) {
    console.error('Error fetching warden by staff number:', err);
    res.status(500).json({ error: 'Server error fetching warden data' });
  }
});

//post create new warden entry
router.post('/', async (req, res) => {
  try {
    const { staff_number, first_name, surname, location } = req.body;

    //validation
    if (!staff_number || !first_name || !surname || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const container = getContainer();
    const newEntry = {
      id: uuidv4(),
      staff_number,
      first_name,
      surname,
      location,
      entry_date: getTodayDateString(),
      entry_time: getCurrentTimeString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { resource: createdEntry } = await container.items.create(newEntry);
    res.status(201).json(createdEntry);
  } catch (err) {
    console.error('Error creating warden entry:', err);
    res.status(500).json({ error: 'Server error creating entry' });
  }
});

//put update warden entry
router.put('/:id', async (req, res) => {
  try {
    const { staff_number, first_name, surname, location } = req.body;
    const { id } = req.params;

    //validation
    if (!staff_number || !first_name || !surname || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const container = getContainer();

    //find the existing entry to get the partition key
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }]
    };
    const { resources: existingEntries } = await container.items.query(querySpec).fetchAll();

    if (existingEntries.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const existingEntry = existingEntries[0];

    //update the entry
    const updatedEntry = {
      ...existingEntry,
      staff_number,
      first_name,
      surname,
      location,
      entry_time: getCurrentTimeString(),
      updated_at: new Date().toISOString()
    };

    const { resource } = await container.item(id, existingEntry.staff_number).replace(updatedEntry);
    res.json(resource);
  } catch (err) {
    console.error('Error updating warden entry:', err);
    res.status(500).json({ error: 'Server error updating entry' });
  }
});

//delete warden entry
router.delete('/:id', async (req, res) => {
  try {
    const container = getContainer();

    //find the entry to get the partition key
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: req.params.id }]
    };
    const { resources: entries } = await container.items.query(querySpec).fetchAll();

    if (entries.length === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    const entry = entries[0];
    await container.item(req.params.id, entry.staff_number).delete();

    res.json({ message: 'Entry deleted successfully', deleted: entry });
  } catch (err) {
    console.error('Error deleting warden entry:', err);
    res.status(500).json({ error: 'Server error deleting entry' });
  }
});

module.exports = router;
