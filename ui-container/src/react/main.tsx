import { createRoot } from 'react-dom/client';
import { UiApp } from './UiApp';

const container = document.getElementById('root');
if (!container) {
  throw new Error('React UI root element was not found.');
}

createRoot(container).render(<UiApp />);
