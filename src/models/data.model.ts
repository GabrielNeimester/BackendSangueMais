import mongoose, { Schema, Document, Model } from 'mongoose';

export interface DataAgendDocument extends Document {
    data: Date
    hemocentroId: mongoose.Types.ObjectId
}

const DataAgendSchema: Schema = new Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        auto: true,
    },
    data: {
        type: Date,
        required: true,
        unique: true
    },
    hemocentroId: {
        type: mongoose.Types.ObjectId,
        required: true,
    }
});

const DataAgendModel: Model<DataAgendDocument> = mongoose.model<DataAgendDocument>('DataAgend', DataAgendSchema);

export default DataAgendModel;
