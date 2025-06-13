// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Certifique-se que o caminho para User.js está correto

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato inválido.' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    try {
        console.log('[AuthMiddleware] Usando JWT_SECRET para verificar:', process.env.JWT_SECRET);
        console.log('[AuthMiddleware] Token recebido para verificar:', token); // 'token' é a variável que contém o token puro
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Se seu payload do token for { user: { id: '...' } } como no exemplo de login
        const userIdToFind = decoded.user && decoded.user.id ? decoded.user.id : decoded.userId;

        if (!userIdToFind) {
            console.error('ID do usuário não encontrado no token decodificado:', decoded);
            return res.status(401).json({ message: 'Token inválido: ID do usuário ausente.' });
        }

        // Busca o usuário pelo ID e remove a senha do objeto retornado
        const user = await User.findById(userIdToFind).select('-password');

        if (!user) {
            // Isso pode acontecer se o usuário foi deletado após o token ser emitido
            return res.status(401).json({ message: 'Usuário não encontrado para este token.' });
        }

        req.user = user; // Adiciona o objeto do usuário ao objeto da requisição
        req.token = token; // Adiciona o token (opcional, mas pode ser útil)
        next(); // Passa para o próximo middleware ou para o controlador da rota
    } catch (error) {
        console.error('Erro de autenticação no middleware:', error.message);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado.' });
        }
        // Para outros erros, um erro genérico de autenticação
        res.status(401).json({ message: 'Falha na autenticação do token.' });
    }
};

module.exports = authMiddleware;