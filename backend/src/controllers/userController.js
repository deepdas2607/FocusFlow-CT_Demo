// ============================================================================
// FILE: backend/src/controllers/userController.js
// PURPOSE: Handles HTTP requests for user registration, login, and profile updates.
// ============================================================================

const {
  findUserByEmail,
  findUserById,
  getDefaultUser,
  createUser,
  updateUserProfileAndPreferences
} = require('../models/userModel');

// Registers a new user account in SQLite or returns an error if email already exists
function handleRegisterUser(req, res) {
  try {
    const { name, email, password, phone, dob, occupation, focusGoal } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required to register.' });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const user = createUser({ name, email, password, phone, dob, occupation, focusGoal });
    return res.status(201).json({
      message: 'Account created in SQLite database',
      user
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Authenticates an existing user by email and password against SQLite
function handleLoginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to sign in.' });
    }

    const userRow = findUserByEmail(email);
    if (!userRow) {
      return res.status(404).json({ error: 'No account found with that email. Please register first.' });
    }

    if (password && userRow.password && userRow.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    const user = findUserById(userRow.id);
    return res.json({
      message: 'Signed in successfully',
      user
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Returns the requested user profile (by ?userId= query param) or the default demo user
function handleGetUserProfile(req, res) {
  try {
    const { userId } = req.query;
    const user = userId ? findUserById(userId) : getDefaultUser();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Updates a user's profile attributes and notification/privacy preferences in SQLite
function handleUpdateUserProfile(req, res) {
  try {
    const userId = req.body.id || req.query.userId || getDefaultUser()?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to update profile.' });
    }

    const updatedUser = updateUserProfileAndPreferences(userId, req.body);
    return res.json({
      message: 'Profile and preferences saved to SQLite database',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  handleRegisterUser,
  handleLoginUser,
  handleGetUserProfile,
  handleUpdateUserProfile
};
