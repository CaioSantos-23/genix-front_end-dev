<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <img src="@/assets/logo.png" alt="Logo" class="logo">
        <h1>Criar uma conta</h1>
        <p>Junte-se a nós e comece sua jornada</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Nome</label>
          <input 
            type="text" 
            id="name" 
            v-model="name" 
            required 
            placeholder="Digite seu nome"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Digite seu email"
            class="form-input"
            :class="{ 'error': emailError }" 
            @blur="validateEmail"
          >
          <!-- Mensagem de erro para o e-mail -->
          <p v-if="emailError" class="error-message">{{ emailError }}</p>
        </div>

        
        
        <div class="form-group">
          <label for="password">Senha</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Digite sua senha"
              class="form-input"
              :class="{ 'error': !isPasswordValid && password }"
              minlength="6"
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="password-requirements">
            <p>A senha deve conter:</p>
            <ul>
              <li :class="{ 'met': passwordRequirements?.hasUpperCase }">
                <i :class="passwordRequirements?.hasUpperCase ? 'fas fa-check' : 'fas fa-times'"></i>
                Pelo menos uma letra maiúscula
              </li>
              <li :class="{ 'met': passwordRequirements?.hasNumber }">
                <i :class="passwordRequirements?.hasNumber ? 'fas fa-check' : 'fas fa-times'"></i>
                Pelo menos um número
              </li>
              <li :class="{ 'met': passwordRequirements?.hasSpecialChar }">
                <i :class="passwordRequirements?.hasSpecialChar ? 'fas fa-check' : 'fas fa-times'"></i>
                Pelo menos um caractere especial (!@#$%^&*(),.?&quot;:{}|&lt;&gt;)
              </li>
              <li :class="{ 'met': passwordRequirements?.hasMinLength }">
                <i :class="passwordRequirements?.hasMinLength ? 'fas fa-check' : 'fas fa-times'"></i>
                Mínimo de 6 caracteres
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar senha</label>
          <div class="password-input">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required 
              placeholder="Confirme sua senha"
              class="form-input"
              :class="{ 'error': !passwordsMatch && confirmPassword }"
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <p v-if="!passwordsMatch && confirmPassword" class="error-message">
            As senhas não coincidem
          </p>
        </div>

        <div class="form-options">
          <label class="terms">
            <input type="checkbox" v-model="acceptTerms" required>
            <span>Eu concordo com os <router-link to="/terms">Termos de Serviço</router-link> e <router-link to="/privacy">Política de Privacidade</router-link></span>
          </label>
        </div>

        <button 
          type="submit" 
          class="register-button" 
          :disabled="isLoading || !passwordsMatch || !acceptTerms || !isPasswordValid"
        >
          <span v-if="!isLoading">Criar conta</span>
          <i v-else class="fas fa-spinner fa-spin"></i>
        </button>

        <div class="login-link">
          Já tem uma conta? 
          <router-link to="/login">Faça login</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '@/services/authService';

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter();
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const acceptTerms = ref(false);
    const isLoading = ref(false);
    const emailError = ref(''); // Para armazenar a mensagem de erro do e-mail

    // Regex simples para validação de e-mail
    // Fonte: https://emailregex.com/ (HTML5 spec)
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const isEmailValid = computed(() => {
      if (!email.value) return true; // Não mostra erro se o campo estiver vazio ainda (o 'required' pega isso)
      return EMAIL_REGEX.test(email.value);
    });

    // Função para validar o e-mail e definir a mensagem de erro
    // Chamada no 'blur' do input de e-mail
    const validateEmail = () => {
      if (email.value && !isEmailValid.value) {
        emailError.value = 'Por favor, insira um endereço de e-mail válido.';
      } else {
        emailError.value = ''; // Limpa o erro se for válido ou vazio
      }
    };

    const passwordRequirements = computed(() => {
      const pwd = password.value || '';
      return {
        hasUpperCase: /[A-Z]/.test(pwd),
        hasNumber: /[0-9]/.test(pwd),
        hasSpecialChar: /[^A-Za-z0-9]/.test(pwd),
        hasMinLength: pwd.length >= 6
      };
    });

    const passwordsMatch = computed(() => {
      return password.value === confirmPassword.value;
    });

    const isPasswordValid = computed(() => {
      const reqs = passwordRequirements.value;
      return reqs.hasUpperCase && reqs.hasNumber && reqs.hasSpecialChar && reqs.hasMinLength;
    });

    const handleRegister = async () => {
      // Valida o e-mail uma última vez antes de submeter
      validateEmail(); 
      if (!isEmailValid.value && email.value) { // Verifica se o e-mail tem um valor e é inválido
        // Não prossegue se o e-mail for inválido e não estiver vazio
        return; 
      }

      if (!isPasswordValid.value) {
        // Opcional: focar no campo de senha ou mostrar um alerta mais geral sobre o formulário
        alert('A senha não atende aos requisitos mínimos.');
        return;
      }
      if (!passwordsMatch.value) {
        alert('As senhas não coincidem.'); // Deveria ser pego pelo :disabled, mas uma checagem extra não faz mal
        return;
      }
      if (!acceptTerms.value) {
        alert('Você deve aceitar os Termos de Serviço e Política de Privacidade.');
        return;
      }

      isLoading.value = true;
      try {
        const result = await authService.register({
          name: name.value,
          email: email.value,
          password: password.value
        });
        
        if (!result.success) {
          // Mostra a mensagem de erro específica do backend, se houver
          alert(result.message || 'Falha no registro. Verifique os dados e tente novamente.');
          throw new Error(result.message || 'Falha no registro (serviço).');
        }
        
        alert(result.message || 'Registro bem-sucedido! Por favor, faça login.');
        router.push('/login');
      } catch (error) {
        console.error('Erro no registro (handleRegister):', error.message);
        // O alert() acima já mostra a mensagem de erro do 'result.message'
        // Se for um erro de rede ou outro, o 'result.message' pode não existir.
        if (!error.message.includes('Falha no registro')) { // Evita alert duplicado
            alert('Ocorreu um erro durante o registro. Tente novamente mais tarde.');
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      name,
      email,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      acceptTerms,
      isLoading,
      passwordsMatch,
      handleRegister,
      passwordRequirements,
      isPasswordValid,
      isEmailValid,    // Expor para o template (para o :disabled)
      emailError,      // Expor para mostrar a mensagem de erro
      validateEmail    // Expor para usar no @blur
    };
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  padding: 1rem;
}

.register-box {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  height: 60px;
  margin-bottom: 1rem;
}

.register-header h1 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.register-header p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.form-input.error {
  border-color: var(--error-color);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
}

.password-hint {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.password-requirements {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--input-bg);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.password-requirements p {
  margin: 0 0 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-color);
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
}

.password-requirements li i {
  font-size: 0.9rem;
}

.password-requirements li.met {
  color: #4caf50;
}

.password-requirements li.met i {
  color: #4caf50;
}

.error-message {
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-options {
  margin-bottom: 1.5rem;
}

.terms {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.4;
}

.terms input {
  margin-top: 0.25rem;
}

.terms a {
  color: var(--primary-color);
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}

.register-button {
  width: 100%;
  padding: 0.875rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.register-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-box {
    padding: 1.5rem;
  }

  .register-header h1 {
    font-size: 1.5rem;
  }

  .terms {
    font-size: 0.85rem;
  }
}
</style> 