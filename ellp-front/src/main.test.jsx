import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
	render: vi.fn(),
	createRoot: vi.fn(() => ({ render: mocks.render })),
}));

vi.mock('react-dom/client', () => ({ createRoot: mocks.createRoot }));
vi.mock('./App.jsx', () => ({ default: () => <div>App</div> }));

describe('bootstrap frontend', () => {
	it('monta a aplicação no elemento root', async () => {
		document.body.innerHTML = '<div id="root"></div>';
		await import('./main.jsx');
		expect(mocks.createRoot).toHaveBeenCalledWith(document.getElementById('root'));
		expect(mocks.render).toHaveBeenCalledOnce();
	});
});
