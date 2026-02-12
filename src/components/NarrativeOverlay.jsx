import React from 'react';

// This component is used as a simple overlay wrapper.
// Most narrative text is handled directly in each scene component
// for tighter integration with GSAP timelines.

export default function NarrativeOverlay({ children }) {
    return (
        <div className="narrative-overlay">
            {children}
        </div>
    );
}
