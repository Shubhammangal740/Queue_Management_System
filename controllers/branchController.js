const Branch = require('../models/Branch');

exports.getBranches = async (req, res) => {
  try {
    const { serviceId } = req.query;

    let branches;

    if (serviceId) {
      branches = await Branch.find({ service: serviceId });
    } else {
      branches = await Branch.find();
    }

    return res.json({ branches });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
