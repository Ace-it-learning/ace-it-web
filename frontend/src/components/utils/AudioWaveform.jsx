import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

/**
 * AudioWaveform Component
 * A modular, high-fidelity waveform visualizer for playback.
 * 
 * @param {string} audioSrc - Base64 or URL of the audio.
 * @param {boolean} isPlaying - Current playback state.
 * @param {number} height - Canvas height.
 * @param {string} waveColor - Color of the background wave.
 * @param {string} progressColor - Color of the played portion.
 */
const AudioWaveform = ({ 
    audioSrc, 
    isPlaying, 
    height = 60, 
    waveColor = '#e2e8f0', 
    progressColor = '#6366f1' 
}) => {
    const containerRef = useRef(null);
    const wavesurfer = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor: waveColor,
            progressColor: progressColor,
            cursorColor: 'transparent',
            barWidth: 2,
            barRadius: 3,
            responsive: true,
            height: height,
            normalize: true,
            interact: false // Prevent user from skipping in exam mode if desired
        });

        if (audioSrc) {
            wavesurfer.current.load(audioSrc);
        }

        return () => {
            if (wavesurfer.current) wavesurfer.current.destroy();
        };
    }, []);

    // Handle audio source updates
    useEffect(() => {
        if (wavesurfer.current && audioSrc) {
            wavesurfer.current.load(audioSrc);
        }
    }, [audioSrc]);

    // Sync playing state
    useEffect(() => {
        if (!wavesurfer.current) return;
        
        if (isPlaying) {
            // If wavesurfer isn't already playing, play it
            if (!wavesurfer.current.isPlaying()) {
                wavesurfer.current.play();
            }
        } else {
            if (wavesurfer.current.isPlaying()) {
                wavesurfer.current.pause();
            }
        }
    }, [isPlaying]);

    return (
        <div className="w-full">
            <div ref={containerRef} className="w-full transition-opacity duration-500" />
        </div>
    );
};

export default AudioWaveform;
