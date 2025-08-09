const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get available slots
router.get('/slots', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        error: {
          code: 'MISSING_DATE_RANGE',
          message: 'from and to dates are required (YYYY-MM-DD format)'
        }
      });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: 'Invalid date format. Use YYYY-MM-DD'
        }
      });
    }

    const slots = await prisma.slot.findMany({
      where: {
        startAt: {
          gte: fromDate,
          lte: toDate
        },
        booking: null // Only available slots
      },
      orderBy: {
        startAt: 'asc'
      }
    });

    res.json(slots);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_SLOTS_FAILED',
        message: 'Failed to fetch available slots'
      }
    });
  }
});

module.exports = router;