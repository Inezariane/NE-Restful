const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { models } = require('../models/index');
const logger = require('../utils/logger');

const router = express.Router();

// Register vehicle
router.post('/', [
  auth(['admin', 'user']),
  body('plateNumber').notEmpty().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plateNumber } = req.body;
    const existingVehicle = await models.Vehicle.findOne({ where: { plateNumber } });
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle plate number already exists' });
    }

    const vehicle = await models.Vehicle.create({
      plateNumber,
      userId: req.user.id
    });

    res.status(201).json(vehicle);
  } catch (error) {
    logger.error(`Vehicle creation error: ${error.message}`);
    next(error);
  }
});

// Get user's vehicles (paginated)
router.get('/', [
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

    const { count, rows } = await models.Vehicle.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: [['plateNumber', 'ASC']]
    });

    res.json({
      vehicles: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error(`Vehicle fetch error: ${error.message}`);
    next(error);
  }
});

// Get all vehicles with user details (admin only, for car entry)
router.get('/all', [
  auth(['admin']),
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

    const { count, rows } = await models.Vehicle.findAndCountAll({
      include: [{ model: models.User, as: 'user', attributes: ['id', 'firstName', 'lastName'] }],
      limit,
      offset,
      order: [['plateNumber', 'ASC']]
    });

    res.json({
      vehicles: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error(`All vehicles fetch error: ${error.message}`);
    next(error);
  }
});

module.exports = router;