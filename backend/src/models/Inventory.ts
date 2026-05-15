import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  assetId: string;
  name: string;
  category: string;
  status: 'Available' | 'In Use' | 'Maintenance' | 'Retired' | 'Repair Pending';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  health: number; // 0-100
  location: string;
  assignedTo?: mongoose.Types.ObjectId;
  assignedToName?: string;
  purchaseDate?: Date;
  lastService?: Date;
  maintenanceLog: {
    date: Date;
    action: string;
    performedBy: string;
  }[];
}

const inventorySchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'In Use', 'Maintenance', 'Retired', 'Repair Pending'], 
    default: 'Available' 
  },
  condition: { 
    type: String, 
    enum: ['Excellent', 'Good', 'Fair', 'Poor'], 
    default: 'Good' 
  },
  health: { type: Number, default: 100 },
  location: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedToName: { type: String },
  purchaseDate: { type: Date },
  lastService: { type: Date },
  maintenanceLog: [{
    date: { type: Date, default: Date.now },
    action: { type: String },
    performedBy: { type: String }
  }]
}, { timestamps: true });

export default mongoose.model<IInventory>('Inventory', inventorySchema);
