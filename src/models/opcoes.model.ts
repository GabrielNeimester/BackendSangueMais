import mongoose, { Schema, Document, Model } from 'mongoose';

export interface OpcoesDocument extends Document {
  descricao: string
  questaoId: mongoose.Types.ObjectId
}

const OpcoesSchema: Schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
},
  descricao: {
    type: String,
    required: true,
    maxLength: 100
  },
  questaoId: {
    type: mongoose.Types.ObjectId,
    required: true,
  }
});

const OpcoesModel: Model<OpcoesDocument> = mongoose.model<OpcoesDocument>('Opcoes', OpcoesSchema);

export default OpcoesModel;