const mongoose = require('mongoose');
const { Schema } = mongoose;

const partyMemberSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    selectedGenres: { 
        type: [String],
        default: [] 
    }
}, { _id: false }); 

// Sub-schema para os likes nos filmes dentro da party
const movieLikeSchema = new Schema({
    movieId: { 
        type: String, 
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, { _id: false }); 

// Schema principal da Party
const partySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'O título da festa é obrigatório.'], 
        trim: true 
    },

    shortCode: {
        type: String,
        required: [true, 'O código curto da party é obrigatório.'],
        unique: true,    // Garante unicidade no nível do banco de dados
        index: true,     // Bom para performance ao buscar parties por este código
        uppercase: true, // Opcional: Salva sempre em maiúsculas para facilitar buscas case-insensitive
        minlength: 6,    // Opcional: Validação de tamanho mínimo
        maxlength: 6     // Opcional: Validação de tamanho máximo
    },

    hostId: { // O usuário que criou a party
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hostGenres: { // Gêneros sugeridos pelo host ao criar a party
        type: [String],
        default: []
    },
    members: [partyMemberSchema], // Array de membros da party
    movies: [{ 
        apiMovieId: { type: String, required: true }, // ID do filme de uma API externa (ex: TMDB)
        title: { type: String, trim: true },
        posterPath: { type: String, trim: true },
        
    }],
    likes: [movieLikeSchema] 
}, {
    timestamps: true // Adiciona automaticamente os campos createdAt e updatedAt
});

// Índices para otimizar consultas comuns
partySchema.index({ hostId: 1 }); // Para encontrar parties de um host específico
partySchema.index({ 'members.userId': 1 }); // Para encontrar parties onde um usuário é membro
partySchema.index({ 'movies.apiMovieId': 1 }); // Se você precisar buscar parties por um filme específico (menos comum)
partySchema.index({ 'likes.movieId': 1, 'likes.userId': 1 }); // Para verificar rapidamente se um usuário já deu like em um filme



module.exports = mongoose.model('Party', partySchema);