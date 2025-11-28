const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const { branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ message: 'branchId is required' });
    }

    const categories = await Category.find({ branch: branchId });

    return res.json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
