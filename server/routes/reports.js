const express = require('express');
const { query, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const { models } = require('../models/index');
const logger = require('../utils/logger');

const router = express.Router();

// Outgoing cars report
router.get('/outgoing', [
  auth(['admin']),
  query('startDate').isISO8601().toDate(),
  query('endDate').isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.ParkingRecord.findAndCountAll({
      where: {
        exitDateTime: {
          [models.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: models.Parking, as: 'parking' },
        { model: models.User, as: 'user' },
        { model: models.Vehicle, as: 'vehicle' }
      ],
      limit,
      offset,
      order: [['exitDateTime', 'DESC']]
    });

    res.json({
      records: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Outgoing report error: ${error.message}`);
    next(error);
  }
});

// Entered cars report
router.get('/entries', [
  auth(['admin']),
  query('startDate').isISO8601().toDate(),
  query('endDate').isISO8601().toDate(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await models.ParkingRecord.findAndCountAll({
      where: {
        entryDateTime: {
          [models.Sequelize.Op.between]: [startDate, endDate]
        }
      },
      include: [
        { model: models.Parking, as: 'parking' },
        { model: models.User, as: 'user' },
        { model: models.Vehicle, as: 'vehicle' }
      ],
      limit,
      offset,
      order: [['entryDateTime', 'DESC']]
    });

    res.json({
      records: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error(`Entries report error: ${error.message}`);
    next(error);
  }
});

module.exports = router;