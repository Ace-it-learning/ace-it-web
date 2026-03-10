import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mocks for JSDOM
window.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();
