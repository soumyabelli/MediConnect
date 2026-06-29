const mongoose = require('mongoose')

const { Schema } = mongoose

const recordSchema = new Schema(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
      index: true,
    },
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
    recordDate: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
    },
    prescription: {
      type: String,
      required: true,
      trim: true,
    },
    prescriptionDetails: {
      diagnosis: {
        type: String,
        trim: true,
        default: '',
      },
      medicines: {
        type: [
          {
            name: { type: String, trim: true, default: '' },
            dosage: { type: String, trim: true, default: '' },
            duration: { type: String, trim: true, default: '' },
            instructions: { type: String, trim: true, default: '' },
          },
        ],
        default: [],
      },
      notes: {
        type: String,
        trim: true,
        default: '',
      },
      followUpDate: {
        type: Date,
        default: null,
      },
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

recordSchema.index({ patient: 1, recordDate: -1 })

module.exports = mongoose.model('Record', recordSchema)
