<template>
    <div class="party-container">
        <div class="party-header">
            <p>Assista a filmes com seus amigos baseado em seus gostos!</p>
        </div>

        <!-- Party Creation/Joining Section -->
        <div class="party-actions" v-if="!inParty">
            <div class="action-card">
                <h2>Criar Party</h2>
                <p class="action-description">Crie uma nova party e descubra filmes que você e seus amigos querem assistir juntos através do modo Tinder!</p>
                 <!-- Input para o título da festa -->
                <div class="form-group" style="margin-bottom: 1rem;">
                    <label for="partyTitle" style="display: block; margin-bottom: 0.5rem;">Título da Festa</label>
                    <input
                        type="text"
                        id="partyTitle"
                        v-model="newPartyTitle"
                        placeholder="Ex: Noite de Clássicos Cult"
                        class="party-input"
                        :disabled="creatingParty"
                    />
                </div>
                <button @click="createParty" class="action-button create" :disabled="creatingParty || !newPartyTitle">
                    <i class="fas fa-spinner fa-spin" v-if="creatingParty"></i>
                    <i class="fas fa-plus" v-else></i>
                    {{ creatingParty ? 'Criando...' : 'Criar Nova Party' }}
                </button>
            </div>

            <div class="action-card">
                <h2>Entrar em uma Party</h2>
                <p class="action-description">Entre em uma party existente e descubra filmes que combinam com seus amigos!</p>
                <div class="party-code-input">
                    <input
                        v-model="partyShortCodeToJoin"
                        placeholder="Digite o código da party"
                        class="party-input"
                        :disabled="joiningParty"
                        @keyup.enter="joinPartyWithShortCode"
                    />
                    <button @click="joinPartyWithShortCode" class="action-button join" :disabled="joiningParty || !partyShortCodeToJoin">
                        <i class="fas fa-spinner fa-spin" v-if="joiningParty"></i>
                        <i class="fas fa-sign-in-alt" v-else></i>
                        {{ joiningParty ? 'Entrando...' : 'Entrar na Party' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Active Party Section -->
        <div class="active-party" v-if="inParty">
            <div class="party-info">
                <div class="party-header-info">
                    <h2>Código da Party: <span class="party-code">{{ activePartyShortCode }}</span></h2>
                    <button @click="copyPartyCode" class="copy-button">
                        <i class="fas fa-copy"></i> Copiar Código
                    </button>
                </div>
                <p class="party-instructions">Compartilhe este código com seus amigos para entrarem na party!</p>

                <div class="party-status">
                    <div class="member-card" :class="{ 'host': isHost }">
                        <div class="member-status" v-if="isHost">Host</div>
                        <img :src="userPhoto" alt="Sua foto" class="member-photo" />
                        <p class="member-name">{{ userName || 'Você' }}</p>
                        <div class="genres-list">
                            <span v-for="genre in userGenres" :key="genre" class="genre-tag">
                                {{ genre }}
                            </span>
                        </div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="member-card" v-if="partnerJoined">
                        <img :src="partnerPhoto" alt="Foto do parceiro" class="member-photo" />
                        <p class="member-name">{{ partnerName }}</p>
                        <div class="genres-list">
                            <span v-for="genre in partnerGenres" :key="genre" class="genre-tag">
                                {{ genre }}
                            </span>
                        </div>
                    </div>
                    <div class="waiting-card" v-else>
                        <div class="spinner"></div>
                        <p>Aguardando parceiro entrar na party...</p>
                    </div>
                </div>
                <button v-if="partnerJoined && !inTinderMode" @click="goToTinderMode" class="tinder-mode-btn">
                    <i class="fas fa-fire"></i> Ir para o Tinder Mode
                </button>
            </div>

            <!-- Tinder Mode UI -->
            <div class="tinder-mode-container" v-if="inParty && inTinderMode">
                <p class="tinder-instruction" v-if="currentMovie">
                    Deslize para a direita para curtir ou para a esquerda para passar
                </p>
                
                <div class="tinder-card-wrapper" v-if="currentMovie">
                    <!-- Card de Filme Estilo Tinder -->
                    <div 
                        class="tinder-movie-card" 
                        :style="{ backgroundImage: 'url(' + (currentMovie.posterPath || currentMovie.poster) + ')' }"
                        role="img" :aria-label="currentMovie.title"
                    >
                        <div class="tinder-movie-overlay">
                            <h3 class="tinder-movie-title">{{ currentMovie.title }}</h3>
                            <div class="tinder-movie-meta" v-if="currentMovie.year || currentMovie.rating">
                                <span v-if="currentMovie.year">({{ currentMovie.year }})</span>
                                <span v-if="currentMovie.rating"><i class="fas fa-star"></i> {{ currentMovie.rating }}</span>
                            </div>
                        </div>
                    </div>
                    <!-- Fim do Card de Filme Estilo Tinder -->

                    <div class="tinder-swipe-actions">
                        <button @click="dislikeMovie" class="tinder-swipe-button dislike" aria-label="Não Gostei">
                            <i class="fas fa-times"></i>
                        </button>
                        <button @click="likeMovie" class="tinder-swipe-button like" aria-label="Gostei">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>

                <!-- Mensagens de "Sem mais filmes" ou "Carregando" -->
                <div v-if="!currentMovie && (!moviesForTinder || moviesForTinder.length === 0) && !matchFound" class="no-more-movies">
                    <i :class="loading ? 'fas fa-spinner fa-spin' : 'fas fa-film'"></i>
                    <p v-if="loading">Carregando mais filmes...</p>
                    <p v-else>Não há mais filmes para mostrar no momento.</p>
                </div>
                 <!-- Botão de voltar se estiver no tinder mode mas não há filmes -->
                <button 
                    v-if="!currentMovie && inTinderMode && (!moviesForTinder || moviesForTinder.length === 0) && !matchFound && !loading" 
                    @click="leaveTinderMode" 
                    class="continue-button">
                    <i class="fas fa-arrow-left"></i> Voltar para a Party
                </button>
            </div>


            <!-- Match Found Section -->
            <div class="match-found" v-if="matchFound && matchedMovie">
                <h2>🎉 É um Match! 🎉</h2>
                 <p>Vocês dois gostaram de:</p>
                <div class="liked-movies-grid">
                     <!-- Mostra apenas o filme que deu match -->
                    <div class="liked-movie-card">
                        <img :src="matchedMovie.posterPath || matchedMovie.poster" :alt="matchedMovie.title" />
                        <div class="liked-movie-info">
                            <h3>{{ matchedMovie.title }}</h3>
                            <div class="movie-meta">
                                <span v-if="matchedMovie.year">{{ matchedMovie.year }}</span>
                                <span v-if="matchedMovie.rating">
                                    <i class="fas fa-star"></i> {{ matchedMovie.rating }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="match-actions">
                    <button @click="startWatching" class="watch-button">
                        <i class="fas fa-play"></i> Começar a Assistir
                    </button>
                    <button @click="continueMatching" class="continue-button">
                        <i class="fas fa-sync"></i> Continuar Procurando
                    </button>
                </div>
                 <button v-if="!inTinderMode" @click="leaveTinderMode" class="continue-button" style="margin-top: 1rem;">
                    <i class="fas fa-arrow-left"></i> Voltar para Detalhes da Party
                </button>
            </div>

            <button @click="leaveParty" class="leave-party-button" v-if="inParty">
                <i class="fas fa-sign-out-alt"></i> Sair da Party
            </button>
        </div>

        <div v-if="error" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ error }}
        </div>
    </div>
</template>

<script>
import PartyService from '@/services/PartyService';
import MovieService from '@/services/MovieService';
import io from 'socket.io-client'; 

export default {
    name: 'PartyView',
    data() {
        return {
            newPartyTitle: '',
            inParty: false,
            partyShortCodeToJoin: '',   
            activePartyShortCode: '', 
            activePartyId: null,
            userId: null, // Adicionado para inicialização
            socket: null, // Adicionado para a instância do socket
            loading: false,     
            userName: '',
            userPhoto: require('@/assets/default-avatar.png'),
            userGenres: [],
            isHost: false,
            partnerJoined: false,
            partnerName: '',
            partnerPhoto: require('@/assets/default-avatar.png'),
            partnerGenres: [],

            moviesForTinder: [], 
            currentMovie: null,  
            sessionSwipedMovieApiIds: new Set(),

            matchFound: false,
            matchedMovie: null,   
            matchHistory: [],   

            creatingParty: false,
            joiningParty: false,
            error: null,
            inTinderMode: false, 
        };
    },
    methods: {
        // --- LÓGICA DE CRIAÇÃO E ENTRADA NA PARTY ---
        async createParty() {
            if (!this.userId) {
                this.error = "Usuário não identificado. Faça login novamente.";
                console.error("Erro ao criar party:", this.error);
                alert(this.error);
                return;
            }
            if (!this.newPartyTitle.trim()) {
                this.error = 'Por favor, insira um título para a festa.';
                console.error("Erro ao criar party:", this.error);
                alert(this.error);
                return;
            }
            this.creatingParty = true;
            this.error = null;
            try {
                const partyData = {
                    title: this.newPartyTitle,
                    hostGenres: this.userGenres // Gêneros do host para a party
                };
                const newParty = await PartyService.createParty(partyData);

                if (newParty && newParty._id && newParty.shortCode) { // Verifica _id e shortCode
                    this.activePartyId = newParty._id;
                    this.activePartyShortCode = newParty.shortCode; // MUDANÇA: Salva o shortCode
                    this.inParty = true;
                    this.isHost = true;
                    this.updatePartyMembersState(newParty.members, newParty.hostId?._id || newParty.hostId);
                    
                    // Salvar no localStorage para persistência
                    localStorage.setItem('activePartyId', this.activePartyId);
                    localStorage.setItem('activePartyShortCode', this.activePartyShortCode);
                    this.initializeWebSocket();
                    alert(`Party criada! Compartilhe o código: ${newParty.shortCode}`);
                    this.newPartyTitle = '';
                } else {
                    throw new Error(newParty?.message || "Resposta inválida do servidor ao criar party.");
                }
            } catch (error) {
                this.error = error.message || 'Erro ao criar a party. Tente novamente.';
                console.error('Failed to create party:', error);
                alert(this.error);
            } finally {
                this.creatingParty = false;
            }
        },

        async joinPartyWithShortCode() {
            if (!this.userId) { /* ... */ return; }
            if (!this.partyShortCodeToJoin.trim()) { this.error = "Por favor, insira o código da party."; alert(this.error); return; }

            this.joiningParty = true;
            this.error = null;
            try {
                const shortCodeToUse = this.partyShortCodeToJoin.trim().toUpperCase(); // Garante uppercase
                const joinedParty = await PartyService.joinParty(shortCodeToUse, this.userGenres);

                if (joinedParty && joinedParty._id && joinedParty.shortCode) {
                    this.activePartyId = joinedParty._id;
                    this.activePartyShortCode = joinedParty.shortCode; // MUDANÇA: Salva o shortCode
                    this.inParty = true;
                    this.isHost = joinedParty.hostId && (joinedParty.hostId._id === this.userId || joinedParty.hostId === this.userId);
                    this.updatePartyMembersState(joinedParty.members, joinedParty.hostId?._id || joinedParty.hostId);
                    
                    // Salvar no localStorage
                    localStorage.setItem('activePartyId', this.activePartyId);
                    localStorage.setItem('activePartyShortCode', this.activePartyShortCode);
                    this.initializeWebSocket();
                    alert('Você entrou na party!');
                    this.partyShortCodeToJoin = ''; // Limpa o input
                    if (this.partnerJoined) {
                        this.loadMoviesForTinderMode();
                    }
                } else {
                    throw new Error(joinedParty?.message || "Resposta inválida do servidor ao entrar na party (faltando _id ou shortCode).");
                }
            } catch (error) {
                this.error = error.message || 'Erro ao entrar na party. Verifique o código.';
                console.error('Failed to join party (PartyView):', error);
                alert(this.error);
            } finally {
                this.joiningParty = false;
            }
        },

        async leaveParty() {
            if (!this.activePartyId) return; // Usa o _id para a operação de leave
            try {
                await PartyService.leaveParty(this.activePartyId); // O backend espera o _id para leave
                this.resetPartyState();
                alert('Você saiu da party');
            } catch (error) {
                console.error('Failed to leave party (PartyView):', error); 
                this.error = (error && error.message) ? error.message : 'Erro desconhecido ao sair da party.';
                alert(this.error);
            }
        },

        resetPartyState() {
            this.inParty = false;
           this.partyShortCodeToJoin = '';
            this.activePartyShortCode = ''; 
            this.activePartyId = null;      
            this.isHost = false;
            this.partnerJoined = false;
            this.partnerName = '';
            this.partnerPhoto = require('@/assets/default-avatar.png');
            this.partnerGenres = [];
            this.moviesForTinder = []; // Limpa
            this.currentMovie = null;
            this.sessionSwipedMovieApiIds.clear(); // Limpa o Set
            this.matchFound = false;
            this.matchedMovie = null;
            this.matchHistory = []; // Limpa o array
            this.error = null;
            this.inTinderMode = false;
            localStorage.removeItem('activePartyId');       // MUDANÇA
            localStorage.removeItem('activePartyShortCode'); // MUDANÇA
            localStorage.removeItem('inTinderModeForParty_' + this.activePartyId); 
            this.disconnectWebSocket();
        },

        // PartyView.vue -> methods
        copyPartyCode() {
            if (!this.activePartyShortCode) {
                this.error = 'Não há código de party para copiar.';
                alert(this.error); // Ou use seu sistema de toast se/quando estiver funcionando
                console.warn("Tentativa de copiar código da party, mas currentPartyCode está vazio.");
                return;
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(this.activePartyShortCode)
                    .then(() => {
                        alert('Código da Party copiado: ' + this.activePartyShortCode);
                    })
                    .catch((err) => {
                        console.error('Erro ao copiar automaticamente:', err);
                        alert('Falha ao copiar. Código: ' + this.activePartyShortCode);
                    });
            } else {
                alert('Navegador não suporta cópia automática. Código: ' + this.activePartyShortCode);
            }
        },

        loadInitialUserData() {
            const userString = localStorage.getItem('user');
            if (userString) {
                const userData = JSON.parse(userString);
                this.userId = userData.id || userData._id; 
                this.userName = userData.name || 'Usuário';
                this.userPhoto = userData.photo || require('@/assets/default-avatar.png');
                this.userGenres = userData.favoriteGenres || [];
            } else {
                console.warn("PartyView: Nenhum usuário encontrado no localStorage. Redirecionando para login.");
                this.$router.push('/login');
            }
        },

        updatePartyMembersState(membersFromServer) {
            if (!this.userId || !membersFromServer || membersFromServer.length === 0) {
                this.partnerJoined = false;
                return;
            }

            const otherMembers = membersFromServer.filter(member => {
                const memberUserId = member.userId?._id || member.userId; // Lida com ID string ou objeto populado
                return memberUserId && memberUserId !== this.userId;
            });

            if (otherMembers.length > 0) {
                this.partnerJoined = true;
                const partnerData = otherMembers[0].userId; 
                const partnerPartyData = otherMembers[0];   

                this.partnerName = partnerData.name || 'Convidado';
                this.partnerPhoto = partnerData.photo || require('@/assets/default-avatar.png');
                this.partnerGenres = partnerPartyData.selectedGenres || [];
            } else {
                this.partnerJoined = false;
                this.partnerName = '';
                this.partnerPhoto = require('@/assets/default-avatar.png');
                this.partnerGenres = [];
            }
        },

        async loadPartyStateFromStorage() {
            const partyIdFromStorage = localStorage.getItem('activePartyId'); // MUDANÇA: Chave para _id
            const shortCodeFromStorage = localStorage.getItem('activePartyShortCode'); // MUDANÇA: Chave para shortCode

            if (partyIdFromStorage && this.userId) {
                this.activePartyId = partyIdFromStorage;
                this.activePartyShortCode = shortCodeFromStorage || ''; // Carrega o shortCode
                this.error = null;
                try {
                    // Para recarregar os dados da party, o backend espera o _id
                    const partyData = await PartyService.getPartyData(this.activePartyId); 
                    if (partyData && partyData._id) {
                        this.inParty = true;
                        // Se o shortCode não estava no localStorage mas veio do backend, atualiza
                        if (partyData.shortCode && !this.activePartyShortCode) {
                            this.activePartyShortCode = partyData.shortCode;
                            localStorage.setItem('activePartyShortCode', partyData.shortCode);
                        }
                        this.updatePartyMembersState(partyData.members, partyData.hostId?._id || partyData.hostId);
                        
                        if (localStorage.getItem('inTinderModeForParty_' + this.activePartyId) === 'true' || (this.partnerJoined && !this.matchFound)) {
                           this.inTinderMode = true;
                           await this.loadMoviesForTinderMode();
                        }
                    } else { this.resetPartyState(); }
                } catch (err) {
                    console.error("Erro ao carregar dados da party do storage:", err);
                    this.error = "Não foi possível carregar os dados da sua party anterior.";
                    this.resetPartyState();
                }
            }
        },

        initializeWebSocket() {
            if (!this.activePartyId) {
                console.warn('[FRONTEND - PartyView] Tentativa de inicializar WebSocket sem activePartyId.');
                return;
            }

            // Se já existe uma instância de socket E ela está conectada
            if (this.socket && this.socket.connected) {
                console.log('[FRONTEND - PartyView] WebSocket já conectado. Garantindo que está na sala correta.');
                // Se o socket já existe e está conectado, apenas garante que ele está na sala correta.
                // Isso pode ser útil se o activePartyId mudou enquanto o socket permaneceu conectado.
                this.socket.emit('joinPartyRoom', this.activePartyId);
                return; // Não precisa recriar ou reanexar listeners se já está tudo ok.
            }

            console.log(`[FRONTEND - PartyView] Preparando para inicializar/conectar WebSocket para party: ${this.activePartyId}`);
            const socketURL = (process.env.VUE_APP_API_BASE_URL || 'http://localhost:8005/api').replace('/api', '');
            
            // Se a instância do socket não existe, cria uma nova.
            if (!this.socket) {
                console.log(`[FRONTEND - PartyView] Criando NOVA instância de WebSocket para: ${socketURL}`);
                this.socket = io(socketURL, {
                    // autoConnect: true, // Padrão. Se false, precisaria de this.socket.connect()
                });
            } else if (this.socket && !this.socket.connected) {
                // Se a instância existe mas não está conectada, tenta conectar.
                console.log('[FRONTEND - PartyView] Socket existente não conectado. Tentando conectar...');
                this.socket.connect();
            }

            // Limpar listeners antigos ANTES de adicionar novos para evitar duplicações
            // se esta função for chamada em uma instância de socket que já teve listeners.
            this.socket.off('connect');
            this.socket.off('disconnect');
            this.socket.off('connect_error');
            this.socket.off('partyMatchFound');
            this.socket.off('userJoinedPartyRealtime');
            this.socket.off('userLeftPartyRealtime');

            // Adicionar novos listeners
            this.socket.on('connect', () => {
                console.log(`[FRONTEND - PartyView USER: ${this.userId}] Conectado ao WS. ID: ${this.socket.id}`);
                console.log(`[FRONTEND - PartyView USER: ${this.userId}] Emitindo 'joinPartyRoom' para party: ${this.activePartyId}`);
                this.socket.emit('joinPartyRoom', this.activePartyId);
            });

            this.socket.on('partyMatchFound', (data) => {
                console.log(`********** [FRONTEND - PartyView USER: ${this.userId}, SocketID: ${this.socket?.id}] Evento 'partyMatchFound' RECEBIDO! **********`, JSON.parse(JSON.stringify(data)));
                if (data.matchedMovie && data.party) {
                    this.matchedMovie = data.matchedMovie;
                    this.matchFound = true;
                    this.inTinderMode = false; // Sai do modo Tinder para mostrar a tela de match
                    this.updatePartyStateFromSocket(data.party); // Atualiza o estado geral da party
                    
                    // AJUSTE: O ALERT DE MATCH AGORA É EXCLUSIVAMENTE TRATADO AQUI
                    alert(`🎉 MATCH! Vocês dois gostaram de: ${data.matchedMovie.title}`);
                    
                    console.log(`[FRONTEND - PartyView USER: ${this.userId}] Estado atualizado após match via WebSocket: matchFound=${this.matchFound}, filme=${this.matchedMovie?.title}`);
                } else {
                    console.warn(`[FRONTEND - PartyView USER: ${this.userId}] 'partyMatchFound' recebido com dados incompletos.`, data);
                }
            });

            this.socket.on('userJoinedPartyRealtime', (eventData) => {
                console.log(`[FRONTEND - PartyView USER: ${this.userId}] Evento 'userJoinedPartyRealtime' RECEBIDO! User ${eventData.userName} (ID: ${eventData.userId}) entrou.`, JSON.parse(JSON.stringify(eventData)));
                if (eventData.party) {
                    this.updatePartyStateFromSocket(eventData.party);
                    if (eventData.userId !== this.userId) {
                        alert(`${eventData.userName || 'Alguém'} entrou na party!`);
                    }
                }
            });
            
            this.socket.on('userLeftPartyRealtime', (eventData) => {
                console.log(`[FRONTEND - PartyView USER: ${this.userId}] Evento 'userLeftPartyRealtime' RECEBIDO! User ${eventData.userName} (ID: ${eventData.userId}) saiu. Party deletada: ${eventData.partyDeleted}`, JSON.parse(JSON.stringify(eventData)));
                if (eventData.partyDeleted) {
                    if (this.activePartyId === eventData.partyId) {
                        alert('A party foi encerrada.');
                        this.disconnectWebSocket(); // Desconecta primeiro
                        this.resetPartyState(); 
                    }
                } else if (eventData.party) {
                    this.updatePartyStateFromSocket(eventData.party);
                    if (eventData.userId !== this.userId) {
                        alert(`${eventData.userName || 'Alguém'} saiu da party.`);
                    }
                }
            });

            this.socket.on('disconnect', (reason) => {
                console.log(`[FRONTEND - PartyView USER: ${this.userId}] Desconectado do WS. Razão: ${reason}`);
                // Considerar limpar this.socket = null; aqui se a reconexão não for automática
                // ou se você quiser forçar uma nova instância na próxima chamada de initializeWebSocket.
                // Se o socket.io-client tiver reconexão automática habilitada (padrão), ele tentará reconectar.
            });

            this.socket.on('connect_error', (err) => {
                console.error(`[FRONTEND - PartyView USER: ${this.userId}] Erro de conexão WS: ${err.message}`, err);
            });
        },

        disconnectWebSocket() {
            if (this.socket) {
                console.log(`[FRONTEND - PartyView] Desconectando WebSocket da party: ${this.activePartyId}`);
                if (this.activePartyId) {
                    this.socket.emit('leavePartyRoom', this.activePartyId); // Informa o servidor
                }
                this.socket.disconnect();
                this.socket.off('connect'); // Remove todos os listeners para esta instância
                this.socket.off('partyMatchFound');
                this.socket.off('userJoinedPartyRealtime');
                this.socket.off('userLeftPartyRealtime');
                this.socket.off('disconnect');
                this.socket.off('connect_error');
                this.socket = null; // Define como null para que possa ser recriado se necessário
            }
        },

        updatePartyStateFromSocket(partyDataFromServer) {
            if (partyDataFromServer && partyDataFromServer._id) {
                // Atualiza o estado local com os dados mais recentes da party vindos do servidor
                this.activePartyId = partyDataFromServer._id; // Pode ser redundante, mas garante
                this.activePartyShortCode = partyDataFromServer.shortCode || this.activePartyShortCode;
                this.inParty = true;
                this.isHost = partyDataFromServer.hostId && ((partyDataFromServer.hostId._id || partyDataFromServer.hostId) === this.userId);
                this.updatePartyMembersState(partyDataFromServer.members); // Atualiza quem são os membros
                // Você pode precisar atualizar outros aspectos da party aqui também,
                // como party.movies ou party.likes, se eles mudam e são enviados pelo socket.
                console.log("[PartyView] Estado da party atualizado via WebSocket:", this.activePartyShortCode);
            }
        },

        async loadMoviesForTinderMode() {
            if (!this.activePartyId) { /* ... */ return; }
            this.loading = true; this.error = null;
            try {
                const moviesFromService = await MovieService.getTinderMoviesForParty(this.activePartyId);
                this.moviesForTinder = (moviesFromService || []).filter(movie =>
                    movie && movie.apiMovieId && !this.sessionSwipedMovieApiIds.has(movie.apiMovieId)
                );
                if (this.moviesForTinder.length > 0) {
                    this.currentMovie = this.moviesForTinder[0];
                } else {
                    this.currentMovie = null;
                    console.log("[PartyView] Não há mais filmes novos para mostrar nesta sessão do Tinder.");
                    // alert("Não há mais filmes para esta sessão de match.");
                }
            } catch (error) {
                console.error('Failed to load movies for party tinder:', error);
                this.error = error.message || 'Erro ao carregar filmes para a party.';
            } finally {
                this.loading = false;
            }
        },

        async likeMovie() {
            if (!this.currentMovie || !this.activePartyId) { /* ... */ return; }
            const movieIdToLike = this.currentMovie.apiMovieId?.toString();
            if (!movieIdToLike) { /* ... */ return; }

            this.sessionSwipedMovieApiIds.add(movieIdToLike); // Marca como visto

            try {
                const response = await PartyService.likeMovie(this.activePartyId, movieIdToLike);
                if (response && typeof response.isMatch !== 'undefined') {
                    if (response.isMatch) {
                        this.matchFound = true;
                        this.matchedMovie = this.currentMovie;
                        this.matchHistory.push(this.currentMovie);
                        this.inTinderMode = false; // Sai do modo tinder ao encontrar um match
                        //alert('🎉 Match! Vocês dois gostaram de: ' + this.currentMovie.title);
                    } else {
                        alert(`Seu like para "${this.currentMovie.title}" foi registrado na party!`);
                        this.moveToNextMovie();
                    }
                } else { throw new Error("Resposta inválida do servidor ao dar like."); }
            } catch (error) {
                console.error('Error liking movie (PartyView):', error);
                this.sessionSwipedMovieApiIds.delete(movieIdToLike); // Permite tentar de novo se o backend falhar
                this.error = (error && error.message) ? error.message : 'Erro ao processar seu like.';
                alert(this.error);
            }
        },

        dislikeMovie() {
            if (!this.currentMovie || !this.currentMovie.apiMovieId) return;
            this.sessionSwipedMovieApiIds.add(this.currentMovie.apiMovieId.toString());
            this.moveToNextMovie();
        },

        moveToNextMovie() {
            const currentIndexInFullList = this.moviesForTinder.findIndex(
                m => m.apiMovieId === this.currentMovie?.apiMovieId
            );

            let nextMovieToShow = null;
            for (let i = currentIndexInFullList + 1; i < this.moviesForTinder.length; i++) {
                if (!this.sessionSwipedMovieApiIds.has(this.moviesForTinder[i].apiMovieId)) {
                    nextMovieToShow = this.moviesForTinder[i];
                    break;
                }
            }
            this.currentMovie = nextMovieToShow;

            if (!this.currentMovie) {
                console.log("[PartyView] Não há mais filmes não vistos na lista atual do Tinder Mode.");

            } else {
                console.log("[PartyView] Próximo filme para Tinder:", this.currentMovie.title);
            }
        },

        goToTinderMode() {
             if (!this.partnerJoined && !this.isHost) { // Apenas o host pode iniciar sozinho ou se parceiro entrou
                alert("Aguarde um parceiro entrar para iniciar o Tinder Mode.");
                return;
            }
            this.inTinderMode = true;
            localStorage.setItem('inTinderModeForParty_' + this.activePartyId, 'true');
            this.matchFound = false;
            this.matchedMovie = null;
            if (!this.currentMovie || this.moviesForTinder.every(m => this.sessionSwipedMovieApiIds.has(m.apiMovieId))) {
                this.sessionSwipedMovieApiIds.clear(); // Limpa para recarregar e ver todos de novo
                this.loadMoviesForTinderMode();
            } else {
                console.log("Reentrando no Tinder Mode com filmes já carregados.");
            }
        },

        leaveTinderMode() {
            this.inTinderMode = false;
            localStorage.removeItem('inTinderModeForParty_' + this.activePartyId);
        },
    },
    created() {
        this.loadInitialUserData();
        this.loadPartyStateFromStorage(); // loadPartyStateFromStorage agora pode chamar initializeWebSocket
    },

    beforeUnmount() {
        this.disconnectWebSocket();
    },

    watch: {
       activePartyId(newPartyId, oldPartyId) {
            console.log(`[PartyView Watch] activePartyId: ${oldPartyId} -> ${newPartyId}, inParty: ${this.inParty}`);
            if (newPartyId && this.inParty) {
                if (this.socket && oldPartyId && oldPartyId !== newPartyId) {
                    this.socket.emit('leavePartyRoom', oldPartyId); // Sai da sala antiga no mesmo socket
                }
                if (!this.socket || !this.socket.connected) {
                    this.initializeWebSocket(); // Conecta se não estiver conectado
                } else {
                    this.socket.emit('joinPartyRoom', newPartyId); // Se já conectado, apenas junta a nova sala
                }
            } else if (!newPartyId && oldPartyId) { // Se activePartyId se tornou null (ex: resetPartyState)
                this.disconnectWebSocket(); // Disconnect já está em resetPartyState, mas redundância não faz mal aqui
            }
        },
        inParty(isInPartyNow, wasInPartyBefore) {
            console.log(`[PartyView Watch] inParty: ${wasInPartyBefore} -> ${isInPartyNow}, activePartyId: ${this.activePartyId}`);
            if (isInPartyNow && this.activePartyId && (!this.socket || !this.socket.connected)) {
                this.initializeWebSocket();
            } else if (!isInPartyNow && wasInPartyBefore) {
                // Se saiu da party (inParty se tornou false), resetPartyState já deve ter chamado disconnect.
                // Se por algum motivo o socket ainda existir, desconecte.
                if (this.socket) {
                    this.disconnectWebSocket();
                }
            }
        }
    },
}
</script>

<style scoped>
.party-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--background-dark) 0%, var(--background-light) 100%);
}

.party-header {
    text-align: center;
    margin-bottom: 3rem;
    animation: fadeInDown 0.8s ease-out;
}

.party-header h1 {
    font-size: 3rem;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 1rem;
}

.party-header p {
    font-size: 1.2rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
}

.party-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem auto;
    max-width: 900px;
    animation: fadeInUp 0.8s ease-out;
}

.action-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.action-card h2 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.action-button {
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.action-button.create {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
}

.action-button.join {
    background: linear-gradient(45deg, var(--secondary-color), var(--accent-color));
    color: white;
}

.action-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.party-input {
    width: 100%;
    padding: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-color);
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.party-input:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.2);
}

.party-status {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
    animation: fadeIn 0.8s ease-out;
}

.member-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    transition: transform 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.member-photo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    margin-bottom: 1rem;
    object-fit: cover;
    border: 3px solid var(--primary-color);
    padding: 3px;
    background: var(--background-dark);
}

.genres-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
}

.genre-tag {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-color);
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.movie-matching {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.movies-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 2rem;
    padding: 1rem;
    width: 100%;
    overflow-x: auto;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
}

.movie-card {
    flex: 0 0 300px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    animation: fadeIn 0.8s ease-out;
    display: flex;
    flex-direction: column;
    opacity: 0.7;
    transition: all 0.3s ease;
}

.movie-card.active {
    opacity: 1;
    transform: scale(1.05);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.movie-poster-container {
    position: relative;
    overflow: hidden;
    height: 350px;
    width: 100%;
}

.movie-poster {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.movie-info {
    padding: 1.5rem;
    flex: 1;
}

.movie-info h3 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.swipe-actions {
    padding: 1rem;
    display: flex;
    justify-content: center;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.1);
}

.swipe-button {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    font-size: 1.8rem;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.swipe-button.like {
    background: linear-gradient(45deg, #2ecc71, #27ae60);
    color: white;
}

.swipe-button.dislike {
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    color: white;
}

.swipe-button:hover {
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.match-found {
    text-align: center;
    padding: 3rem;
    animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.match-found h2 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.liked-movies-grid {
    display: flex;
    flex-wrap: nowrap;
    gap: 2rem;
    margin: 2rem 0;
    width: 100%;
    overflow-x: auto;
    padding: 1rem;
    scrollbar-width: thin;
    -webkit-overflow-scrolling: touch;
}

.liked-movie-card {
    flex: 0 0 300px;
    background: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.liked-movie-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.liked-movie-card img {
    width: 100%;
    height: 280px;
    object-fit: cover;
}

.liked-movie-info {
    padding: 1rem;
    background: linear-gradient(to top, var(--card-bg), rgba(0, 0, 0, 0.8));
}

.liked-movie-info h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
    color: white;
    font-weight: 600;
}

.match-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.watch-button {
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: all 0.3s ease;
}

.watch-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.error-message {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(45deg, #e74c3c, #c0392b);
    color: white;
    padding: 1rem 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    animation: slideUp 0.3s ease-out;
}

.tinder-mode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Alinha ao topo para ver a instrução */
  padding: 1rem;
  width: 100%;
  max-width: 400px; /* Limita a largura máxima do container do tinder */
  margin: 2rem auto; /* Centraliza e dá espaço */
  min-height: 600px; /* Altura mínima para acomodar card e botões */
}

.tinder-instruction {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.tinder-card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* perspective: 1000px; */ /* Para futuras animações de swipe 3D */
}

.tinder-movie-card {
  width: 280px; /* Largura do card Tinder */
  height: 420px; /* Altura do card Tinder (proporção de poster comum) */
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 6px 10px rgba(0,0,0,0.15);
  position: relative;
  background-size: cover;     /* Faz a imagem de fundo cobrir o card */
  background-position: center; /* Centraliza a imagem de fundo */
  background-repeat: no-repeat;
  background-color: var(--card-bg); /* Cor de fallback */
  /* transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); */ /* Para animação de swipe */
  cursor: grab; /* Indica que pode ser arrastado */
}
.tinder-movie-card:active {
    cursor: grabbing;
}


.tinder-movie-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 30%, transparent 100%);
  border-bottom-left-radius: 15px; /* Para acompanhar o card */
  border-bottom-right-radius: 15px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100px; /* Garante espaço para o texto */
}

.tinder-movie-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.3rem 0;
  line-height: 1.2;
}

.tinder-movie-meta {
  font-size: 0.9rem;
  opacity: 0.8;
  display: flex;
  gap: 0.8rem;
  align-items: center;
}
.tinder-movie-meta .fa-star {
    color: #ffd700;
}

.tinder-swipe-actions {
  display: flex;
  justify-content: center;
  gap: 2rem; 
  margin-top: 1.5rem;
}

.tinder-swipe-button {
  width: 65px; 
  height: 65px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1.8rem; 
  transition: all 0.2s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.tinder-swipe-button.like {
  background-color: #2ecc71; /* Verde */
}
.tinder-swipe-button.like:hover {
  background-color: #27ae60;
  transform: scale(1.1);
}

.tinder-swipe-button.dislike {
  background-color: #e74c3c; /* Vermelho */
}
.tinder-swipe-button.dislike:hover {
  background-color: #c0392b;
  transform: scale(1.1);
}

/* Mensagem de "sem mais filmes" */
.no-more-movies {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
    margin-top: 2rem; /* Para dar espaço se os botões de swipe sumirem */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px; /* Para ocupar algum espaço */
}
.no-more-movies i {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: var(--text-color);
}
.no-more-movies p {
    margin-bottom: 1.5rem;
}

/* Estilos para o botão "Voltar para a Party" (continue-button) podem ser reutilizados ou ajustados */
.continue-button { /* Se você já tem, pode pular ou ajustar */
    background: linear-gradient(45deg, var(--secondary-color), var(--accent-color));
    color: white;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: inline-flex; /* Para que não ocupe largura total por padrão */
    align-items: center;
    gap: 0.5rem;
}
.continue-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 0.9;
        transform: scale(1.1);
    }
    80% {
        opacity: 1;
        transform: scale(0.89);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

@media (max-width: 768px) {
    .party-container {
        padding: 1rem;
    }

    .party-header h1 {
        font-size: 2rem;
    }

    .party-actions {
        grid-template-columns: 1fr;
    }

    .member-card {
        padding: 1.5rem;
    }

    .movie-card {
        margin: 1rem;
    }

    .movie-poster {
        height: 300px;
    }

    .swipe-button {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
    }
}

.vs-divider {
    font-size: 2rem;
    font-weight: bold;
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.vs-divider::before,
.vs-divider::after {
    content: '';
    height: 2px;
    width: 50px;
    background: linear-gradient(90deg, transparent, var(--text-color), transparent);
    margin: 0 1rem;
}

.waiting-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: 2rem;
    border-radius: 20px;
    text-align: center;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.selected-movie {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.selected-movie-poster {
    width: 120px;
    height: 180px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 0.5rem;
}

.party-code-input {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1.5rem;
}

.member-status {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.member-name {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0.5rem 0;
}

.movie-rating {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(0, 0, 0, 0.8);
    color: #ffd700;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    backdrop-filter: blur(5px);
    z-index: 2;
}

.movie-meta {
    display: flex;
    gap: 1.5rem;
    margin: 1rem 0;
    color: var(--text-secondary);
}

.movie-meta span {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.movie-description {
    line-height: 1.6;
    margin: 1rem 0;
    color: var(--text-color);
}

.movie-cast {
    margin-top: 1.5rem;
}

.movie-cast h4 {
    margin-bottom: 1rem;
    color: var(--text-color);
}

.cast-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.cast-member {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.cast-photo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 0.5rem;
    border: 2px solid var(--primary-color);
}

.cast-name {
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.2rem;
}

.cast-character {
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.no-more-movies {
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
}

.no-more-movies i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.continue-button {
    background: linear-gradient(45deg, var(--secondary-color), var(--accent-color));
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 12px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.continue-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
    .cast-list {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    }

    .cast-photo {
        width: 60px;
        height: 60px;
    }

    .movie-meta {
        flex-direction: column;
        gap: 0.5rem;
    }

    .match-actions {
        flex-direction: column;
    }
}

.fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}

.slide-up-enter-active, .slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from, .slide-up-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

.bounce-enter-active {
    animation: bounce-in 0.5s;
}

.bounce-leave-active {
    animation: bounce-in 0.5s reverse;
}

@keyframes bounce-in {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}

/* Add custom scrollbar styling */
.movies-grid::-webkit-scrollbar {
    height: 8px;
}

.movies-grid::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.movies-grid::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
}

.movies-grid::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
}

/* Add custom scrollbar styling for liked-movies-grid */
.liked-movies-grid::-webkit-scrollbar {
    height: 8px;
}

.liked-movies-grid::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
}

.liked-movies-grid::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
}

.liked-movies-grid::-webkit-scrollbar-thumb:hover {
    background: var(--secondary-color);
}
</style>
