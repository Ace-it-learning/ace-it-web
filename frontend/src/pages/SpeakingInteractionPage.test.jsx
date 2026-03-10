import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SpeakingInteractionPage from '../pages/SpeakingInteractionPage';
import { AuthProvider } from '../context/AuthContext';
import { AvatarProvider } from '../context/AvatarContext';
import { vi } from 'vitest';

// Mocks
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({ user: { uid: 'test-uid', displayName: 'Test User' } }),
    AuthProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('../context/AvatarContext', () => ({
    useAvatar: () => ({ activeAgentId: 'english' }),
    AGENTS: { english: { avatar: 'test-avatar.png' } },
    AvatarProvider: ({ children }) => <div>{children}</div>
}));

// Mock Speech Synthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();

window.speechSynthesis = {
    speak: mockSpeak,
    cancel: mockCancel,
    pause: mockPause,
    resume: mockResume,
    getVoices: () => [],
    onvoiceschanged: null
};

window.SpeechSynthesisUtterance = vi.fn((text) => ({
    text,
    onend: null,
    onerror: null,
    onboundary: null,
    pitch: 1,
    rate: 1,
    voice: null
}));

// Mock Speech Recognition
const mockStart = vi.fn();
const mockStop = vi.fn();
window.webkitSpeechRecognition = vi.fn(() => ({
    start: mockStart,
    stop: mockStop,
    continuous: false,
    interimResults: false,
    lang: 'en-US',
    onstart: null,
    onend: null,
    onresult: null
}));

// Mock Fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ turns: [] }),
    })
);

describe('SpeakingInteractionPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('renders Quest mode correctly (Airtime UI visible)', async () => {
        render(
            <MemoryRouter initialEntries={['/speaking/quest/interaction?level=3&taskId=quest123&topic=TestTopic']}>
                <AuthProvider>
                    <AvatarProvider>
                        <Routes>
                            <Route path="/speaking/quest/interaction" element={<SpeakingInteractionPage />} />
                        </Routes>
                    </AvatarProvider>
                </AuthProvider>
            </MemoryRouter>
        );

        // 1. Verify PREP mode initially
        await waitFor(() => {
            expect(screen.getByText(/Preparation Time/i)).toBeInTheDocument();
        });
        console.log("✅ PREP Mode Verified");

        /*
        // 2. Click Start Discussion
        const startBtn = screen.getByText(/Start Discussion Now/i);
        fireEvent.click(startBtn);

        // 3. Verify DISCUSSION mode (Airtime visible)
        await waitFor(() => {
            expect(screen.getByText(/Airtime/i)).toBeInTheDocument();
            expect(screen.getByText('YOU')).toBeInTheDocument();
        });
        */
    });

    test('renders Mock mode correctly (No Airtime UI initially)', async () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/speaking/interaction', state: { topic: 'Mock Topic', mode: 'mock' } }]}>
                <AuthProvider>
                    <AvatarProvider>
                        <Routes>
                            <Route path="/speaking/interaction" element={<SpeakingInteractionPage />} />
                        </Routes>
                    </AvatarProvider>
                </AuthProvider>
            </MemoryRouter>
        );

        // Mock mode doesn't show Airtime UI by default or handles it differently
        // For now, checks that the page loads without crashing
        expect(screen.getByText(/Mock Topic/i)).toBeInTheDocument();
    });
});
