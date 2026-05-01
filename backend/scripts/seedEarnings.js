import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from '../models/Booking.model.js';

dotenv.config();

async function seedEarnings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // GET GUIDE ID FROM ARGUMENT OR USE A DEFAULT FROM PREVIOUS LIST
    const guideId = process.argv[2] || 'TlMp5MYMwKbAljGEOzVBKZz6if13'; // Default to Rajkumar Yadav if no ID provided
    
    console.log(`Seeding data for Guide UID: ${guideId}`);

    // Create 10 completed bookings across various dates
    const now = new Date();
    const bookings = [];

    const historicalData = [
      { daysAgo: 0, price: 2000, name: 'Alice Smith' },
      { daysAgo: 1, price: 1500, name: 'Bob Jones' },
      { daysAgo: 3, price: 2500, name: 'Charlie Brown' },
      { daysAgo: 8, price: 1800, name: 'David Wilson' },
      { daysAgo: 15, price: 2200, name: 'Eve Davis' },
      { daysAgo: 25, price: 3000, name: 'Frank Miller' },
      { daysAgo: 45, price: 1200, name: 'Grace Hopper' },
      { daysAgo: 60, price: 2800, name: 'Heidi Klum' },
      { daysAgo: 100, price: 3500, name: 'Ivan Drago' },
      { daysAgo: 200, price: 4000, name: 'John Doe' },
    ];

    for (const item of historicalData) {
      const date = new Date(now);
      date.setDate(now.getDate() - item.daysAgo);
      
      bookings.push({
        tourist_id: 'tourist_test_id',
        touristName: item.name,
        guide_id: guideId,
        guideName: 'Seed Guide',
        date: date.toDateString(),
        time: '10:00 AM',
        duration: '4 hours',
        location: 'Jaipur, India',
        price: item.price,
        status: 'completed',
        updatedAt: date,
        createdAt: date
      });
    }

    // Clear existing test bookings for this guide if any (optional)
    // await Booking.deleteMany({ guide_id: guideId, tourist_id: 'tourist_test_id' });

    // Use raw collection to preserve the updatedAt/createdAt we specified
    await Booking.collection.insertMany(bookings);
    console.log('Successfully seeded 10 completed bookings with historical timestamps!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedEarnings();
