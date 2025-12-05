import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

export default function Layout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userRole = user?.role || 'customer';

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="layout">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                userRole={userRole}
            />
            <div className={`main-content-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <Header toggleSidebar={toggleSidebar} user={user} />
                <main className="main-content">
                    {children}
                </main>
            </div>
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}
        </div>
    );
}
