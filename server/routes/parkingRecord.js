const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const { models } = require('../models/index');
const logger = require('../utils/logger');

const router = express.Router();

// Register car entry (admin only)
router.post('/entry', [
  auth(['admin']),
  body('vehicleId').isUUID(),
  body('parkingId').isUUID(),
  body('entryDateTime').isISO8601().toDate().custom((value) => {
    const entryTime = new Date(value);
    const now = new Date();
    if (entryTime > now) {
      throw new Error('Entry time cannot be in the future');
    }
    return true;
  })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { vehicleId, parkingId, entryDateTime } = req.body;
    const vehicle = await models.Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const parking = await models.Parking.findByPk(parkingId);
    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    if (parking.availableSpaces <= 0) {
      return res.status(400).json({ error: 'No available spaces' });
    }

    const ticketNumber = `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`;
    const record = await models.ParkingRecord.create({
      vehicleId,
      parkingId,
      userId: vehicle.userId,
      ticketNumber,
      entryDateTime: new Date(entryDateTime)
    });

    await parking.update({ availableSpaces: parking.availableSpaces - 1 });

    logger.info(`Car entry recorded: Ticket ${ticketNumber}, Vehicle ${vehicle.plateNumber}`);
    res.status(201).json({ record, ticket: { ticketNumber } });
  } catch (error) {
    logger.error(`Car entry error: ${error.message}`);
    next(error);
  }
});

// Register car exit
router.post('/exit', [
  auth(['admin', 'user']),
  body('ticketNumber').notEmpty().trim(),
  body('exitDateTime').isISO8601().toDate().custom((value, { req }) => {
    const exitTime = new Date(value);
    const now = new Date();
    if (exitTime > now) {
      throw new Error('Exit time cannot be in the future');
    }
    return true;
  })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ticketNumber, exitDateTime } = req.body;
    const record = await models.ParkingRecord.findOne({
      where: { ticketNumber },
      include: [{ model: models.Parking, as: 'parking' }]
    });

    if (!record) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (record.exitDateTime) {
      return res.status(400).json({ error: 'Car already exited' });
    }

    const exitTime = new Date(exitDateTime);
    if (exitTime <= record.entryDateTime) {
      return res.status(400).json({ error: 'Exit time must be after entry time' });
    }

    const hoursParked = (exitTime - record.entryDateTime) / (1000 * 60 * 60);
    const chargedAmount = (hoursParked * record.parking.feePerHour).toFixed(2);

    await record.update({
      exitDateTime: exitTime,
      chargedAmount
    });

    await record.parking.update({
      availableSpaces: record.parking.availableSpaces + 1
    });

    logger.info(`Car exit recorded: Ticket ${ticketNumber}, Charged $${chargedAmount}`);
    res.json({
      record,
      bill: {
        ticketNumber,
        hoursParked: hoursParked.toFixed(2),
        chargedAmount
      }
    });
  } catch (error) {
    logger.error(`Car exit error: ${error.message}`);
    next(error);
  }
});

// Get user's tickets (paginated)
router.get('/my-tickets', [
  auth(['admin', 'user']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.ParkingRecord.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        { model: models.Parking, as: 'parking' },
        { model: models.Vehicle, as: 'vehicle' }
      ],
      limit,
      offset,
      order: [['entryDateTime', 'DESC']]
    });

    res.json({
      tickets: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error(`Ticket fetch error: ${error.message}`);
    next(error);
  }
});

module.exports = router;
