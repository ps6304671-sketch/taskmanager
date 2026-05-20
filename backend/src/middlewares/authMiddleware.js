const supabase = require('../config/supabaseClient');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // --- TEMPORARY BYPASS FOR MASTER TOKEN ---
    if (token === 'MASTER_ADMIN_TOKEN') {
      req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@taskmanager.com',
        full_name: 'System Admin',
        role: 'Main Admin'
      };
      return next();
    }
    // -----------------------------------------

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
    
    // Fetch custom user details (e.g., role) from public.users table
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('Error fetching user data:', dbError);
    }
    
    req.user = { ...user, role: userData?.role || 'Member' };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
