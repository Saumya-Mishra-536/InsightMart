import React from 'react';

export default function Button({
    children,
    variant = 'primary',
    className = '',
    isLoading = false,
    ...props
}) {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span style={{ marginRight: '8px' }}>Loading...</span>
            ) : null}
            {children}
        </button>
    );
}
