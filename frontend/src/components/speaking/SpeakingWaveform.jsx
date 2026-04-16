import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

const SpeakingWaveform = ({ isRecording, onReady }) => {
    const waveformRef = useRef(null);
    const wavesurfer = useRef(null);
    const record = useRef(null);

    useEffect(() => {
        if (!waveformRef.current) return;

        // Initialize wavesurfer
        wavesurfer.current = WaveSurfer.create({
            container: waveformRef.current,
            waveColor: '#6366f1', // Indigo 500
            progressColor: '#4f46e5', // Indigo 600
            cursorColor: 'transparent',
            barWidth: 2,
            barRadius: 3,
            responsive: true,
            height: 60,
            normalize: true,
            partialRender: true
        });

        // Initialize recording plugin
        record.current = wavesurfer.current.registerPlugin(RecordPlugin.create({
            scrollingWaveform: true,
            renderRecordedAudio: true
        }));

        if (onReady) onReady(record.current);

        return () => {
            if (wavesurfer.current) wavesurfer.current.destroy();
        };
    }, []);

    useEffect(() => {
        if (!record.current) return;

        if (isRecording) {
            record.current.startRecording();
        } else {
            if (record.current.isRecording()) {
                record.current.stopRecording();
            }
        }
    }, [isRecording]);

    return (
        <div className="w-full bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-indigo-100 shadow-inner overflow-hidden">
            <div ref={waveformRef} className="w-full" />
            {!isRecording && !wavesurfer.current?.decodedData && (
                <div className="flex justify-center items-center h-[60px] text-gray-400 text-xs font-medium italic animate-pulse">
                    Visualizer ready... Press record to see your voice ribbon
                </div>
            )}
        </div>
    );
};

export default SpeakingWaveform;
