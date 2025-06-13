const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const axios = require('axios'); // Necessário para buscar detalhes do TMDB na rota de like

// Configuração do nanoid para shortCodes
const nanoidModule = require('nanoid');
const customAlphabet = nanoidModule.customAlphabet;
const NANOID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PARTY_CODE_LENGTH = 6;
const generatePartyCode = customAlphabet(NANOID_ALPHABET, PARTY_CODE_LENGTH);

// Função auxiliar para buscar detalhes do filme do TMDB (se não estiver em um helper compartilhado)
// Se você já tem essa lógica em movieRoutes.js, considere refatorar para um helper.
async function fetchMovieDetailsFromTMDB(apiMovieId) {
    try {
        const response = await axios.get(`https://api.themoviedb.org/3/movie/${apiMovieId}`, {
            params: {
                api_key: process.env.TMDB_API_KEY_V3,
                language: 'pt-BR',
                append_to_response: 'credits,videos' // Exemplo, ajuste conforme necessário
            }
        });
        // Simplificando: retornando apenas dados básicos. Adapte se precisar formatar como em movieRoutes.
        return {
            id: response.data.id,
            title: response.data.title,
            poster_path: response.data.poster_path,
            // Adicione outros campos que você quer salvar ao adicionar à party
        };
    } catch (error) {
        console.error(`Erro ao buscar detalhes do filme ${apiMovieId} do TMDB:`, error.message);
        // Retornar null ou lançar o erro, dependendo de como você quer tratar
        return null;
    }
}


router.use(authMiddleware);

router.post('/', async (req, res) => {
    const { title, hostGenres, initialMovieApiId } = req.body;
    const hostId = req.user.id;

    try {
        let shortCode;
        let existingPartyWithCode = true;
        let attempts = 0;
        const maxAttempts = 10;

        while (existingPartyWithCode && attempts < maxAttempts) {
            shortCode = generatePartyCode();
            existingPartyWithCode = await Party.findOne({ shortCode });
            attempts++;
        }

        if (existingPartyWithCode) {
            console.error('Falha ao gerar um shortCode único.');
            return res.status(500).json({ message: 'Erro interno ao criar a party (código único).' });
        }

        const newPartyData = {
            title,
            shortCode,
            hostId,
            hostGenres: hostGenres || [],
            members: [{ userId: hostId, selectedGenres: hostGenres || [] }],
            movies: [],
            likes: []
        };

        if (initialMovieApiId) {
            const movieDetails = await fetchMovieDetailsFromTMDB(initialMovieApiId);
            if (movieDetails) {
                newPartyData.movies.push({
                    apiMovieId: movieDetails.id.toString(),
                    title: movieDetails.title,
                    posterPath: movieDetails.poster_path
                });
            }
        }

        const party = new Party(newPartyData);
        await party.save();
        res.status(201).json(party);
    } catch (error) {
        console.error('Erro ao criar party:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.shortCode) {
            return res.status(500).json({ message: 'Erro ao criar party, tente novamente (colisão de código).' });
        }
        res.status(500).json({ message: 'Erro interno do servidor ao criar party.' });
    }
});

router.get('/code/:shortCode', async (req, res) => {
    try {
        const party = await Party.findOne({ shortCode: req.params.shortCode.toUpperCase() })
                                 .populate('hostId', 'name email photo')
                                 .populate('members.userId', 'name email photo');
        if (!party) {
            return res.status(404).json({ message: 'Party não encontrada com este código.' });
        }
        res.json(party);
    } catch (error) {
        console.error('Erro ao buscar party por shortCode:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

router.get('/', async (req, res) => {
    try {
        const parties = await Party.find()
            .populate('hostId', 'name email photo')
            .populate('members.userId', 'name email photo')
            .sort({ createdAt: -1 });
        res.json(parties);
    } catch (error) {
        console.error("Erro ao buscar festas:", error);
        res.status(500).json({ message: 'Erro ao buscar festas.' });
    }
});

router.get('/:partyId', async (req, res) => {
    try {
        const party = await Party.findById(req.params.partyId)
            .populate('hostId', 'name email photo')
            .populate('members.userId', 'name email photo');
        if (!party) {
            return res.status(404).json({ message: 'Festa não encontrada.' });
        }
        res.json(party);
    } catch (error) {
        console.error("Erro ao buscar detalhes da festa:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'ID da festa inválido.' });
        }
        res.status(500).json({ message: 'Erro ao buscar detalhes da festa.' });
    }
});

router.post('/code/:shortCodeParam/join', async (req, res) => {
    try {
        const partyShortCode = req.params.shortCodeParam.toUpperCase();
        const userId = req.user._id;
        const { userGenres } = req.body;

        console.log(`[Party Route Join] Code: ${partyShortCode}, User: ${userId}`);
        const party = await Party.findOne({ shortCode: partyShortCode });

        if (!party) {
            return res.status(404).json({ message: 'Festa não encontrada com este código.' });
        }

        const isAlreadyMember = party.members.some(member => member.userId.equals(userId));
        if (isAlreadyMember) {
            const populatedParty = await Party.findById(party._id)
                .populate('hostId', 'name email photo')
                .populate('members.userId', 'name email photo');
            return res.json(populatedParty);
        }

        const user = await User.findById(userId).select('favoriteGenres name photo'); // Pegar nome e foto também
        if (!user) {
             return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        party.members.push({ userId: userId, selectedGenres: userGenres || user.favoriteGenres || [] });
        await party.save();
        
        const updatedParty = await Party.findById(party._id)
            .populate('hostId', 'name email photo')
            .populate('members.userId', 'name email photo');

        // Emitir evento WebSocket para notificar que um usuário entrou na party
        const ioInstance = req.app.get('socketio');
        if (ioInstance) {
            console.log(`[Party Route Join] Emitindo 'userJoinedPartyRealtime' para sala ${party._id.toString()}`);
            ioInstance.to(party._id.toString()).emit('userJoinedPartyRealtime', {
                userId: user._id, // Ou user para enviar todos os dados populados
                userName: user.name,
                userPhoto: user.photo,
                party: updatedParty // Envia a party atualizada para todos na sala
            });
        }

        res.json(updatedParty);
    } catch (error) {
        console.error("[Party Route Join] Erro:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao tentar entrar na festa.' });
    }
});


router.post('/:partyId/leave', async (req, res) => {
    try {
        const partyId = req.params.partyId;
        const userId = req.user._id;
        const userName = req.user.name; // Supondo que 'name' está em req.user

        const party = await Party.findById(partyId);
        if (!party) {
            return res.status(404).json({ message: 'Festa não encontrada.' });
        }

        const memberIndex = party.members.findIndex(member => member.userId.equals(userId));
        if (memberIndex === -1) {
            return res.status(403).json({ message: 'Você não é membro desta festa.' });
        }

        party.members.splice(memberIndex, 1);
        let partyDeleted = false;

        if (party.hostId.equals(userId)) {
            if (party.members.length === 0) {
                await Party.findByIdAndDelete(partyId);
                partyDeleted = true;
            }
        }
        
        if (!partyDeleted) {
            await party.save();
        }

        // Emitir evento WebSocket para notificar que um usuário saiu
        const ioInstance = req.app.get('socketio');
        if (ioInstance) {
            const partyIdString = partyId.toString();
             console.log(`[Party Route Leave] Emitindo 'userLeftPartyRealtime' para sala ${partyIdString}`);
            // Se a party foi deletada, o segundo argumento pode ser apenas o ID do usuário
            // Se não, pode ser a party atualizada (se houver membros restantes)
            const eventData = partyDeleted ? 
                              { userId, partyId: partyIdString, partyDeleted: true, userName } : 
                              { userId, partyId: partyIdString, party: await Party.findById(partyId).populate('members.userId', 'name email photo'), userName };
            ioInstance.to(partyIdString).emit('userLeftPartyRealtime', eventData);
        }
        
        res.json({ message: partyDeleted ? 'Festa encerrada e deletada.' : 'Você saiu da festa com sucesso.' });
    } catch (error) {
        console.error("[Party Route Leave] Erro:", error);
        res.status(500).json({ message: 'Erro interno do servidor ao sair da festa.' });
    }
});

router.post('/:partyId/movies', async (req, res) => {
    try {
        const { apiMovieId, title, posterPath } = req.body;
        const partyId = req.params.partyId;

        if (!apiMovieId || !title) {
            return res.status(400).json({ message: 'ID do filme e título são obrigatórios.' });
        }
        const party = await Party.findById(partyId);
        if (!party) {
            return res.status(404).json({ message: 'Festa não encontrada.' });
        }
        if (!party.members.some(member => member.userId.equals(req.user._id))) {
            return res.status(403).json({ message: 'Você não é membro desta festa.' });
        }
        if (party.movies.some(movie => movie.apiMovieId.toString() === apiMovieId.toString())) {
            return res.status(400).json({ message: 'Este filme já foi adicionado à festa.' });
        }

        party.movies.push({ apiMovieId: apiMovieId.toString(), title, posterPath: posterPath || '' });
        await party.save();
        res.status(201).json(party);
    } catch (error) {
        console.error("Erro ao adicionar filme à party:", error);
        res.status(500).json({ message: 'Erro ao adicionar filme.' });
    }
});

router.post('/:partyId/movies/:apiMovieId/like', async (req, res) => {
    console.log(`[BACKEND - LIKE ROUTE] Início. PartyID: ${req.params.partyId}, MovieID: ${req.params.apiMovieId}, UserID: ${req.user._id}`);
    try {
        const partyId = req.params.partyId;
        const apiMovieIdStr = req.params.apiMovieId.toString(); // Normaliza para string
        const userId = req.user._id;

        const party = await Party.findById(partyId);
        if (!party) {
            console.log(`[BACKEND - LIKE ROUTE] Party ${partyId} não encontrada.`);
            return res.status(404).json({ message: 'Festa não encontrada.' });
        }

        let movieInParty = party.movies.find(m => m.apiMovieId.toString() === apiMovieIdStr);

        if (!movieInParty) {
            console.log(`[LIKE ROUTE] Filme ${apiMovieIdStr} não na party. Buscando no TMDB...`);
            const movieDetails = await fetchMovieDetailsFromTMDB(apiMovieIdStr);
            if (!movieDetails) {
                return res.status(404).json({ message: 'Detalhes do filme não encontrados no TMDB.' });
            }
            movieInParty = {
                apiMovieId: movieDetails.id.toString(),
                title: movieDetails.title,
                posterPath: movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null
            };
            party.movies.push(movieInParty);
            console.log(`[LIKE ROUTE] Filme ${apiMovieIdStr} adicionado à party.`);
        }

        const likeIndex = party.likes.findIndex(like => like.movieId.toString() === apiMovieIdStr && like.userId.equals(userId));
        if (likeIndex > -1) {
            party.likes.splice(likeIndex, 1); // Toggle: remove like
        } else {
            party.likes.push({ movieId: apiMovieIdStr, userId: userId }); // Adiciona like
        }
        await party.save();

        let isMatch = false;
        const allMemberIds = party.members.map(member => member.userId.toString());
        const usersWhoLikedThisMovie = party.likes
                                       .filter(like => like.movieId.toString() === apiMovieIdStr)
                                       .map(like => like.userId.toString());
        
        // Condição de Match: Todos os membros atuais da party deram like neste filme
        if (allMemberIds.length > 0 && usersWhoLikedThisMovie.length === allMemberIds.length) {
            isMatch = allMemberIds.every(memberId => usersWhoLikedThisMovie.includes(memberId));
        }
        console.log(`[BACKEND - LIKE ROUTE] Verificação de Match: isMatch = ${isMatch}`); // LOG
        const populatedPartyForResponse = await Party.findById(partyId)
                                     .populate('hostId', 'name email photo')
                                     .populate('members.userId', 'name email photo');
        
        if (isMatch) {
            const ioInstance = req.app.get('socketio');
            if (ioInstance) {
                const partyIdString = partyId.toString();
                const matchedMovieData = populatedPartyForResponse.movies.find(m => m.apiMovieId.toString() === apiMovieIdStr);
                console.log(`[BACKEND - LIKE ROUTE] MATCH ENCONTRADO! Preparando para emitir 'partyMatchFound' para sala: ${partyIdString}`);
                console.log(`[BACKEND - LIKE ROUTE] Dados do filme para emitir:`, matchedMovieData ? matchedMovieData.title : 'Filme não encontrado nos dados populados');
                console.log(`[BACKEND - LIKE ROUTE] Dados da party para emitir (parcial): _id=${populatedPartyForResponse._id}, members=${populatedPartyForResponse.members.length}`);
                ioInstance.to(partyIdString).emit('partyMatchFound', {
                    message: `É um match para o filme: ${matchedMovieData?.title || 'Desconhecido'}!`,
                    matchedMovie: matchedMovieData,
                    party: populatedPartyForResponse
                });
                 console.log(`[BACKEND - LIKE ROUTE] Evento 'partyMatchFound' emitido para sala ${partyIdString}.`); // LOG APÓS EMITIR
            } else {
                console.error("[BACKEND - LIKE ROUTE] ERRO: ioInstance (socketio) não encontrada em req.app!");
            }
            
        }
        console.log(`[BACKEND - LIKE ROUTE] Enviando resposta HTTP para o requisitante: isMatch = ${isMatch}`);
        res.json({ party: populatedPartyForResponse, isMatch });

    } catch (error) {
        console.error("[LIKE ROUTE] Erro:", error);
        res.status(500).json({ message: 'Erro ao processar like.' });
    }
});

router.get('/:partyId/movies/:apiMovieId/match', async (req, res) => {
    try {
        const party = await Party.findById(req.params.partyId);
        if (!party) {
            return res.status(404).json({ message: 'Festa não encontrada.' });
        }
        const apiMovieIdStr = req.params.apiMovieId.toString();
        const allMemberIds = party.members.map(member => member.userId.toString());
        const likerIdsForMovie = party.likes
            .filter(like => like.movieId.toString() === apiMovieIdStr)
            .map(like => like.userId.toString());

        let isMatch = false;
        if (allMemberIds.length > 0 && likerIdsForMovie.length === allMemberIds.length) {
            isMatch = allMemberIds.every(memberId => likerIdsForMovie.includes(memberId));
        }
        res.json({ isMatch, membersWhoLiked: likerIdsForMovie, totalMembers: allMemberIds.length });
    } catch (error) {
        console.error("Erro ao checar match:", error);
        res.status(500).json({ message: 'Erro ao checar match.' });
    }
});

module.exports = router;