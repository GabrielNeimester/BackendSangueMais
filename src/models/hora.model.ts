import mongoose, { Schema, Document, Model } from 'mongoose';

export interface HoraDocument extends Document {
  horario: string
  dataId: mongoose.Types.ObjectId
}

const HoraSchema: Schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
},
  horario: {
    type: String,
    required: true,
    maxLength: 5
  },
  dataId: {
    type: mongoose.Types.ObjectId,
    required: true,
  }
});

const HoraModel: Model<HoraDocument> = mongoose.model<HoraDocument>('Hora', HoraSchema);

export default HoraModel;