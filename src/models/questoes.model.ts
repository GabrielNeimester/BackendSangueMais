import mongoose, { Schema, Document, Model } from 'mongoose';

export interface QuestoesDocument extends Document {
  descricao:string
  hemocentroId:mongoose.Types.ObjectId
}

const QuestoesSchema: Schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
},
  descricao: {
    type: String,
    required: true,
    maxLength: 250
  },
  hemocentroId: {
    type: mongoose.Types.ObjectId,
    required: true
  }

});

const QuestoesModel: Model<QuestoesDocument> = mongoose.model<QuestoesDocument>('Questoes', QuestoesSchema);

export default QuestoesModel;