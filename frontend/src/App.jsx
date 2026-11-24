import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5001/api';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('notes_token') || '');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('notes_user') || 'null')
  );
  const [isRegister, setIsRegister] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Notes State
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  // Fetch Notes on Token change
  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const fetchNotes = async () => {
    try {
      const res = await fetch(`${API_BASE}/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  // Auth Submit (Login / Register)
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister
      ? { username: authUsername, email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        return;
      }

      localStorage.setItem('notes_token', data.token);
      localStorage.setItem('notes_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      setAuthUsername('');
      setAuthEmail('');
      setAuthPassword('');
      showToast(`Welcome back, ${data.user.username}!`);
    } catch (err) {
      setAuthError('Unable to connect to server. Ensure backend is running.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('notes_token');
    localStorage.removeItem('notes_user');
    setToken('');
    setUser(null);
    setNotes([]);
    setEditId(null);
    showToast('Logged out successfully');
  };

  // Create or Update Note
  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editId) {
      // Update
      try {
        const res = await fetch(`${API_BASE}/notes/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        });
        if (res.ok) {
          setEditId(null);
          setTitle('');
          setContent('');
          fetchNotes();
          showToast('✨ Note updated successfully!');
        }
      } catch (err) {
        console.error('Error updating note:', err);
      }
    } else {
      // Create
      try {
        const res = await fetch(`${API_BASE}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, content }),
        });
        if (res.ok) {
          setTitle('');
          setContent('');
          fetchNotes();
          showToast('🚀 Note created successfully!');
        }
      } catch (err) {
        console.error('Error creating note:', err);
      }
    }
  };

  // Delete Note
  const handleDeleteNote = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (editId === id) handleCancelEdit();
        fetchNotes();
        showToast('🗑️ Note deleted');
      }
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleStartEdit = (note) => {
    setEditId(note._id);
    setTitle(note.title);
    setContent(note.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setContent('');
  };

  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    const query = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(query) ||
      n.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="glass-app-root">
      {/* Background Animated Liquid Glow Blobs */}
      <div className="liquid-blob blob-1"></div>
      <div className="liquid-blob blob-2"></div>
      <div className="liquid-blob blob-3"></div>
      <div className="liquid-blob blob-4"></div>

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="liquid-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="glass-container">
        {!token || !user ? (
          /* ================= AUTHENTICATION VIEW ================= */
          <div className="glass-auth-wrapper">
            <div className="liquid-glass-card auth-card">
              <div className="auth-brand">
                <div className="brand-orb">📝</div>
                <h2>AuraNotes</h2>
                <p>Next-Gen Liquid Notes Experience</p>
              </div>

              {/* Segmented Glass Tab Toggle */}
              <div className="glass-tabs">
                <button
                  type="button"
                  className={`tab-btn ${!isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(false);
                    setAuthError('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`tab-btn ${isRegister ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegister(true);
                    setAuthError('');
                  }}
                >
                  Register
                </button>
              </div>

              {authError && <div className="liquid-alert">{authError}</div>}

              <form onSubmit={handleAuth} className="glass-form">
                {isRegister && (
                  <div className="input-group">
                    <label>Username</label>
                    <input
                      type="text"
                      placeholder="e.g. Bhavesh"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="input-group">
                  <label>Gmail / Email</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="liquid-btn primary-liquid-btn full-btn">
                  <span>{isRegister ? 'Create Account ✨' : 'Unlock Notes 🚀'}</span>
                </button>
              </form>

              <div className="auth-footer-prompt">
                {isRegister ? (
                  <span>
                    Have an account?{' '}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => setIsRegister(false)}
                    >
                      Sign In
                    </button>
                  </span>
                ) : (
                  <span>
                    New here?{' '}
                    <button
                      type="button"
                      className="inline-link"
                      onClick={() => setIsRegister(true)}
                    >
                      Create an account
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= DASHBOARD VIEW ================= */
          <div className="dashboard-layout">
            {/* Liquid Glass Header */}
            <header className="liquid-glass-card header-glass">
              <div className="user-profile-bar">
                <div className="avatar-glass">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-details">
                  <h3>
                    Welcome, <span className="highlight-text">{user.username}</span>
                  </h3>
                  <span className="email-badge">{user.email}</span>
                </div>
              </div>

              <div className="header-actions">
                <span className="stat-pill">
                  {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
                </span>
                <button
                  onClick={handleLogout}
                  className="liquid-btn logout-btn"
                  title="Logout"
                >
                  <span>Logout ⏻</span>
                </button>
              </div>
            </header>

            {/* Note Creation / Editing Card */}
            <section className="liquid-glass-card editor-glass">
              <div className="editor-header">
                <div className="editor-title-wrap">
                  <h4>{editId ? 'Edit Your Note' : 'Create New Note'}</h4>
                  {editId && <span className="editing-badge">Editing Mode</span>}
                </div>
                {editId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="liquid-btn cancel-btn"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitNote} className="editor-form">
                <input
                  type="text"
                  placeholder="Note Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="glass-input title-input"
                  required
                />
                <textarea
                  placeholder="Capture your thoughts with liquid clarity..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows="4"
                  className="glass-input content-textarea"
                  required
                ></textarea>

                <div className="editor-bottom-bar">
                  <span className="char-count">{content.length} characters</span>
                  <button type="submit" className="liquid-btn primary-liquid-btn">
                    <span>{editId ? 'Update Note ✨' : 'Publish Note ✍️'}</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Search & Filter Bar */}
            <div className="search-bar-wrap">
              <div className="search-glass-inner">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search your notes by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    className="clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Notes Grid */}
            <div className="notes-grid">
              {filteredNotes.length === 0 ? (
                <div className="liquid-glass-card empty-glass">
                  <div className="empty-icon">🪶</div>
                  <h3>
                    {searchQuery
                      ? 'No notes match your search.'
                      : 'Your notebook is empty'}
                  </h3>
                  <p>
                    {searchQuery
                      ? 'Try searching with a different keyword.'
                      : 'Create your first note above to experience the liquid glass vibe!'}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <article key={note._id} className="liquid-glass-card note-card">
                    <div className="card-glass-specular"></div>
                    <div className="card-top">
                      <h3 className="note-card-title">{note.title}</h3>
                    </div>

                    <p className="note-card-content">{note.content}</p>

                    <div className="card-footer">
                      <span className="note-date">
                        🕒 {new Date(note.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(note.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="card-buttons">
                        <button
                          onClick={() => handleStartEdit(note)}
                          className="glass-action-btn edit-action"
                          title="Edit Note"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="glass-action-btn delete-action"
                          title="Delete Note"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
