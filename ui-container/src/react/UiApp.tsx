import { useState } from 'react';
import './ui.css';

interface UserDetails {
  userId: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

// Must match TOKEN_KEY in shell-app's AuthService (same page, same sessionStorage).
const TOKEN_KEY = 'rlg_access_token';
const API_URL = 'https://localhost:53344/api/Users';
const REQUEST_TIMEOUT_MS = 15000;

function formatDate(value?: string | null): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

export function UiApp() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserDetails[]>([]);

  async function loadUsers(): Promise<void> {
    setLoading(true);
    setError(null);
    setUsers([]);
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (!token) {
        setError('Please sign in to view user details.');
        return;
      }
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { accept: 'application/json', authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (response.status === 401) {
        setError('Your session has expired. Please sign in again.');
        return;
      }
      if (!response.ok) {
        console.error('Users API request failed with status', response.status);
        setError('Unable to load user details.');
        return;
      }
      setUsers((await response.json()) as UserDetails[]);
    } catch (err) {
      console.error('Users API request failed', err);
      setError('Unable to load user details.');
    } finally {
      setLoading(false);
    }
  }

  function openPopup(): void {
    setPopupOpen(true);
    void loadUsers();
  }

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

        <div className="backend-item">
          <h4>User Details</h4>
          <p>View all users from the Insurance API.</p>
          <button type="button" className="ui-open-btn" onClick={openPopup}>
            View User Details
          </button>
        </div>
      </div>

      {popupOpen && (
        <div className="ui-overlay" onClick={() => setPopupOpen(false)}>
          <div
            className="ui-popup"
            role="dialog"
            aria-modal="true"
            aria-label="User details"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ui-popup-header">
              <h3>User Details</h3>
              <button
                type="button"
                className="ui-close-btn"
                aria-label="Close"
                onClick={() => setPopupOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="ui-popup-body">
              {loading && <p>Loading...</p>}
              {!loading && error && <p role="alert">{error}</p>}
              {!loading && !error && users.length === 0 && <p>No users found.</p>}
              {!loading && !error && users.length > 0 && (
                <table className="ui-user-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Active</th>
                      <th>Created</th>
                      <th>Last login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.userId}>
                        <td>{u.userId}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.isActive ? 'Yes' : 'No'}</td>
                        <td>{formatDate(u.createdAt)}</td>
                        <td>{formatDate(u.lastLoginAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
