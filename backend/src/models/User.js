const mongoose = require('mongoose')

const { Schema } = mongoose

const userSchema = new Schema(
  {
    role: {
      type: String,
      enum: ['admin', 'doctor', 'patient'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
    },
    treats: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      trim: true,
      default: '',
    },
    fee: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      trim: true,
      default: 'Active',
    },
    age: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      trim: true,
      default: '',
    },
    condition: {
      type: String,
      trim: true,
      default: '',
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    assignedDoctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    lastVisitAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.index({ role: 1, createdAt: -1 })

module.exports = mongoose.model('User', userSchema)
