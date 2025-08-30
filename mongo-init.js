// MongoDB initialization script
db = db.getSiblingDB('notes_app');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'provider'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        name: {
          bsonType: 'string',
          maxLength: 100
        },
        provider: {
          enum: ['email', 'google']
        },
        googleId: {
          bsonType: 'string'
        }
      }
    }
  }
});

db.createCollection('notes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'title'],
      properties: {
        userId: {
          bsonType: 'objectId'
        },
        title: {
          bsonType: 'string',
          maxLength: 100
        },
        body: {
          bsonType: 'string',
          maxLength: 5000
        }
      }
    }
  }
});

db.createCollection('otps', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'codeHash', 'expiresAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        codeHash: {
          bsonType: 'string'
        },
        expiresAt: {
          bsonType: 'date'
        },
        attempts: {
          bsonType: 'int',
          minimum: 0,
          maximum: 5
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "provider": 1, "googleId": 1 }, { sparse: true });
db.notes.createIndex({ "userId": 1, "createdAt": -1 });
db.otps.createIndex({ "email": 1, "createdAt": -1 });
db.otps.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

print('✅ MongoDB database initialized successfully');
print('📊 Collections created: users, notes, otps');
print('🔍 Indexes created for optimal performance');
