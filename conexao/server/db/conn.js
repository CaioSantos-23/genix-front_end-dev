const mongoose = require('mongoose'); 

const DB = process.env.DATABASE;

mongoose.connect(DB)
    .then(() => console.log("🚀 MongoDB conectado com sucesso"))
    .catch((err) => console.error("❌ Erro ao conectar com MongoDB:", err.message));