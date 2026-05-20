const supabase = require('../config/supabaseClient');

// @desc    Register a new user (Admin Only)
// @route   POST /api/auth/signup
// @access  Private/Admin
const signupUser = async (req, res) => {
  const { email, password, full_name, role } = req.body;
  const creatorRole = req.user.role; // From authMiddleware

  if (!email || !password || !full_name) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  let newRole = role || 'Member';

  // Role validation: Co-Admin can only create Members.
  if (creatorRole === 'Co-Admin' && newRole !== 'Member') {
    return res.status(403).json({ message: 'Co-Admins can only create Members' });
  }

  // Try Admin API first (better because it confirms email automatically)
  let { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: newRole }
  });

  // Fallback to public signUp if Admin API is restricted (User not allowed)
  if (authError && (authError.message.includes('not allowed') || authError.status === 403)) {
    console.log('Admin API restricted, falling back to public signUp...');
    const { data: publicData, error: publicError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role: newRole }
      }
    });
    authData = publicData;
    authError = publicError;
  }

  if (authError) return res.status(400).json({ error: authError.message });

  // Add custom user data to public.users table
  if (authData.user) {
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        full_name,
        role: newRole
      }]);

    if (dbError) {
      return res.status(400).json({ error: dbError.message });
    }
  }

  res.status(201).json({ 
    message: 'User created successfully', 
    user: authData.user
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // --- TEMPORARY BYPASS FOR INITIAL SETUP ---
  if (email === 'admin@taskmanager.com' && password === 'admin123') {
    return res.json({
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@taskmanager.com',
        full_name: 'System Admin',
        role: 'Main Admin'
      },
      token: 'MASTER_ADMIN_TOKEN'
    });
  }
  // ------------------------------------------

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(401).json({ error: error.message });

  // Fetch role
  const { data: userData } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  res.json({
    user: { ...data.user, role: userData?.role, full_name: userData?.full_name },
    session: data.session
  });
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Get all users (for assigning tasks)
// @route   GET /api/auth/users
// @access  Private
const getUsers = async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role');
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

module.exports = { signupUser, loginUser, getMe, getUsers };
