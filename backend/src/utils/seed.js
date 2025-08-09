const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const generateSlots = () => {
  const slots = [];
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }

    // Generate slots from 9 AM to 5 PM (30-minute intervals)
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startTime = new Date(currentDate);
        startTime.setHours(hour, minute, 0, 0);

        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + 30);

        slots.push({
          startAt: startTime,
          endAt: endTime
        });
      }
    }
  }

  return slots;
};

const seedData = async () => {
  try {
    // Seed admin user
    const adminExists = await prisma.user.findUnique({
      where: { email: process.env.ADMIN_EMAIL }
    });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      console.log('Admin user seeded');
    }

    // Seed slots if none exist
    const slotCount = await prisma.slot.count();
    if (slotCount === 0) {
      const slots = generateSlots();
      await prisma.slot.createMany({
        data: slots
      });
      console.log(`${slots.length} slots seeded`);
    }

  } catch (error) {
    console.error('Seeding error:', error);
  }
};

module.exports = { seedData };