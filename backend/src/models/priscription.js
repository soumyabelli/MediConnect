const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Patient" if you have a separate Patient model
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    diagnosis: {
      type: String,
      required: true,
      trim: true,
    },

    symptoms: {
      type: String,
      trim: true,
    },

    medicines: [
      {
        medicineName: {
          type: String,
          required: true,
        },
        dosage: {
          type: String, // e.g. 500mg
          required: true,
        },
        frequency: {
          type: String, // Morning & Night
          required: true,
        },
        duration: {
          type: String, // 5 days
          required: true,
        },
        instructions: {
          type: String, // After food
        },
      },
    ],

    tests: [
      {
        type: String,
      },
    ],

    advice: {
      type: String,
      trim: true,
    },

    followUpDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);