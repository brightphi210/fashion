import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { Link } from 'react-router-dom';
// import { useGetNotifications } from '../../hooks/mutations/allMutation';
// import { useProfile } from '../../hooks/mutations/auth';

interface DashboardNavbarProps {
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
}

const DashboardNavbar = ({ onToggleSidebar }: DashboardNavbarProps) => {

    // const { profile, isLoading } = useProfile()
    // const userProfile = profile?.data || {}
    const userProfile = '' as any
    // const { notifications: notificationsData, isLoading: isNotificationsLoading } = useGetNotifications();
    // const notifications = notificationsData?.data?.notifications || [];
    const notifications = '' as any
    // console.log('notificationsData', notificationsData?.data)
    return (
        <div className='h-14 bg-white text-black px-4 md:px-8 flex items-center justify-between fixed top-0 left-0 md:left-60 right-0 z-20 shadow-sm'>
            {/* Mobile Menu Button - Only visible on mobile */}
            <button
                onClick={onToggleSidebar}
                className='md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors'
            >
                <HiOutlineMenuAlt2 className='w-6 h-6 text-neutral-800' />
            </button>

            {/* Spacer for desktop */}
            <div className='hidden md:block flex-1'></div>

            {/* Right Side - Icons and Profile */}
            <div className='flex items-center gap-3 md:gap-4 ml-auto'>
                {/* Notification Icon */}
                <Link to="/dashboard/notifications" className=''>
                    <button className='p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors relative'>
                        <IoMdNotificationsOutline className='w-5 h-5 md:w-6 md:h-6 text-neutral-800' />
                        {/* {!isNotificationsLoading && notifications.length > 0 && (
                            <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                        )} */}
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default DashboardNavbar