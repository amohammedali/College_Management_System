const mongoose = require('mongoose');

async function verifyConflicts() {
    await mongoose.connect('mongodb://127.0.0.1:27017/cms');
    const db = mongoose.connection.db;

    // 1. Find Ammar and Kamran
    const ammar = await db.collection('staffs').findOne({ name: 'Ammar' });
    const kamran = await db.collection('staffs').findOne({ name: 'Kamran' });
    const dept = await db.collection('departments').findOne({ name: 'Civil Engineering' });
    const subject = await db.collection('subjects').findOne({ department: 'Civil Engineering' });
    const room = await db.collection('rooms').findOne({});

    console.log(`Ammar ID: ${ammar._id}, Section: ${ammar.assignedSection}`);
    console.log(`Kamran ID: ${kamran._id}, Section: ${kamran.assignedSection}`);

    // 2. Clear all slots
    await db.collection('timetableslots').deleteMany({});

    // 3. Create a slot for Ammar (Sec A)
    // Mon P1, Faculty: Kamran (Teaching), Room: room
    const ammarSlot = {
        dept_id: dept._id,
        section: 'A',
        academic_year: 3,
        semester: 5,
        day: 'Mon',
        period: 1,
        subject_id: subject._id,
        faculty_ids: [kamran._id],
        room_id: room._id,
        regulation_year: 2023,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    await db.collection('timetableslots').insertOne(ammarSlot);
    console.log('Inserted slot for Ammar (Sec A) with Kamran as Faculty.');

    // 4. Check Availability for Mon P1
    const occupiedFaculty = await db.collection('timetableslots').distinct('faculty_ids', { day: 'Mon', period: 1 });
    const isKamranOccupied = occupiedFaculty.some(id => id.toString() === kamran._id.toString());
    console.log(`Is Kamran Occupied at Mon P1? ${isKamranOccupied}`);

    const occupiedRooms = await db.collection('timetableslots').distinct('room_id', { day: 'Mon', period: 1 });
    const isRoomOccupied = occupiedRooms.some(id => id.toString() === room._id.toString());
    console.log(`Is Room ${room.name} Occupied at Mon P1? ${isRoomOccupied}`);

    process.exit();
}

verifyConflicts();
