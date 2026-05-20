const supabase = require('../config/supabaseClient');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('DATABASE ERROR (getProjects):', error.message);
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { name, description, assigned_to } = req.body;

  if (!name) return res.status(400).json({ message: 'Project name is required' });

  const { data, error } = await supabase
    .from('projects')
    .insert([{ name, description, created_by: req.user.id, assigned_to }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(404).json({ message: 'Project not found' });
  res.json(data);
};

module.exports = { getProjects, createProject, getProjectById };
