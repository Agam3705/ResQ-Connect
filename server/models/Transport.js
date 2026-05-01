const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverName: String,
  driverContact: String,
  vehicleType: { type: String, enum: ['car', 'van', 'truck', 'bus', 'ambulance', 'boat', 'other'], required: true },
  capacity: { type: Number, default: 4 }, // number of people
  currentLocation: { lat: Number, lng: Number, address: String },
  destination: { lat: Number, lng: Number, address: String },
  route: String, // description of route
  pickupPoints: [{ address: String, order: Number }], // intermediate points
  availableFrom: { type: Date, default: Date.now },
  estimatedArrival: Date,
  status: { type: String, enum: ['available', 'assigned', 'in-transit', 'completed'], default: 'available' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // civilian who requested
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transport', transportSchema);
