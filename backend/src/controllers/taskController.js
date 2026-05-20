const supabase = require('../config/supabaseClient');

// @desc    Get tasks (optionally filtered by project)
// @route   GET /api/tasks?projectId=XYZ
// @access  Private
const getTasks = async (req, res) => {
  const { projectId } = req.query;
  
  let query = supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  // If user is a Member, maybe they should only see their tasks?
  // Let's allow everyone to see all tasks for now, but Members can only edit their own.
  
  const { data, error } = await query;

  if (error) {
    console.error('DATABASE ERROR (getTasks):', error.message);
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  const { project_id, title, description, assigned_to, due_date, checklist } = req.body;

  if (!project_id || !title) {
    return res.status(400).json({ message: 'Project ID and title are required' });
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      project_id,
      title,
      description,
      checklist: checklist || [],
      status: 'To Do',
      assigned_to,
      due_date
    }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  // Create notification if assigned
  if (assigned_to) {
    const { data: project } = await supabase.from('projects').select('name').eq('id', project_id).single();
    const projectName = project ? project.name : 'a project';
    await supabase.from('notifications').insert([{
      user_id: assigned_to,
      message: `You have been assigned a new task: "${title}" in ${projectName}.`
    }]);
  }

  res.status(201).json(data);
};

// @desc    Update task (status or checklist)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const { status, checklist } = req.body;
  const taskId = req.params.id;

  if (status && !['To Do', 'In Progress', 'Done'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // Optional: Check if the task is assigned to the current user (if they are a member)
  if (req.user.role === 'Member') {
    const { data: taskCheck, error: checkError } = await supabase
      .from('tasks')
      .select('assigned_to')
      .eq('id', taskId)
      .single();

    if (checkError || !taskCheck) return res.status(404).json({ message: 'Task not found' });
    
    if (taskCheck.assigned_to !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }
  }

  const updateData = {};
  if (status) updateData.status = status;
  if (checklist) updateData.checklist = checklist;

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

module.exports = { getTasks, createTask, updateTask };
