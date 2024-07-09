import mongoose, { Schema, Document, Model } from 'mongoose';

export interface AgendamentoDocument extends Document {
    hemocentroId: mongoose.Types.ObjectId
    nomeCompleto: string
    dataNascimento: string
    dataAgendamento: string
    horario: string
    statusDoacao: string
    impedimento: string
    diasImpedidos: number
    email: string
}

const AgendamentoSchema: Schema = new Schema({
    _id: {
        type: mongoose.Types.ObjectId,
        auto: true,
    },
    hemocentroId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    nomeCompleto: {
        type: String,
        maxLength: 250
    },
    dataNascimento:{
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/,
    },
    email: {
        type: String,
        required: true,
        maxLength: 100
    },
    dataAgendamento: {
        type: String,
        required: true,
        match: /^\d{4}-\d{2}-\d{2}$/,
    },
    horario: {
        type: String,
        required: true,
        maxLength: 100,
        match: /^(?:[01]\d|2[0-3]):(?:[0-5]\d)$/,
    },
    statusDoacao: {
        type: String,
        required: true,
        enum: ['liberado', 'bloqueado', 'concluida', 'cancelada'],
    },
    impedimento: {
        type: String,
        required: true,
        enum: ['temporario', 'definitivo', 'nenhum'],
    },
    diasImpedidos: {
        type: Number,
        required: true
    }
});

const AgendamentoModel: Model<AgendamentoDocument> = mongoose.model<AgendamentoDocument>('Agendamento', AgendamentoSchema);

export default AgendamentoModel;