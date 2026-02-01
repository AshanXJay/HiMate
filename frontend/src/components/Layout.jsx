import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login';

    if (isAuthPage) {
        return <Outlet />;
    }

    return (
        <div className="flex flex-col" style={{ minHeight: '100vh' }}>
            {/* <Navbar /> */}
            <main className="container flex-grow" style={{ paddingBottom: '3rem', paddingTop: '2rem' }}>
                <Outlet />
            </main>
            <footer>
                &copy; {new Date().getFullYear()} HiMate - Hostel Allocation System
            </footer>
        </div>
    );
};

export default Layout;
