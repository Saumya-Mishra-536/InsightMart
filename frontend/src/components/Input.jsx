import React from 'react';

export default function Input({
    label,
    id,
    error,
    className = '',
    rightElement,
    ...props
}) {
    return (
        <div className={`input-group ${className}`}>
            {label && (
                <label htmlFor={id} className="input-label">
                    {label}
                </label>
            )}
            <div className="input-wrapper" style={{ position: 'relative' }}>
                <input
                    id={id}
                    className={`input-field ${error ? 'border-red-500' : ''}`}
                    style={rightElement ? { paddingRight: '40px' } : {}}
                    {...props}
                />
                {rightElement && (
                    <div className="input-right-element" style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <span style={{ color: 'var(--error)', fontSize: '0.85rem', marginTop: '4px', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
}
