import FeeTransaction from '../models/FeeTransaction.js';
import FeeStructure from '../models/FeeStructure.js';
import FeeWaiver from '../models/FeeWaiver.js';
import mongoose from 'mongoose';

export const getStudentOutstanding = async (studentId: string) => {
  // 1. Get all assigned fee structures for the student
  // In a real system, we'd have a mapping of students to fee_structures
  // For now, let's assume all structures for their dept/year apply
  const structures = await FeeStructure.find(); // Placeholder: Filter by student dept/year
  
  const results = await Promise.all(structures.map(async (struct) => {
    // 2. Sum captured transactions
    const transactions = await FeeTransaction.aggregate([
      { $match: { 
          student: new mongoose.Types.ObjectId(studentId), 
          feeStructure: struct._id,
          status: 'captured'
      } },
      { $group: { _id: null, totalPaid: { $sum: "$amountPaid" } } }
    ]);
    
    // 3. Sum waivers
    const waivers = await FeeWaiver.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId), feeStructure: struct._id } },
      { $group: { _id: null, totalWaived: { $sum: "$waiverAmount" } } }
    ]);

    const totalPaid = transactions[0]?.totalPaid || 0;
    const totalWaived = waivers[0]?.totalWaived || 0;
    const outstanding = struct.amount - totalPaid - totalWaived;

    return {
      feeStructure: struct,
      totalDue: struct.amount,
      totalPaid,
      totalWaived,
      outstanding,
      isDefaulter: outstanding > 0 && new Date(struct.dueDate) < new Date()
    };
  }));

  return results;
};

export const getCollectionStats = async (from?: Date, to?: Date) => {
  const query: any = { status: 'captured' };
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = from;
    if (to) query.createdAt.$lte = to;
  }

  const transactions = await FeeTransaction.aggregate([
    { $match: query },
    { $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        totalCollected: { $sum: "$amountPaid" },
        count: { $sum: 1 }
    }},
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const totalDue = await FeeStructure.aggregate([
    { $group: { _id: null, totalDue: { $sum: "$amount" } } }
  ]);

  const totalCollected = transactions.reduce((acc, curr) => acc + curr.totalCollected, 0);
  const dueAmount = totalDue[0]?.totalDue || 0;

  return {
    monthlyTrends: transactions,
    totalCollected,
    totalDue: dueAmount,
    collectionRate: dueAmount > 0 ? (totalCollected / dueAmount) * 100 : 0,
    defaulterCount: 0 // In a real system, we'd query students with outstanding > 0
  };
};
