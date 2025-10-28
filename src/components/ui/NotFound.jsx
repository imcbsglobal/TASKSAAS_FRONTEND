import React from 'react';

export default function NotFound() {
    const containerStyle = {
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f7f9',
    };

    const cardStyle = {
        textAlign: 'center',
        padding: '32px',
        borderRadius: '8px',
        background: '#ffffff',
        boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        maxWidth: '720px',
        width: '90%',
    };

    const codeStyle = {
        fontSize: '8rem',
        lineHeight: 1,
        margin: 0,
        color: '#111827',
    };

    const msgStyle = {
        marginTop: '8px',
        color: '#4b5563',
        fontSize: '1.1rem',
    };

    const linkStyle = {
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 18px',
        fontSize: '1rem',
        color: '#fff',
        background: '#2563eb',
        borderRadius: '6px',
        textDecoration: 'none',
        boxShadow: '0 3px 8px rgba(37,99,235,0.24)',
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h1 style={codeStyle}>404</h1>
                <p style={msgStyle}>Page not found</p>
                <a href="/" style={linkStyle} aria-label="Go to home">
                    Go home
                </a>
            </div>
        </div>
    );
}