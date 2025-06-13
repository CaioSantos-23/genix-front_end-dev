<template>
  <!-- Define o elemento raiz do componente, um rodapé (footer) -->
  <footer class="footer" role="contentinfo">
    <!-- Adiciona classes CSS para estilização e define o papel do elemento para acessibilidade -->
    <!-- `role="contentinfo"` indica que este elemento contém informações sobre o conteúdo do site -->
    
    <div class="footer-content">
      <!-- Contêiner para o conteúdo do rodapé, centralizado e com largura máxima -->
      <div class="footer-social" aria-label="Redes sociais">
        <!-- Contêiner para os links das redes sociais -->
        <!-- `aria-label` fornece uma descrição para leitores de tela -->
        <router-link
          to="/team"
          class="github-link"
          aria-label="Ver nossa equipe no GitHub"
        >
          <i class="fab fa-github"></i>
        </router-link>
      </div>
      
      <div class="footer-copyright">
        <!-- Contêiner para a mensagem de copyright -->
        © {{ currentYear }} Meu Catálogo de Filmes. Todos os direitos reservados.
        <!-- Exibe a mensagem de copyright com o ano atual -->
        <!-- `{{ currentYear }}` é uma interpolação que exibe o valor da propriedade `currentYear` -->
      </div>
    </div>
  </footer>
</template>
  
  <script>
export default {
  // Define as opções do componente
  name: 'FilmeFooter', // Nome do componente
  data() {
    // Define os dados reativos do componente
    return {
      currentYear: new Date().getFullYear()
      // Define a propriedade `currentYear` com o ano atual
      // `new Date()` cria um objeto Date com a data atual
      // `getFullYear()` retorna o ano atual
    }
  }
};
</script>
  
  <style scoped>
/* Variáveis CSS */
.footer {
  background-color: var(--header-bg);
  color: var(--text-color);
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid var(--border-color);
  margin-top: auto;
  width: 100%;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Navegação */
.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.footer-links a {
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: var(--primary-color);
  transform: translateY(-2px);
}

/* Redes sociais */
.footer-social {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 1.5rem;
}

.footer-social a {
  color: var(--secondary-text);
  transition: all 0.2s ease-in-out;
  padding: 0.5rem;
  border-radius: 50%;
}

.footer-social a:hover {
  color: var(--primary-color);
  transform: translateY(-2px);
  background-color: var(--hover-bg);
}

.github-link i {
  font-size: 1.8rem;
}

/* Copyright */
.footer-copyright {
  font-size: 0.8rem;
  color: var(--secondary-text);
}

@media (max-width: 768px) {
  .footer {
    padding: 1rem;
  }
  
  .footer-links {
    gap: 1rem;
  }
  
  .footer-social {
    gap: 1rem;
  }
}
</style>