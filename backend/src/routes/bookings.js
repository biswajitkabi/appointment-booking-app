const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Book a slot
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const { slotId } = req.body;
    const userId = req.user.userId;

    if (!slotId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SLOT_ID',
          message: 'Slot ID is required'
        }
      });
    }

    // Check if slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { booking: true }
    });

    if (!slot) {
      return res.status(404).json({
        error: {
          code: 'SLOT_NOT_FOUND',
          message: 'Slot not found'
        }
      });
    }

    if (slot.booking) {
      return res.status(400).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This slot is already booked'
        }
      });
    }

    // Create booking with transaction to prevent race conditions
    const booking = await prisma.booking.create({
      data: {
        userId,
        slotId
      },
      include: {
        slot: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Booking error:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This slot is already booked'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'BOOKING_FAILED',
        message: 'Failed to create booking'
      }
    });
  }
});

// Get user's bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        slot: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_BOOKINGS_FAILED',
        message: 'Failed to fetch your bookings'
      }
    });
  }
});

// Get all bookings (admin only)
router.get('/all-bookings', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        slot: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_ALL_BOOKINGS_FAILED',
        message: 'Failed to fetch all bookings'
      }
    });
  }
});

module.exports = router;