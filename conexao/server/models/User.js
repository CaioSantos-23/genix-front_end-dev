const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Por favor, insira um email válido.']
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres.']
  },
  favoriteGenres: { // Gêneros numéricos (IDs do TMDB, por exemplo)
    type: [Number],
    default: []
  },
  // 👇 ADICIONE ESTE CAMPO 👇
  favoriteMovies: { // Array de IDs de filmes (string, correspondendo ao apiMovieId do TMDB)
    type: [String],
    default: []
  },
  photo: { // Se você for armazenar a URL da foto do perfil do usuário
    type: String,
    default: null // Ou um caminho para uma imagem padrão
  }
}, { timestamps: true });

// Hook para hashear a senha ANTES de salvar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar senhas para o login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);