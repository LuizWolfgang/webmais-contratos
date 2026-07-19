import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginPage } from './LoginPage';

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>,
  );
}

describe('LoginPage', () => {
  it('renderiza os campos de usuário, senha e o botão de entrar', () => {
    renderLoginPage();

    expect(screen.getByText('Gestão de Contratos')).toBeInTheDocument();
    expect(screen.getByLabelText('Usuário')).toHaveValue('admin');
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });
});
