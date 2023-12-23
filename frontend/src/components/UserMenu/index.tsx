import { isMobile } from 'react-device-detect';
import { AUTH_TOKEN, AUTH_USER } from '../../utils/constants';
import { ReactNode, useState } from 'react';
import { userFromStorage } from '../../utils/request';
import { Person } from '@phosphor-icons/react';

interface UserMenuProps {
  children: ReactNode;
}

export default function UserMenu({ children }: UserMenuProps) {
  if (isMobile) return <>{children}</>;
  return (
    <div className='w-auto h-auto'>
      <UserButton />
      {children}
    </div>
  );
}

function useLoginMode() {
  const user = !!window.localStorage.getItem(AUTH_USER);
  const token = !!window.localStorage.getItem(AUTH_TOKEN);

  if (user && token) return 'multi';
  if (!user && token) return 'single';
  return null;
}

function userDisplay() {
  const user = userFromStorage();
  return user?.username?.slice(0, 2) || 'AA';
}

function UserButton() {
  const [showMenu, setShowMenu] = useState(false);
  const mode = useLoginMode();

  if (mode === null) return null;

  return (
    <div className='absolute top-9 right-10 w-fit h-fit z-99'>
      <button
        onClick={() => setShowMenu(!showMenu)}
        type='button'
        className='uppercase transition-all duration-300 w-[35px] h-[35px] text-base font-semibold rounded-full flex items-center bg-sidebar-button hover:bg-menu-item-selected-gradient justify-center text-white p-2 hover:border-slate-100 hover:border-opacity-50 border-transparent border'
      >
        {mode === 'multi' ? userDisplay() : <Person size={14} />}
      </button>
    </div>
  );
}
