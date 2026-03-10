import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import WritingQuestPage from './WritingQuestPage';
import '@testing-library/jest-dom';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
    Loader2: () => <div data-testid="loader">Loading...</div>,
    PenTool: () => <div>PenTool</div>,
    Lightbulb: () => <div>Lightbulb</div>,
    Link: () => <div>Link</div>,
    CheckCircle: () => <div>CheckCircle</div>,
    Send: () => <div>Send</div>,
    Wand2: () => <div>Wand2</div>,
    AlertTriangle: () => <div>Alert</div>,
    BookOpen: () => <div>Book</div>,
    ArrowRight: () => <div>ArrowRight</div>
}));

// Mock Navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { topic: "Test Topic", textType: "Essay" } })
}));

describe('WritingQuestPage Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('Step 1: Renders Brainstorming Step initially', () => {
        act(() => {
            render(
                <MemoryRouter>
                    <WritingQuestPage />
                </MemoryRouter>
            );
        });

        expect(screen.getByText(/Writer's Studio/i)).toBeInTheDocument();
        expect(screen.getByText(/Test Topic/i)).toBeInTheDocument();
        expect(screen.getByText(/Miss Janie/i)).toBeInTheDocument();
    });

    test('Flow: Completes Brainstorming and moves to Drafting', async () => {
        act(() => {
            render(
                <MemoryRouter>
                    <WritingQuestPage />
                </MemoryRouter>
            );
        });

        const input = screen.getByPlaceholderText(/Type your idea here/i);
        const sendBtn = screen.getByText('Send').closest('button');

        // Send Point 1
        await act(async () => {
            fireEvent.change(input, { target: { value: "Social media causes anxiety." } });
            fireEvent.click(sendBtn);
            jest.advanceTimersByTime(2000); // Wait for mock AI
        });

        // Send Point 2 (Evidence)
        await act(async () => {
            fireEvent.change(input, { target: { value: "Studies show 50% increase in teen stress." } });
            fireEvent.click(sendBtn);
            jest.advanceTimersByTime(2000);
        });

        // Verify "Start Drafting" button appears
        await waitFor(() => {
            expect(screen.getByText(/Start Drafting/i)).toBeInTheDocument();
        });

        // Click to move to Draft
        await act(async () => {
            fireEvent.click(screen.getByText(/Start Drafting/i));
        });

        // Verify Drafting Step
        expect(screen.getByText(/Power Up Draft/i)).toBeInTheDocument();
        expect(screen.getByText(/Social media causes anxiety/i)).toBeInTheDocument(); // Saved point
    });

    test('Drafting: Power Up detects weak words', async () => {
        // Render directly at Step 2 state (requires refactor or full flow, doing full flow for integration test)
        act(() => {
            render(
                <MemoryRouter initialEntries={['/writing/quest']}>
                    <WritingQuestPage />
                </MemoryRouter>
            );
        });

        // Speed run Step 1
        const input = screen.getByPlaceholderText(/Type your idea here/i);
        const sendBtn = screen.getByText('Send').closest('button');

        await act(async () => {
            fireEvent.change(input, { target: { value: "P1" } }); fireEvent.click(sendBtn); jest.advanceTimersByTime(2000);
            fireEvent.change(input, { target: { value: "E1" } }); fireEvent.click(sendBtn); jest.advanceTimersByTime(2000);
            fireEvent.click(screen.getByText(/Start Drafting/i));
        });

        // Type weak text
        const textArea = screen.getByPlaceholderText(/Start writing here/i);
        fireEvent.change(textArea, { target: { value: "This is a good and big problem." } });

        // Click Power Up
        await act(async () => {
            fireEvent.click(screen.getByText(/Power Up Draft/i));
            jest.advanceTimersByTime(1500);
        });

        // Verify suggestions
        await waitFor(() => {
            expect(screen.getByText(/exemplary/i)).toBeInTheDocument(); // good -> exemplary
            expect(screen.getByText(/substantial/i)).toBeInTheDocument(); // big -> substantial
        });
    });

});
