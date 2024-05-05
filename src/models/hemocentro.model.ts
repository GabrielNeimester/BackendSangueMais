import mongoose, { Schema, Document, Model } from 'mongoose';

export interface HemocentroDocument extends Document {
  cnpj: string
  nome: string
  estado: string
  cidade: string
  bairro: string
  telefone: string
  email: string
  ativo: boolean
}

const HemocentroSchema: Schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
},
  cnpj: {
    type: String,
    required: true,
    maxLength: 14
  },
  nome: {
    type: String,
    required: true,
    maxLength: 100
  },
  estado: {
    type: String,
    required: true,
    maxLength: 2
  },
  cidade: {
    type: String,
    required: true,
    maxLength: 100
  },
  bairro: {
    type: String,
    required: true,
    maxLength: 100
  },
  telefone: {
    type: String,
    required: true,
    maxLength: 10
  },
  email: {
    type: String,
    required: true,
    maxLength: 100
  },
  ativo: {
    type: Boolean,
    required: true
  }
});

const HemocentroModel: Model<HemocentroDocument> = mongoose.model<HemocentroDocument>('Hemocentro', HemocentroSchema);

export default HemocentroModel;