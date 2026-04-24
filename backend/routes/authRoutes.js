import { Router } from 'express';
import passport from 'passport';
import { register, login, getMe, oauthCallback } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Local auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);

// Google OAuth routes — only if strategy is configured
router.get('/google', (req, res, next) => {
  if (!passport._strategies.google) {
    return res.status(501).json({ error: 'Google OAuth is not configured on this server.' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  if (!passport._strategies.google) {
    return res.status(501).json({ error: 'Google OAuth is not configured on this server.' });
  }
  passport.authenticate('google', { session: false, failureRedirect: '/login' })(req, res, () => {
    oauthCallback(req, res);
  });
});

// GitHub OAuth routes — only if strategy is configured
router.get('/github', (req, res, next) => {
  if (!passport._strategies.github) {
    return res.status(501).json({ error: 'GitHub OAuth is not configured on this server.' });
  }
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  if (!passport._strategies.github) {
    return res.status(501).json({ error: 'GitHub OAuth is not configured on this server.' });
  }
  passport.authenticate('github', { session: false, failureRedirect: '/login' })(req, res, () => {
    oauthCallback(req, res);
  });
});

export default router;
