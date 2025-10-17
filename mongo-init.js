// MongoDB initialization script
db = db.getSiblingDB('mediswift');

// Create collections
db.createCollection('users');
db.createCollection('healthcare_records');
db.createCollection('chat_messages');
db.createCollection('appointments');

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.healthcare_records.createIndex({ "patient_id": 1 });
db.chat_messages.createIndex({ "timestamp": 1 });
db.chat_messages.createIndex({ "user_id": 1 });
db.appointments.createIndex({ "patient_id": 1 });
db.appointments.createIndex({ "date": 1 });

print('MongoDB initialized successfully for MediSwift application');