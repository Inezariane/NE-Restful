const express = require('express');
const { body, query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { models } = require('../models/index');
const logger = require('../utils/logger');

const router = express.Router();

// Register parking (admin only)
router.post('/', [
  auth(['admin']),
  body('code').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('totalSpaces').isInt({ min: 1 }),
  body('location').notEmpty().trim(),
  body('feePerHour').isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, name, totalSpaces, location, feePerHour } = req.body;
    const existingParking = await models.Parking.findOne({ where: { code } });
    if (existingParking) {
      return res.status(400).json({ error: 'Parking code already exists' });
    }

    const parking = await models.Parking.create({
      code,
      name,
      totalSpaces,
      availableSpaces: totalSpaces,
      location,
      feePerHour
    });

    res.status(201).json(parking);
  } catch (error) {
    logger.error(`Parking creation error: ${error.message}`);
    next(error);
  }
});

// Get all parkings (paginated)
router.get('/', [
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

    const { count, rows } = await models.Parking.findAndCountAll({
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      parkings: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error(`Parking fetch error: ${error.message}`);
    next(error);
  }
});

module.exports = router;