import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  nome: string
  nivelAcesso: string
  senha: string
  hemocentroId: mongoose.Types.ObjectId
}

const UserSchema: Schema = new Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    auto: true,
},
  nome: {
    type: String,
    required: true,
    maxLength: 100
  },
  nivelAcesso: {
    type: String,
    required: true,
    maxLength: 10
  },
  senha: {
    type: String,
    required: true,
    maxLength: 100
  },
  hemocentroId: {
    type: mongoose.Types.ObjectId,
    auto: true,
  }
});

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;