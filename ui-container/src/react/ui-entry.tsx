import { createRoot, Root } from 'react-dom/client';
import { UiApp } from './UiApp';

export function mountUi(container: HTMLElement): () => void {
  const root: Root = createRoot(container);
  root.render(<UiApp />);
  return () => root.unmount();
}
