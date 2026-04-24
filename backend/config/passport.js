import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';

const configurePassport = () => {
  // Google OAuth 2.0 Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_CLIENT_SECRET !== 'YOUR_GOOGLE_CLIENT_SECRET_HERE') {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user already exists with this Google ID
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              return done(null, user);
            }

            // Check if user exists with same email
            user = await User.findOne({ email: profile.emails[0].value });

            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (!user.name) user.name = profile.displayName;
              await user.save();
              return done(null, user);
            }

            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
            });

            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
    console.log('✓ Google OAuth strategy configured');
  } else {
    console.log('⚠ Google OAuth not configured (missing credentials)');
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET &&
      process.env.GITHUB_CLIENT_SECRET !== 'YOUR_GITHUB_CLIENT_SECRET_HERE') {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: '/api/auth/github/callback',
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await User.findOne({ githubId: profile.id });

            if (user) {
              return done(null, user);
            }

            // Get email from profile
            const email = profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : `${profile.username}@github.local`;

            // Check if user exists with same email
            user = await User.findOne({ email });

            if (user) {
              user.githubId = profile.id;
              if (!user.name) user.name = profile.displayName || profile.username;
              await user.save();
              return done(null, user);
            }

            user = await User.create({
              githubId: profile.id,
              email,
              name: profile.displayName || profile.username,
            });

            done(null, user);
          } catch (error) {
            done(error, null);
          }
        }
      )
    );
    console.log('✓ GitHub OAuth strategy configured');
  } else {
    console.log('⚠ GitHub OAuth not configured (missing credentials)');
  }

  // Serialize/Deserialize (needed for passport even with JWT)
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;
