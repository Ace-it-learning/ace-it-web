import React from 'react';

const Logo = ({ className = "h-10 w-auto" }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            className={className}
            width="40"
            height="40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="brandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF8C42" />
                    <stop offset="100%" stopColor="#FF6600" />
                </linearGradient>
            </defs>
            {/* Hand-tuned robotic face: Thinner border, smooth curves, and horizontal hair tail */}
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M50 10C72.1 10 90 27.9 90 50C90 72.1 72.1 90 50 90C27.9 90 10 72.1 10 50C10 41.5 13 33.5 17 27C12 18 6 13 2 11C18 11 28 13 34 16C39 12 44 10 50 10ZM50 18C32.3 18 18 32.3 18 50C18 67.7 32.3 82 50 82C67.7 82 82 67.7 82 50C82 32.3 67.7 18 50 18Z"
                fill="url(#brandGradient)"
            />
            {/* Balanced Eye Positions */}
            <ellipse cx="48" cy="50" rx="8" ry="12" fill="url(#brandGradient)" />
            <ellipse cx="70" cy="50" rx="6" ry="10" fill="url(#brandGradient)" />
        </svg>
    );
};

export default Logo;
