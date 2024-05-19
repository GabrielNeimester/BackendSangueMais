import mongoose, { Schema, Document, Model } from 'mongoose';

export interface TokenDocument extends Document {
  token:string
  refreshToken: string
  expiracao:Date
  userId: mongoose.Types.ObjectId
}

const TokenSchema: Schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true
},
  token: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiracao: {
    type: Date,
    required: true
  },
  userId: {
    type: mongoose.Types.ObjectId,
    auto: true,
  }
});

const TokenModel: Model<TokenDocument> = mongoose.model<TokenDocument>('Token', TokenSchema);

export default TokenModel;