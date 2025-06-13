const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User'); 

const axios = require('axios'); // Se não estiver usando fetchFromTMDB compartilhado
const TMDB_API_KEY_V3 = process.env.TMDB_API_KEY_V3;
const TMDB_BASE_URL_V3 = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'



// Função auxiliar para buscar detalhes de um filme do TMDB (simplificada)
async function getMovieDetailsFromTMDB(apiMovieId) {
    if (!TMDB_API_KEY_V3) throw new Error("Chave TMDB não configurada.");
    try {
        const { data } = await axios.get(`${TMDB_BASE_URL_V3}/movie/${apiMovieId}`, {
            params: { api_key: TMDB_API_KEY_V3, language: 'pt-BR' }
        });
        // Formatação básica (adapte da sua formatMovieData em movieRoutes)
        return {
            apiMovieId: data.id?.toString(),
            title: data.title,
            posterPath: data.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${data.poster_path}` : null,
            year: data.release_date ? data.release_date.substring(0, 4) : null,
            rating: data.vote_average,
            overview: data.overview,
            genres: data.genres ? data.genres.map(g => g.name) : [],
        };
    } catch (error) {
        console.error(`Erro ao buscar detalhes do filme ${apiMovieId} do TMDB:`, error.message);
        return null; // Retorna null se o filme não for encontrado ou houver erro
    }
}


// Rota para buscar o perfil do usuário logado
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user é populado pelo authMiddleware
        // Retorna o usuário (sem a senha, já que o middleware pode ter feito .select('-password'))
        res.json(req.user);
    } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error.message);
        res.status(500).json({ message: "Erro ao buscar perfil do usuário." });
    }
});

// Rota para atualizar o perfil do usuário logado
router.patch('/me', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'favoriteGenres']; // Defina o que pode ser atualizado
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Atualização inválida! Campos não permitidos.' });
    }

    try {
        const user = req.user; // Usuário do authMiddleware

        // Se o email está sendo atualizado, verifique se já não existe para outro usuário
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser && !existingUser._id.equals(user._id)) {
                return res.status(400).json({ message: 'Este e-mail já está em uso por outra conta.' });
            }
        }

        updates.forEach(update => user[update] = req.body[update]);
        await user.save();
        res.json(user); // Retorna o usuário atualizado (sem a senha)
    } catch (error) {
        console.error("Erro ao atualizar perfil:", error.message);
        if (error.code === 11000) { // Erro de duplicidade do MongoDB (para email unique)
             return res.status(400).json({ message: 'Este e-mail já está em uso.' });
        }
        res.status(400).json({ message: 'Erro ao atualizar perfil.', error: error.message });
    }
});


// Rota para atualizar a senha do usuário logado
router.put('/me/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Senha atual e nova senha são obrigatórias." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
        }

        const user = req.user;
        const isMatch = await user.comparePassword(currentPassword); // Se você implementou comparePassword

        if (!isMatch) {
            return res.status(400).json({ message: "Senha atual incorreta." });
        }

        user.password = newPassword; // O hook pre-save no User model vai hashear
        await user.save();
        res.json({ message: "Senha atualizada com sucesso." });

    } catch (error) {
        console.error("Erro ao atualizar senha:", error.message);
        res.status(500).json({ message: "Erro ao atualizar senha." });
    }
});


// Rota para atualizar gêneros favoritos
router.put('/me/genres', authMiddleware, async (req, res) => {
    try {
    const { favoriteGenres } = req.body;
    if (!Array.isArray(favoriteGenres)) {
    return res.status(400).json({ message: "Gêneros favoritos devem ser um array."});
    }
    req.user.favoriteGenres = favoriteGenres;
    await req.user.save();
    res.json(req.user);
    } catch (error) {
    console.error("Erro ao atualizar gêneros favoritos:", error.message);
    res.status(500).json({ message: "Erro ao atualizar gêneros favoritos." });
    }
});


router.get('/me/favorite-movies', authMiddleware, async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        if (!user.favoriteMovies || user.favoriteMovies.length === 0) {
            return res.json([]); // Retorna array vazio se não houver favoritos
        }

        // Buscar detalhes de cada filme favorito na API TMDB
        // Promise.all para fazer as chamadas em paralelo
        const favoriteMovieDetails = await Promise.all(
            user.favoriteMovies.map(movieId => getMovieDetailsFromTMDB(movieId))
        );

        // Filtra quaisquer resultados nulos (caso um filme não seja encontrado no TMDB)
        const validFavoriteMovies = favoriteMovieDetails.filter(movie => movie !== null);

        res.json(validFavoriteMovies);

    } catch (error) {
        console.error("Erro ao buscar filmes favoritos:", error);
        res.status(500).json({ message: "Erro ao buscar filmes favoritos.", error: error.message });
    }
});

// ROTA: Adicionar um filme aos favoritos do usuário logado
router.post('/me/favorite-movies', authMiddleware, async (req, res) => {
    try {
        const { apiMovieId } = req.body; // Espera o ID do filme (TMDB ID como string)
        if (!apiMovieId) {
            return res.status(400).json({ message: 'ID do filme é obrigatório.' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Adiciona apenas se já não estiver na lista para evitar duplicatas
        if (!user.favoriteMovies.includes(apiMovieId.toString())) {
            user.favoriteMovies.push(apiMovieId.toString());
            await user.save();
            console.log(`Filme ${apiMovieId} adicionado aos favoritos do usuário ${user._id}`);
        } else {
            console.log(`Filme ${apiMovieId} já estava nos favoritos do usuário ${user._id}`);
        }
        // Retorna a lista atualizada de IDs de favoritos
        res.status(200).json({ message: 'Filme adicionado aos favoritos.', favoriteMovies: user.favoriteMovies });
    } catch (error) {
        console.error("Erro ao adicionar aos favoritos:", error);
        res.status(500).json({ message: 'Erro ao adicionar filme aos favoritos.' });
    }
});

// ROTA: Remover um filme dos favoritos do usuário logado
router.delete('/me/favorite-movies/:movieId', authMiddleware, async (req, res) => {
    try {
        const { movieId } = req.params; // Pega o ID do filme da URL
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Remove o filme da lista
        user.favoriteMovies = user.favoriteMovies.filter(id => id !== movieId.toString());
        await user.save();
        console.log(`Filme ${movieId} removido dos favoritos do usuário ${user._id}`);

        res.status(200).json({ message: 'Filme removido dos favoritos.', favoriteMovies: user.favoriteMovies });
    } catch (error) {
        console.error("Erro ao remover dos favoritos:", error);
        res.status(500).json({ message: 'Erro ao remover filme dos favoritos.' });
    }
});

module.exports = router;