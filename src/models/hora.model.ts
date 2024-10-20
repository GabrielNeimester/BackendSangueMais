import mongoose, { Schema, Document, Model } from 'mongoose';

export interface HoraDocument extends Document {
  horario: string
  dataId: mongoose.Types.ObjectId
  quantidade: number
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
  quantidade: {
    type: Number,
    required: true
  },
  dataId: {
    type: mongoose.Types.ObjectId,
    required: true,
  }
});

const HoraModel: Model<HoraDocument> = mongoose.model<HoraDocument>('Hora', HoraSchema);

export default HoraModel;