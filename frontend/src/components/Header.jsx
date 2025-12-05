import React from 'react';

export default function Header({ toggleSidebar, user }) {
    return (
        <header className="main-header">
            <button className="menu-btn" onClick={toggleSidebar}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <div className="header-right">
                <span className="user-greeting">
                    Welcome, <strong>{user?.name || 'User'}</strong>
                </span>
                <div className="avatar">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
            </div>
        </header>
    );
}
