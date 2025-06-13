<template>
  <div class="carousel-container">
    <!-- Define um contêiner para todo o carrossel, aplicando a classe CSS 'carousel-container' -->
    <h2 class="carousel-title">Filmes Recomendados</h2>
    <!-- Define o título do carrossel, aplicando a classe CSS 'carousel-title' -->
    <div class="carousel">
      <!-- Define um contêiner para os slides e botões de navegação, aplicando a classe CSS 'carousel' -->
      <button class="carousel-button prev" @click="prevSlide" aria-label="Slide anterior">
        <!-- Define o botão para ir para o slide anterior, aplicando a classe CSS 'carousel-button prev' -->
        <!-- `@click="prevSlide"`: Quando o botão é clicado, o método `prevSlide` é chamado -->
        <!-- `aria-label="Slide anterior"`: Define um texto alternativo para acessibilidade (leitores de tela) -->
        <i class="fas fa-chevron-left"></i>
        <!-- Define o ícone de seta para a esquerda, usando a biblioteca Font Awesome -->
      </button>
      <div
        class="carousel-track"
        :style="{ transform: `translateX(${translateX}px)` }"
      >
        <!-- Define o contêiner dos slides, aplicando a classe CSS 'carousel-track' -->
        <!-- `:style="{ transform: `translateX(${translateX}px)` }"`: Define o estilo `transform` dinamicamente -->
        <!-- A propriedade `translateX` é usada para mover o contêiner horizontalmente -->
        <!-- O valor da translação é definido pela propriedade reativa `translateX` -->
        <div
          v-for="filme in filmes"
          :key="filme.id"
          class="carousel-slide"
        >
          <!-- Loop para criar um slide para cada filme no array `filmes` -->
          <!-- `v-for="filme in filmes"`: Itera sobre o array `filmes` e atribui cada elemento à variável `filme` -->
          <!-- `:key="filme.id"`: Define uma chave única para cada slide, para otimizar a renderização -->
          <!-- Aplica a classe CSS 'carousel-slide' a cada slide -->
          <img :src="filme.imagem" :alt="filme.titulo" class="slide-image" />
          <!-- Define a imagem do filme -->
          <!-- `:src="filme.imagem"`: Define o atributo `src` com o valor da propriedade `imagem` do objeto `filme` -->
          <!-- `:alt="filme.titulo"`: Define o atributo `alt` com o valor da propriedade `titulo` do objeto `filme` (para acessibilidade) -->
          <!-- Aplica a classe CSS 'slide-image' à imagem -->
          <div class="slide-details">
            <!-- Define um contêiner para as informações do filme, aplicando a classe CSS 'slide-details' -->
            <span class="slide-rating"
              ><i class="fas fa-star"></i> {{ filme.avaliacao }}</span
            >
            <!-- Exibe a avaliação do filme, aplicando a classe CSS 'slide-rating' -->
            <!-- `<i>`: Adiciona um ícone de estrela (Font Awesome) -->
            <!-- `{{ filme.avaliacao }}`: Interpola o valor da propriedade `avaliacao` do objeto `filme` -->
            <span class="slide-genre"
              ><i class="fas fa-film"></i> {{ filme.genero }}</span
            >
            <!-- Exibe o gênero do filme, aplicando a classe CSS 'slide-genre' -->
            <!-- `<i>`: Adiciona um ícone de filme (Font Awesome) -->
            <!-- `{{ filme.genero }}`: Interpola o valor da propriedade `genero` do objeto `filme` -->
          </div>
        </div>
      </div>
      <button class="carousel-button next" @click="nextSlide" aria-label="Próximo slide">
        <!-- Define o botão para ir para o próximo slide, aplicando a classe CSS 'carousel-button next' -->
        <!-- `@click="nextSlide"`: Quando o botão é clicado, o método `nextSlide` é chamado -->
        <!-- `aria-label="Próximo slide"`: Define um texto alternativo para acessibilidade (leitores de tela) -->
        <i class="fas fa-chevron-right"></i>
        <!-- Define o ícone de seta para a direita, usando a biblioteca Font Awesome -->
      </button>
    </div>
    <div class="carousel-indicators">
      <!-- Define um contêiner para os indicadores de navegação (bolinhas), aplicando a classe CSS 'carousel-indicators' -->
      <button
        v-for="(filme, index) in filmes"
        :key="index"
        class="indicator-button"
        :class="{ active: currentIndex === index }"
        @click="goToSlide(index)"
        :aria-label="`Slide ${index + 1}`"
      ></button>
      <!-- Loop para criar um indicador para cada filme -->
      <!-- `v-for="(filme, index) in filmes"`: Itera sobre o array `filmes` e atribui cada elemento à variável `filme` e seu índice à variável `index` -->
      <!-- `:key="index"`: Define uma chave única para cada indicador, para otimizar a renderização -->
      <!-- Aplica a classe CSS 'indicator-button' a cada indicador -->
      <!-- `:class="{ active: currentIndex === index }"`: Adiciona a classe CSS 'active' ao indicador correspondente ao slide atual -->
      <!-- `@click="goToSlide(index)"`: Quando o indicador é clicado, o método `goToSlide` é chamado com o índice do slide -->
      <!-- `aria-label="`Slide ${index + 1}`"`: Define um texto alternativo para acessibilidade (leitores de tela) -->
    </div>
  </div>
</template>

<script>
export default {
  name: "FilmeCarrosselCustom", // Nome do componente
  props: {
    // Definição das props (propriedades) que o componente recebe
    filmes: {
      // Define a prop `filmes`
      type: Array, // O tipo de dado esperado é um Array
      required: true, // A prop é obrigatória
    },
  },
  data() {
    // Define os dados reativos do componente
    return {
      currentIndex: 0, // Índice do slide atual (começa em 0)
      translateX: 0, // Valor da translação horizontal do track (começa em 0)
      slideWidth: 250, // Largura de cada slide (em pixels)
      spaceBetween: 25, // Espaço entre os slides (em pixels)
      visibleSlides: 4, // Número de slides visíveis ao mesmo tempo
    };
  },
  computed: {
    // Define propriedades computadas (valores derivados de outros dados)
    totalSlides() {
      // Retorna o número total de slides (o tamanho do array `filmes`)
      return this.filmes.length;
    },
  },
  methods: {
    // Define os métodos (funções) do componente
    nextSlide() {
      // Avança para o próximo slide
      if (this.currentIndex < this.totalSlides - this.visibleSlides) {
        // Verifica se ainda há slides para frente
        this.currentIndex++; // Incrementa o índice do slide atual
        this.updateTransform(); // Atualiza a posição do track
      }
    },
    prevSlide() {
      // Volta para o slide anterior
      if (this.currentIndex > 0) {
        // Verifica se ainda há slides para trás
        this.currentIndex--; // Decrementa o índice do slide atual
        this.updateTransform(); // Atualiza a posição do track
      }
    },
    goToSlide(index) {
      // Vai para um slide específico (pelo índice)
      if (index >= 0 && index <= this.totalSlides - this.visibleSlides) {
        // Verifica se o índice é válido
        this.currentIndex = index; // Define o índice do slide atual
        this.updateTransform(); // Atualiza a posição do track
      }
    },
    updateTransform() {
      // Atualiza a posição do track (a translação horizontal)
      this.translateX =
        -(this.currentIndex * (this.slideWidth + this.spaceBetween));
      // Calcula a nova posição do track com base no índice do slide atual,
      // na largura de cada slide e no espaço entre os slides
    },
  },
};
</script>

<style scoped>
.carousel-container {
  /* Contêiner do carrossel */
  width: 100%;
  max-width: 1200px; /* Largura máxima do contêiner */
  margin: 0 auto; /* Centraliza o contêiner horizontalmente */
  padding: 20px; /* Espaçamento interno */
  background-color: var(--card-bg); /* Cor de fundo */
  border-radius: 10px; /* Bordas arredondadas */
}

.carousel-title {
  /* Título do carrossel */
  font-size: 1.5rem; /* Tamanho da fonte */
  color: var(--text-color); /* Cor do texto */
  text-align: center; /* Alinha o texto ao centro */
  margin-bottom: 20px; /* Espaçamento inferior */
}

.carousel {
  /* Contêiner dos slides e botões de navegação */
  position: relative; /* Permite posicionar os botões de navegação */
  overflow: hidden; /* Esconde o conteúdo que excede as bordas */
  display: flex; /* Usa flexbox para alinhar os elementos */
  align-items: center; /* Alinha verticalmente os elementos */
}

.carousel-button {
  /* Botões de navegação */
  background-color: rgba(0, 0, 0, 0.5); /* Cor de fundo */
  color: #fff; /* Cor do texto */
  border: none; /* Remove a borda */
  border-radius: 50%; /* Transforma em círculo */
  width: 40px; /* Largura */
  height: 40px; /* Altura */
  font-size: 1.2rem; /* Tamanho da fonte */
  cursor: pointer; /* Altera o cursor ao passar o mouse */
  position: absolute; /* Posiciona o botão absolutamente */
  top: 50%; /* Posiciona o botão verticalmente no centro */
  transform: translateY(-50%); /* Ajusta o alinhamento vertical */
  z-index: 10; /* Garante que o botão fique acima dos outros elementos */
  transition: background-color 0.3s ease; /* Transição suave na cor de fundo */
}

.carousel-button:hover {
  /* Estilo ao passar o mouse sobre o botão */
  background-color: rgba(0, 0, 0, 0.8); /* Cor de fundo mais escura */
}

.carousel-button.prev {
  /* Botão "Anterior" */
  left: 10px; /* Posiciona o botão à esquerda */
}

.carousel-button.next {
  /* Botão "Próximo" */
  right: 10px; /* Posiciona o botão à direita */
}

.carousel-track {
  /* Contêiner dos slides que se move horizontalmente */
  display: flex; /* Usa flexbox para alinhar os slides horizontalmente */
  transition: transform 0.5s ease-in-out; /* Transição suave na translação */
  padding: 10px 0; /* Espaçamento vertical */
}

.carousel-slide {
  /* Cada slide */
  width: 250px; /* Largura */
  margin-right: 20px; /* Espaçamento à direita */
  text-align: center; /* Alinha o texto ao centro */
  flex-shrink: 0; /* Impede que os slides encolham */
  display: flex; /* Usa flexbox */
  flex-direction: column; /* Organiza os elementos verticalmente */
  align-items: center; /* Centraliza os elementos horizontalmente */
}

.slide-image {
  /* Imagem do slide */
  width: 250px; /* Largura fixa igual ao slideWidth */
  height: 375px; /* Altura fixa com proporção 2:3 (padrão de pôsteres de filme) */
  object-fit: cover; /* Mantém a proporção da imagem cobrindo todo o espaço */
  border-radius: 8px; /* Bordas arredondadas */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Sombra */
  margin-bottom: 10px;
}

.slide-details {
  /* Informações do slide */
  display: flex; /* Usa flexbox para alinhar os elementos */
  justify-content: space-between; /* Distribui os elementos horizontalmente */
  color: var(--secondary-text); /* Cor do texto */
  margin-top: 10px; /* Espaçamento superior */
  width: 100%; /* Garante que o container ocupe toda a largura */
  padding: 0 10px; /* Adiciona padding horizontal */
}

.slide-details span {
  /* Cada informação do slide */
  font-size: 0.9rem; /* Tamanho da fonte */
  display: flex; /* Usa flexbox para alinhar os elementos */
  align-items: center; /* Alinha verticalmente os elementos */
  gap: 5px; /* Espaçamento entre os elementos */
  background-color: var(--hover-bg); /* Fundo semi-transparente */
  padding: 5px 10px; /* Padding interno */
  border-radius: 15px; /* Bordas arredondadas */
  transition: all 0.3s ease; /* Transição suave */
}

.slide-details span:hover {
  background-color: var(--header-bg); /* Fundo mais escuro no hover */
  color: var(--text-color); /* Texto mais claro no hover */
}

.slide-rating {
  color: #ffd700; /* Cor dourada para a avaliação */
}

.slide-genre {
  color: #00bfff; /* Cor azul clara para o gênero */
}

/* Ajuste para alinhamento horizontal */
.carousel-indicators {
  /* Contêiner dos indicadores de navegação */
  display: flex; /* Usa flexbox para alinhar os elementos */
  justify-content: center; /* Centraliza os elementos horizontalmente */
  margin-top: 20px; /* Espaçamento superior */
  align-items: center;
}

.indicator-button {
  /* Cada indicador de navegação */
  background-color: var(--border-color); /* Cor de fundo */
  border: none; /* Remove a borda */
  border-radius: 50%; /* Transforma em círculo */
  width: 10px; /* Largura */
  height: 10px; /* Altura */
  margin: 0 5px; /* Espaçamento horizontal */
  cursor: pointer; /* Altera o cursor ao passar o mouse */
  transition: background-color 0.3s ease; /* Transição suave na cor de fundo */
}

.indicator-button.active {
  /* Estilo do indicador ativo */
  background-color: var(--text-color); /* Cor de fundo mais clara */
}
</style>