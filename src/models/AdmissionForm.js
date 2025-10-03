
import mongoose from "mongoose";

const AdmmissionSchema = new mongoose.Schema({


  first_name:{type:String , required:true},
  last_name: {type:String},
  contact_no : {type:Number , required:true},
  email: { type: String, required: true },
  message:{tyep:String }


}, { timestamps: true });

const Admmission= mongoose.model("Admission", AdmmissionSchema);
export default Admmission;
