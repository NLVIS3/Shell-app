import './ui.css';

export function UiApp() {
  return (
    <div className="ui-container">
      <h2>RLG UI</h2>
      <p>
        The <strong>UI Architecture (RLG)</strong> uses module federation to
        load independently hosted microfrontends into Angular hosts. It is
        responsible for presentational and user-interface components.
      </p>
      <div className="backend-section">
        <div className="backend-item">
          <h4>Key UI Tech Stack</h4>
          <ul className="service-list">
            <li>
              <strong>Framework:</strong> React with TypeScript and reusable
              functional components
            </li>
            <li>
              <strong>Styling:</strong> CSS with a consistent design system
            </li>
            <li>
              <strong>Components:</strong> Reusable UI components for a
              consistent look and feel
            </li>
            <li>
              <strong>Integration:</strong> Module Federation for loading into
              the Angular shell
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
