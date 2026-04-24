import Password from '../models/Password.js';
import { encrypt, decrypt } from '../utils/encryption.js';

/**
 * GET /api/passwords
 * Get all passwords for the authenticated user (decrypted)
 */
export const getPasswords = async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Decrypt passwords before sending
    const decrypted = passwords.map((pw) => ({
      id: pw._id,
      site: pw.site,
      username: pw.username,
      password: decrypt(pw.password, pw.iv, pw.authTag),
      createdAt: pw.createdAt,
      updatedAt: pw.updatedAt,
    }));

    res.json(decrypted);
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ error: 'Failed to retrieve passwords.' });
  }
};

/**
 * GET /api/passwords/:id
 * Get a single password by ID (decrypted)
 */
export const getPassword = async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!password) {
      return res.status(404).json({ error: 'Password not found.' });
    }

    res.json({
      id: password._id,
      site: password.site,
      username: password.username,
      password: decrypt(password.password, password.iv, password.authTag),
      createdAt: password.createdAt,
      updatedAt: password.updatedAt,
    });
  } catch (error) {
    console.error('Get password error:', error);
    res.status(500).json({ error: 'Failed to retrieve password.' });
  }
};

/**
 * POST /api/passwords
 * Create a new password entry (encrypted)
 */
export const createPassword = async (req, res) => {
  try {
    const { site, username, password } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ error: 'Site, username, and password are required.' });
    }

    // Encrypt the password
    const { encrypted, iv, authTag } = encrypt(password);

    const newPassword = await Password.create({
      userId: req.user._id,
      site,
      username,
      password: encrypted,
      iv,
      authTag,
    });

    res.status(201).json({
      success: true,
      password: {
        id: newPassword._id,
        site: newPassword.site,
        username: newPassword.username,
        password, // Return plaintext to frontend
        createdAt: newPassword.createdAt,
        updatedAt: newPassword.updatedAt,
      },
    });
  } catch (error) {
    console.error('Create password error:', error);
    res.status(500).json({ error: 'Failed to save password.' });
  }
};

/**
 * PUT /api/passwords/:id
 * Update an existing password entry
 */
export const updatePassword = async (req, res) => {
  try {
    const { site, username, password } = req.body;

    // Find and verify ownership
    const existing = await Password.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({ error: 'Password not found.' });
    }

    // Update fields
    if (site) existing.site = site;
    if (username) existing.username = username;

    if (password) {
      const { encrypted, iv, authTag } = encrypt(password);
      existing.password = encrypted;
      existing.iv = iv;
      existing.authTag = authTag;
    }

    await existing.save();

    // Decrypt for response
    const decryptedPassword = decrypt(existing.password, existing.iv, existing.authTag);

    res.json({
      success: true,
      password: {
        id: existing._id,
        site: existing.site,
        username: existing.username,
        password: decryptedPassword,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password.' });
  }
};

/**
 * DELETE /api/passwords/:id
 * Delete a password entry
 */
export const deletePassword = async (req, res) => {
  try {
    const result = await Password.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!result) {
      return res.status(404).json({ error: 'Password not found.' });
    }

    res.json({ success: true, message: 'Password deleted.' });
  } catch (error) {
    console.error('Delete password error:', error);
    res.status(500).json({ error: 'Failed to delete password.' });
  }
};
