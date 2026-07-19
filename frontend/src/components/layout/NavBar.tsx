import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
  }`;

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-navy">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold text-white">
            WebMais <span className="font-normal text-gray-400">Contratos</span>
          </span>
          <nav className="flex gap-2">
            <NavLink to="/" end className={linkClasses}>
              Contratos
            </NavLink>
            <NavLink to="/clients" className={linkClasses}>
              Clientes
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-400 sm:inline">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
