const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'Main Admin' || req.user.role === 'Co-Admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an Admin' });
  }
};

module.exports = { adminOnly };
