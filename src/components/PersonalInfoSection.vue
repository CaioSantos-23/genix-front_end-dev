<template>
  <div class="profile-section">
    <h3>Informações Pessoais</h3>
    <div class="form-group">
      <label for="email">E-mail</label>
      <div class="input-with-button">
        <input type="email" id="email" v-model="localEmail" :disabled="!emailEditingEnabled" />
        <button @click="handleEmailEdit" class="edit-btn">
          <i :class="['fas', emailEditingEnabled ? 'fa-check' : 'fa-pen']"></i>
        </button>
      </div>
    </div>

    <div class="form-group">
      <label for="current-password">Senha Atual</label>
      <div class="input-with-button">
        <input
          type="password"
          id="current-password"
          v-model="localCurrentPassword"
          :disabled="!passwordEditingEnabled"
        />
      </div>
    </div>

    <div v-if="passwordEditingEnabled" class="form-group">
      <label for="new-password">Nova Senha</label>
      <div class="input-with-button">
        <input
          type="password"
          id="new-password"
          v-model="localNewPassword"
        />
      </div>
    </div>

    <div v-if="passwordEditingEnabled" class="form-group">
      <label for="confirm-password">Confirmar Nova Senha</label>
      <div class="input-with-button">
        <input
          type="password"
          id="confirm-password"
          v-model="localConfirmPassword"
        />
      </div>
    </div>

    <div class="password-edit-controls">
      <button v-if="!passwordEditingEnabled" @click="$emit('start-password-edit')" class="edit-password-btn">
        <i class="fas fa-key"></i>
        Alterar Senha
      </button>
      <div v-else class="password-buttons">
        <button 
          @click="handlePasswordSave" 
          class="save-btn"
          :disabled="isLoading"
        >
          <i class="fas fa-check"></i>
          {{ isLoading ? 'Salvando...' : 'Salvar' }}
        </button>
        <button 
          @click="$emit('cancel-password-edit')" 
          class="cancel-btn"
          :disabled="isLoading"
        >
          <i class="fas fa-times"></i>
          Cancelar
        </button>
      </div>
    </div>
    
    <div v-if="validationErrors.email || validationErrors.password" class="validation-error">
      <i class="fas fa-exclamation-circle"></i>
      {{ validationErrors.email || validationErrors.password }}
    </div>

    <div v-if="isLoading" class="is-loading">
      <div class="loading-spinner"></div>
      Salvando alterações...
    </div>
  </div>
</template>

<script>
import { userService } from '@/services/userService';

export default {
  name: 'PersonalInfoSection',
  props: {
    email: {
      type: String,
      required: true
    },
    emailEditingEnabled: {
      type: Boolean,
      default: false
    },
    currentPassword: {
      type: String,
      required: true
    },
    newPassword: {
      type: String,
      required: true
    },
    confirmPassword: {
      type: String,
      required: true
    },
    passwordEditingEnabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localEmail: this.email,
      localCurrentPassword: this.currentPassword,
      localNewPassword: this.newPassword,
      localConfirmPassword: this.confirmPassword,
      validationErrors: {
        email: '',
        password: ''
      },
      isLoading: false
    }
  },
  methods: {
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    validatePassword(password) {
      if (password.length < 8) {
        return 'A senha deve ter pelo menos 8 caracteres';
      }
      if (!/[A-Z]/.test(password)) {
        return 'A senha deve conter pelo menos uma letra maiúscula';
      }
      if (!/[a-z]/.test(password)) {
        return 'A senha deve conter pelo menos uma letra minúscula';
      }
      if (!/[0-9]/.test(password)) {
        return 'A senha deve conter pelo menos um número';
      }
      return '';
    },
    async handleEmailEdit() {
      if (this.emailEditingEnabled) {
        if (!this.validateEmail(this.localEmail)) {
          this.validationErrors.email = 'Email inválido';
          return;
        }
        this.isLoading = true;
        try {
          await userService.updateProfile({ email: this.localEmail });
          this.$emit('save-email', this.localEmail);
          this.validationErrors.email = '';
        } catch (error) {
          this.validationErrors.email = error.message;
        } finally {
          this.isLoading = false;
        }
      } else {
        this.$emit('toggle-email-edit');
      }
    },
    async handlePasswordSave() {
      if (this.localNewPassword !== this.localConfirmPassword) {
        this.validationErrors.password = 'As senhas não coincidem';
        return;
      }
      const passwordError = this.validatePassword(this.localNewPassword);
      if (passwordError) {
        this.validationErrors.password = passwordError;
        return;
      }
      this.isLoading = true;
      try {
        await userService.updatePassword({
          currentPassword: this.localCurrentPassword,
          newPassword: this.localNewPassword
        });
        this.$emit('save-password', {
          currentPassword: this.localCurrentPassword,
          newPassword: this.localNewPassword
        });
        this.validationErrors.password = '';
      } catch (error) {
        this.validationErrors.password = error.message;
      } finally {
        this.isLoading = false;
      }
    }
  },
  watch: {
    email(newVal) {
      this.localEmail = newVal;
    },
    currentPassword(newVal) {
      this.localCurrentPassword = newVal;
    },
    newPassword(newVal) {
      this.localNewPassword = newVal;
    },
    confirmPassword(newVal) {
      this.localConfirmPassword = newVal;
    }
  }
}
</script>

<style scoped>
.profile-section {
  background-color: var(--header-bg);
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
}

.profile-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(to right, #4CAF50, #45a049);
}

.profile-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.profile-section h3 {
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
  color: var(--text-color);
  font-weight: 600;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-section h3::before {
  content: '\f007';
  font-family: 'Font Awesome 5 Free';
  font-weight: 900;
  font-size: 1.2rem;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 0.8rem;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--secondary-text);
  font-size: 0.9rem;
  font-weight: 500;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.input-with-button input {
  flex: 1;
  min-width: 200px;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.input-with-button input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.edit-btn {
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.edit-btn:hover {
  background: var(--hover-bg);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.password-edit-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
}

.password-buttons {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.edit-password-btn,
.save-btn,
.cancel-btn {
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex: 1;
}

.edit-password-btn {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  width: auto;
  min-width: 140px;
}

.edit-password-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: rgba(var(--primary-rgb), 0.1);
}

.save-btn {
  background: var(--primary-color);
  border: 2px solid var(--primary-color);
  color: white;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.save-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.save-btn:hover::before {
  width: 200%;
  height: 200%;
}

.save-btn:hover {
  background: var(--primary-color-dark);
  border-color: var(--primary-color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.2);
}

.save-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.15);
}

.save-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: var(--primary-color);
  transform: none;
  box-shadow: none;
}

.save-btn i {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.cancel-btn {
  background: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-color);
}

.cancel-btn:hover {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
  transform: translateY(-2px);
}

.validation-error {
  color: var(--error-color);
  font-size: 0.9rem;
  margin-top: 0.75rem;
  padding: 0.8rem;
  background: rgba(var(--error-rgb), 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.validation-error i {
  color: var(--error-color);
  font-size: 1rem;
}

.is-loading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.8rem;
  margin-top: 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  font-weight: 500;
  opacity: 0.9;
}

.loading-spinner {
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .profile-section {
    padding: 1.2rem;
  }

  .input-with-button {
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-with-button input {
    width: 100%;
  }

  .edit-btn {
    width: 100%;
    padding: 0.8rem;
  }

  .password-edit-controls {
    margin-top: 1.2rem;
  }

  .password-buttons {
    flex-direction: column;
    gap: 0.75rem;
  }

  .edit-password-btn,
  .save-btn,
  .cancel-btn {
    width: 100%;
    padding: 1rem;
  }

  .is-loading {
    flex-direction: row;
    text-align: center;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-section {
    padding: 1rem;
    margin: 0.5rem;
  }

  .profile-section h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: 0.85rem;
  }

  .input-with-button input {
    padding: 0.7rem;
    font-size: 0.85rem;
  }

  .password-edit-controls {
    margin-top: 1rem;
  }

  .password-buttons {
    gap: 0.6rem;
  }

  .edit-password-btn,
  .save-btn,
  .cancel-btn {
    padding: 0.9rem;
  }

  .is-loading {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
}
</style> 