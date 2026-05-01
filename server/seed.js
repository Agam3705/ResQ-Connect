require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const SOS = require('./models/SOS');
const Resource = require('./models/Resource');
const Hazard = require('./models/Hazard');
const HelpOffer = require('./models/HelpOffer');
const Rumor = require('./models/Rumor');
const Notification = require('./models/Notification');
const Disaster = require('./models/Disaster');
const { Donation, Camp } = require('./models/Donation');
const MedicineRequest = require('./models/MedicineRequest');
const Transport = require('./models/Transport');
const ResourceRequest = require('./models/ResourceRequest');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash('admin', salt);
  const civilianPass = await bcrypt.hash('test123', salt);

  // ======= 1. USERS =======
  // Upsert Admin
  const admin = await User.findOneAndUpdate(
    { email: 'admin@resq.in' },
    {
      name: 'Admin Commander', email: 'admin@resq.in', password: hashedPass,
      role: 'admin', isActive: true, authProvider: 'local',
      phone: '+91-9999900000', address: 'HQ Delhi'
    },
    { upsert: true, new: true }
  );
  console.log('👤 Admin:', admin.email);

  // Upsert Agency 1
  const agency1 = await User.findOneAndUpdate(
    { email: 'rescue@ndrf.in' },
    {
      name: 'NDRF Alpha Unit', email: 'rescue@ndrf.in', password: civilianPass,
      role: 'agency', isActive: true, authProvider: 'local',
      agencyDetails: {
        agencyName: 'NDRF Alpha Unit', type: 'ngo', commanderName: 'Capt. Sharma',
        licenseNumber: 'NDRF-2026-001', address: 'Delhi HQ', phone: '+91-11-26701700',
        services: ['rescue', 'medical-aid', 'search-and-rescue', 'shelter'],
        operatingHours: '24/7', status: 'approved'
      },
      lastLocation: { lat: 28.6139, lng: 77.2090, updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );
  console.log('🏢 Agency1:', agency1.email);

  // Upsert Agency 2
  const agency2 = await User.findOneAndUpdate(
    { email: 'ops@redcross.org' },
    {
      name: 'Red Cross Delhi', email: 'ops@redcross.org', password: civilianPass,
      role: 'agency', isActive: true, authProvider: 'local',
      agencyDetails: {
        agencyName: 'Red Cross Delhi Chapter', type: 'medical', commanderName: 'Dr. Meera Patel',
        licenseNumber: 'RC-DEL-0042', address: '1 Red Cross Rd, Delhi', phone: '+91-11-23711551',
        services: ['medical-aid', 'food-supply', 'shelter', 'counseling'],
        operatingHours: '24/7', status: 'approved'
      },
      lastLocation: { lat: 28.6280, lng: 77.2185, updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );
  console.log('🏢 Agency2:', agency2.email);

  // Pending Agency
  const agency3 = await User.findOneAndUpdate(
    { email: 'volunteer@helpindia.org' },
    {
      name: 'Help India Foundation', email: 'volunteer@helpindia.org', password: civilianPass,
      role: 'agency', isActive: true, authProvider: 'local',
      agencyDetails: {
        agencyName: 'Help India Foundation', type: 'ngo', commanderName: 'Rahul Verma',
        licenseNumber: 'HIF-2026-99', address: 'Mumbai', phone: '+91-22-12345678',
        services: ['food-supply', 'transport', 'shelter'],
        status: 'pending'
      }
    },
    { upsert: true, new: true }
  );
  console.log('🏢 Agency3 (pending):', agency3.email);

  // Civilians
  const civ1 = await User.findOneAndUpdate(
    { email: 'rahul@test.com' },
    {
      name: 'Rahul Kumar', email: 'rahul@test.com', password: civilianPass,
      role: 'civilian', isActive: true, authProvider: 'local',
      phone: '+91-9876543210',
      civilianDetails: { bloodGroup: 'O+', emergencyContact: '+91-9876543211' },
      lastLocation: { lat: 28.6448, lng: 77.2167, updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );

  const civ2 = await User.findOneAndUpdate(
    { email: 'priya@test.com' },
    {
      name: 'Priya Singh', email: 'priya@test.com', password: civilianPass,
      role: 'civilian', isActive: true, authProvider: 'local',
      phone: '+91-8765432109',
      civilianDetails: { bloodGroup: 'A+', emergencyContact: '+91-8765432100' },
      lastLocation: { lat: 28.5355, lng: 77.3910, updatedAt: new Date() }
    },
    { upsert: true, new: true }
  );
  console.log('👤 Civilians: rahul@test.com, priya@test.com (pass: test123)');

  // ======= 2. ACTIVE SOS ALERTS =======
  await SOS.deleteMany({ status: 'active' }); // clear old active
  const sosAlerts = await SOS.insertMany([
    {
      userId: civ1._id, userName: 'Rahul Kumar',
      location: { lat: 28.6448, lng: 77.2167 },
      type: 'medical', priority: 'high', details: 'Severe chest pain, need ambulance',
      peopleCount: { infants: false, elderly: true, count: 2 },
      status: 'active'
    },
    {
      userId: civ2._id, userName: 'Priya Singh',
      location: { lat: 28.5355, lng: 77.3910 },
      type: 'flood', priority: 'high', details: 'Water rising in ground floor, 3 people trapped',
      peopleCount: { infants: true, elderly: false, count: 3 },
      status: 'active'
    },
    {
      userId: civ1._id, userName: 'Rahul Kumar',
      location: { lat: 28.7041, lng: 77.1025 },
      type: 'fire', priority: 'high', details: 'Kitchen fire spreading to next room',
      status: 'active'
    }
  ]);
  console.log(`🚨 ${sosAlerts.length} SOS alerts created`);

  // ======= 3. DISASTERS =======
  await Disaster.deleteMany({});
  const disasters = await Disaster.insertMany([
    {
      name: 'Delhi Floods 2026', type: 'flood', severity: 'critical',
      location: { name: 'East Delhi', lat: 28.6280, lng: 77.2950, radius: 15 },
      status: 'active', description: 'Yamuna river overflow affecting low-lying areas',
      stats: { affectedPeople: 15000, rescued: 3200, missing: 45, sheltered: 8000 },
      createdBy: admin._id
    },
    {
      name: 'Rajasthan Heatwave', type: 'drought', severity: 'high',
      location: { name: 'Jaipur District', lat: 26.9124, lng: 75.7873, radius: 50 },
      status: 'active', description: 'Temperatures exceeding 48°C',
      stats: { affectedPeople: 50000, rescued: 0, missing: 0, sheltered: 5000 },
      createdBy: admin._id
    }
  ]);
  console.log(`🌊 ${disasters.length} disasters created`);

  // ======= 4. RESOURCES (Agency Inventory) =======
  await Resource.deleteMany({});
  await Resource.insertMany([
    { name: 'Water Bottles', category: 'water', quantity: 500, location: 'Warehouse A', agencyId: agency1._id, status: 'stored' },
    { name: 'First Aid Kits', category: 'medical', quantity: 80, location: 'Warehouse A', agencyId: agency1._id, status: 'stored' },
    { name: 'Rescue Boats', category: 'equipment', quantity: 12, location: 'Staging Area', agencyId: agency1._id, status: 'stored' },
    { name: 'Tents (4-person)', category: 'shelter', quantity: 200, location: 'Warehouse B', agencyId: agency1._id, status: 'stored' },
    { name: 'Rice Packets (5kg)', category: 'food', quantity: 1000, location: 'Relief Center', agencyId: agency2._id, status: 'stored' },
    { name: 'Blankets', category: 'clothing', quantity: 350, location: 'Relief Center', agencyId: agency2._id, status: 'stored' },
    { name: 'Oxygen Cylinders', category: 'medical', quantity: 25, location: 'Medical Van', agencyId: agency2._id, status: 'stored' },
    { name: 'Stretchers', category: 'equipment', quantity: 15, location: 'Medical Van', agencyId: agency2._id, status: 'stored' },
  ]);
  console.log('📦 8 resources seeded');

  // ======= 5. RESOURCE EXCHANGE =======
  await ResourceRequest.deleteMany({});
  await ResourceRequest.insertMany([
    {
      fromAgency: agency1._id, fromAgencyName: 'NDRF Alpha Unit',
      type: 'request', urgency: 'critical', status: 'open',
      items: [{ name: 'Oxygen Cylinders', quantity: 20, category: 'medical', unit: 'units' }],
      message: 'Urgently need oxygen for flood survivors in East Delhi'
    },
    {
      fromAgency: agency2._id, fromAgencyName: 'Red Cross Delhi',
      type: 'surplus', urgency: 'normal', status: 'open',
      items: [
        { name: 'Blankets', quantity: 100, category: 'clothing', unit: 'pieces' },
        { name: 'Rice Packets', quantity: 200, category: 'food', unit: 'packs' }
      ],
      message: 'Extra stock after last distribution round'
    }
  ]);
  console.log('🔄 2 resource exchange posts created');

  // ======= 6. HAZARDS =======
  await Hazard.deleteMany({});
  await Hazard.insertMany([
    { userId: civ1._id, name: 'Rahul Kumar', type: 'flood', description: 'Road submerged near ITO Bridge', location: { lat: 28.6274, lng: 77.2428 }, severity: 'high' },
    { userId: civ2._id, name: 'Priya Singh', type: 'structural', description: 'Building wall cracking near Lajpat Nagar', location: { lat: 28.5699, lng: 77.2435 }, severity: 'medium' },
  ]);
  console.log('⚠️ 2 hazards seeded');

  // ======= 7. HELP OFFERS =======
  await HelpOffer.deleteMany({});
  await HelpOffer.insertMany([
    { userId: civ1._id, name: 'Rahul Kumar', type: 'volunteer', details: 'Can help with rescue operations. Have a boat.', contact: '+91-9876543210' },
    { userId: civ2._id, name: 'Priya Singh', type: 'donation', details: 'Can provide 50 blankets and water bottles from my shop', contact: '+91-8765432109' },
  ]);
  console.log('🤝 2 help offers seeded');

  // ======= 8. RUMORS =======
  await Rumor.deleteMany({});
  await Rumor.insertMany([
    { title: 'Dam burst in North Delhi', description: 'Unverified reports of Wazirabad Barrage breach.', adminStatus: 'pending', votesTrue: 12, votesFalse: 45 },
    { title: 'Free food at India Gate', description: 'Army distributing rations at India Gate from 5 PM.', adminStatus: 'verified', votesTrue: 89, votesFalse: 3 },
    { title: 'Toxic gas leak near Okhla', description: 'Chemical plant leak reported by locals.', adminStatus: 'pending', votesTrue: 34, votesFalse: 12 },
  ]);
  console.log('📢 3 rumors seeded');

  // ======= 9. MEDICINE REQUESTS =======
  await MedicineRequest.deleteMany({});
  await MedicineRequest.insertMany([
    { userId: civ1._id, userName: 'Rahul Kumar', type: 'request', medicineName: 'Insulin', category: 'insulin', quantity: '3 vials', urgency: 'critical', description: 'Diabetic patient, insulin supply ran out during floods', location: { area: 'East Delhi' }, contact: '+91-9876543210', status: 'active' },
    { userId: civ2._id, userName: 'Priya Singh', type: 'offer', medicineName: 'Paracetamol 500mg', category: 'painkillers', quantity: '20 tablets', urgency: 'normal', description: 'Have extra tablets at home', location: { area: 'Lajpat Nagar' }, contact: '+91-8765432109', status: 'active' },
  ]);
  console.log('💊 2 medicine exchange posts created');

  // ======= 10. TRANSPORT =======
  await Transport.deleteMany({});
  await Transport.insertMany([
    {
      driverId: civ1._id, driverName: 'Rahul Kumar', driverContact: '+91-9876543210',
      vehicleType: 'car', capacity: 4, route: 'East Delhi → Connaught Place',
      currentLocation: { address: 'Mayur Vihar' }, destination: { address: 'CP' },
      status: 'available', notes: 'Returning from relief camp, happy to take passengers'
    },
  ]);
  console.log('🚗 1 transport flagged');

  // ======= 11. NOTIFICATIONS =======
  await Notification.deleteMany({});
  await Notification.insertMany([
    { userId: civ1._id, title: '🚨 SOS Alert Active', message: 'Your emergency alert has been broadcast to nearby agencies.', type: 'alert' },
    { userId: civ1._id, title: '🏥 Help Assigned', message: 'NDRF Alpha Unit is responding to your SOS.', type: 'success' },
    { userId: agency1._id, title: '🚨 New SOS Alert', message: 'Rahul Kumar needs medical help. Priority: high', type: 'alert' },
    { userId: agency1._id, title: '🚨 New SOS Alert', message: 'Priya Singh needs flood rescue. Priority: high', type: 'alert' },
    { userId: admin._id, title: '📋 Agency Pending', message: 'Help India Foundation has applied for agency access.', type: 'info' },
  ]);
  console.log('🔔 5 notifications created');

  // ======= DONE =======
  console.log('\n==============================');
  console.log('✅ SEED COMPLETE!');
  console.log('==============================');
  console.log('\nTest Accounts:');
  console.log('  Admin:    admin@resq.in      / admin');
  console.log('  Agency1:  rescue@ndrf.in     / test123');
  console.log('  Agency2:  ops@redcross.org   / test123');
  console.log('  Agency3:  volunteer@helpindia.org / test123 (PENDING approval)');
  console.log('  Civilian: rahul@test.com     / test123');
  console.log('  Civilian: priya@test.com     / test123');
  console.log('==============================\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
