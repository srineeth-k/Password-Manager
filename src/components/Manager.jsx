import React, { useRef, useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { passwordsAPI } from '../services/api';

const Manager = () => {
  const passwordRef = useRef();
  const [form, setForm] = useState({ site: '', username: '', password: '' });
  const [editingId, setEditingId] = useState(null);
  const [passwordArray, setPasswordArray] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch passwords from backend
  const getPasswords = async () => {
    try {
      setIsLoading(true);
      const passwords = await passwordsAPI.getAll();
      setPasswordArray(passwords);
    } catch (error) {
      toast.error(error.message || 'Failed to load passwords.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPasswords();
  }, []);

  // Copy text to clipboard
  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { theme: 'dark', autoClose: 2000 });
  };

  // Save or update password
  const savePassword = async () => {
    if (form.site.length < 3 || form.username.length < 3 || form.password.length < 3) {
      toast.error('All fields must be at least 3 characters.', { theme: 'dark' });
      return;
    }

    try {
      if (editingId) {
        // UPDATE existing
        const data = await passwordsAPI.update(editingId, {
          site: form.site,
          username: form.username,
          password: form.password,
        });
        setPasswordArray(
          passwordArray.map((pw) => (pw.id === editingId ? data.password : pw))
        );
        setEditingId(null);
        toast.success('Password updated!', { theme: 'dark' });
      } else {
        // CREATE new
        const data = await passwordsAPI.create(form.site, form.username, form.password);
        setPasswordArray([data.password, ...passwordArray]);
        toast.success('Password saved!', { theme: 'dark' });
      }

      setForm({ site: '', username: '', password: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to save password.', { theme: 'dark' });
    }
  };

  // Delete password
  const deletePassword = async (id) => {
    if (!confirm('Do you really want to delete this password?')) return;

    try {
      await passwordsAPI.delete(id);
      setPasswordArray(passwordArray.filter((item) => item.id !== id));
      toast.success('Password deleted!', { theme: 'dark' });
    } catch (error) {
      toast.error(error.message || 'Failed to delete password.', { theme: 'dark' });
    }
  };

  // Edit password
  const editPassword = (id) => {
    const pw = passwordArray.find((i) => i.id === id);
    if (pw) {
      setForm({ site: pw.site, username: pw.username, password: pw.password });
      setEditingId(id);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setForm({ site: '', username: '', password: '' });
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Toggle password visibility in input
  const togglePassword = () => {
    passwordRef.current.type =
      passwordRef.current.type === 'password' ? 'text' : 'password';
  };

  return (
    <>
      <ToastContainer />

      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-slate-950">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-emerald-500/8 blur-[120px]"></div>
        <div className="absolute bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px]"></div>
      </div>

      <div className="p-4 md:max-w-4xl md:mx-auto min-h-[calc(100vh-120px)] pt-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold">
            <span className="text-emerald-400">&lt;</span>
            <span className="text-white">Pass</span>
            <span className="text-emerald-400">OP/&gt;</span>
          </h1>
          <p className="text-slate-400 mt-2">Your encrypted credential vault</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col gap-4">
            <input
              value={form.site}
              onChange={handleChange}
              placeholder="Enter website URL"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              type="text"
              name="site"
              id="site"
            />

            <div className="flex flex-col md:flex-row gap-4">
              <input
                value={form.username}
                onChange={handleChange}
                placeholder="Enter Username"
                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                type="text"
                name="username"
                id="username"
              />

              <div className="relative flex-1">
                <input
                  ref={passwordRef}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter Password"
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all pr-16"
                  type="password"
                  name="password"
                  id="password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 text-xs font-medium transition-colors cursor-pointer"
                  onClick={togglePassword}
                >
                  SHOW
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={savePassword}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl px-8 py-2.5 transition-all duration-200 cursor-pointer"
              >
                {editingId ? '✓ Update' : '+ Save'}
              </button>
              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-6 py-2.5 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Passwords Table */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-emerald-400">🔐</span> Your Passwords
            <span className="text-sm text-slate-500 font-normal">
              ({passwordArray.length} saved)
            </span>
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : passwordArray.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
              <p className="text-slate-500 text-lg">No passwords saved yet</p>
              <p className="text-slate-600 text-sm mt-2">Add your first credential above</p>
            </div>
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-300 text-sm uppercase tracking-wider">
                    <th className="py-3 px-4 text-left font-medium">Site</th>
                    <th className="py-3 px-4 text-left font-medium">Username</th>
                    <th className="py-3 px-4 text-left font-medium">Password</th>
                    <th className="py-3 px-4 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordArray.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={item.site}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 truncate max-w-[200px] transition-colors"
                          >
                            {item.site}
                          </a>
                          <button
                            onClick={() => copyText(item.site)}
                            className="text-slate-500 hover:text-emerald-400 text-xs transition-colors shrink-0 cursor-pointer"
                            title="Copy"
                          >
                            📋
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">{item.username}</span>
                          <button
                            onClick={() => copyText(item.username)}
                            className="text-slate-500 hover:text-emerald-400 text-xs transition-colors shrink-0 cursor-pointer"
                            title="Copy"
                          >
                            📋
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 font-mono">
                            {'•'.repeat(Math.min(item.password.length, 12))}
                          </span>
                          <button
                            onClick={() => copyText(item.password)}
                            className="text-slate-500 hover:text-emerald-400 text-xs transition-colors shrink-0 cursor-pointer"
                            title="Copy password"
                          >
                            📋
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors cursor-pointer"
                            onClick={() => editPassword(item.id)}
                          >
                            Edit
                          </button>
                          <span className="text-slate-700">|</span>
                          <button
                            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors cursor-pointer"
                            onClick={() => deletePassword(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Manager;
