import mongoose from "mongoose";
const Schema = mongoose.Schema

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    data:{
        type: Date,
        default: Date.now(),
        required: true
    }
})

export default mongoose.model('postagens', Postagem)
