import { useState } from 'react';
import { FiLogOut, FiX } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navigationLink } from '../data/sideBar';

interface SideBarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideBar = ({ isOpen = true, onClose }: SideBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('sxiAccessToken');
    navigate('/login');
  };

  // Close sidebar on mobile when clicking a link
  const handleLinkClick = () => {
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='md:hidden fixed inset-0 bg-black/80 bg-opacity-50 z-30'
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`bg-black h-screen pt-6 flex flex-col fixed left-0 top-0 overflow-y-auto transition-all duration-300 ease-in-out z-40 ${isCollapsed ? 'w-20' : 'w-60'
          } ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden absolute right-4 top-4 text-white p-1 hover:bg-[#1E6FFF] rounded transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {/* Logo/Brand Area */}
        <div className='px-5 mb-8'>
          <Link to={'/'}>
            <h2 className={`text-white text-xl font-semibold transition-opacity duration-300`}>
              6ix
            </h2>
          </Link>
        </div>

        {/* Main Menu Section */}
        <div className='mb-10'>
          <p className={`text-blue-200 text-xs font-medium px-5 mb-3 tracking-wider transition-opacity duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'
            }`}>
            Main Menu
          </p>
          <nav>
            <ul className='space-y-1'>
              {navigationLink.map((link) => (
                <li key={link.id}>
                  <Link
                    to={link.path}
                    onClick={handleLinkClick}
                    className={`${location.pathname === link.path
                      ? 'bg-white text-[#1C5267] font-medium'
                      : 'text-white hover:bg-[#1E6FFF]'
                      } py-3 px-5 flex items-center gap-3 transition-colors ${isCollapsed ? 'justify-center' : ''
                      }`}
                    title={isCollapsed ? link.name : ''}
                  >
                    <span className='text-xl'>{link.icon}</span>
                    <span className={`text-sm transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                      }`}>
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Spacer */}
        <div className='grow'></div>

        {/* Logout Button */}
        <div className='px-5 pb-8'>
          <button
            onClick={handleLogout}
            className={`bg-white cursor-pointer text-[#1C5267] w-full py-3 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-sm ${isCollapsed ? 'justify-center px-0' : 'justify-center'
              }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <FiLogOut className='w-5 h-5' />
            <span className={`font-medium text-sm transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default SideBar;