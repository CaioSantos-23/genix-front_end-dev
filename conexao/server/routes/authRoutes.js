// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // npm install bcryptjs
const jwt = require('jsonwebtoken'); // npm install jsonwebtoken
const User = require('../models/User'); // Verifique se o caminho está correto

// ROTA DE REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, favoriteGenres } = req.body;

        // Validação básica de entrada
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
        }

        // Verificar se o usuário já existe
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Email já cadastrado.' });
        }

        // Criar novo usuário
        user = new User({
            name,
            email,
            password, // A senha será hasheada pelo hook 'pre-save' no User model
            favoriteGenres
        });

        // --- Se NÃO estiver usando o hook pre-save para hashear ---
        // DESCOMENTE e ajuste esta parte se não usar o hook no User.js
        /*
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        */
        // --- Fim da seção para hashear manualmente ---


        await user.save();

        // Gerar token JWT para auto-login ou apenas retornar sucesso
        const payload = {
            user: {
                id: user.id // ou user._id.toHexString()
            }
        };

        console.log('[Login Endpoint] Usando JWT_SECRET para assinar:', process.env.JWT_SECRET);
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expira em 1 hora
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: 'Usuário registrado com sucesso!',
                    token, // Opcional: retornar token no registro
                    user: { id: user.id, name: user.name, email: user.email }
                });
            }
        );

        res.status(201).json({
           message: 'Usuário registrado com sucesso!',
           userId: user.id // ou user._id
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erro no servidor ao registrar usuário.');
    }
});


// ROTA DE LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas (usuário não encontrado).' });
        }

        // Comparar senha
        // --- Se você adicionou o método comparePassword no UserSchema ---
        // const isMatch = await user.comparePassword(password);
        // --- OU compare diretamente ---
        const isMatch = await bcrypt.compare(password, user.password);


        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas (senha incorreta).' });
        }

        // Usuário autenticado, criar e retornar JWT
        const payload = {
            user: {
                id: user.id, // ou user._id.toHexString()
                name: user.name,
                email: user.email
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expira em 1 hora
            (err, token) => {
                if (err) throw err;
                res.json({
                    message: 'Login bem-sucedido!',
                    token,
                    user: { // Retorne os dados que o frontend precisa
                        id: user.id, // ou user._id
                        name: user.name,
                        email: user.email,
                        favoriteGenres: user.favoriteGenres
                    }
                });
            }
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Erro no servidor ao fazer login.');
    }
});

module.exports = router;