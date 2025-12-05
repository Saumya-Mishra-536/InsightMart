import React from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
    return (
        <div className={`card ${hover ? 'hover-scale' : ''} ${className}`} {...props}>
            {children}
        </div>
    );
}
