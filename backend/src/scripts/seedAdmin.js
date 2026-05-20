const supabase = require('../config/supabaseClient');

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@taskmanager.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const fullName = 'Main Admin';

  console.log('Checking if Main Admin exists...');

  // Use admin api to bypass email confirmation
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log(`Admin user ${email} already exists.`);
    } else {
      console.error('Error creating admin user:', error.message);
    }
    return;
  }

  // Add custom user data to public.users table
  if (user && user.user) {
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        id: user.user.id,
        email,
        full_name: fullName,
        role: 'Main Admin'
      }]);

    if (dbError) {
      console.error('Error inserting into public.users:', dbError.message);
    } else {
      console.log(`Main Admin created successfully with email: ${email}`);
    }
  }
};

seedAdmin();
