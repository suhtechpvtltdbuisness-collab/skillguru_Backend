import mongoose from "mongoose";

const AdmissionSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String },
    contact_no: { type: Number, required: true },
    email: { type: String, required: true },
    message: { type: String },


    isProcessed: { type: Boolean, default: false },
    reachCount: { type: Number, default: 0 },


    references: [
      {
        note: { type: String, required: true },
        addedBy: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Admission = mongoose.model("Admission", AdmissionSchema);
export default Admission;
