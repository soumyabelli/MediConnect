const mongoose = require('mongoose')

const { Schema } = mongoose

const appointmentSchema = new Schema(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeLabel: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Accepted', 'In Consultation', 'Completed', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    mode: {
      type: String,
      default: 'Online',
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeLabel: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Pending', 'Confirmed', 'Accepted', 'In Consultation', 'Completed'] },
    },
  },
)
appointmentSchema.index({ patient: 1, appointmentDate: -1 })

module.exports = mongoose.model('Appointment', appointmentSchema)
