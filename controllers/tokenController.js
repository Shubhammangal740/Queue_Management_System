const Token = require('../models/Token');

exports.createToken = async (req, res) => {
  try {
    const { serviceId, branchId, categoryId } = req.body;

    if (!serviceId || !branchId || !categoryId) {
      return res.status(400).json({ message: 'serviceId, branchId, and categoryId are required' });
    }

    // Generate token number (simple for now)
    // Format example: "T-<timestamp>"
    const tokenNumber = `T-${Date.now()}`;

    // Create token
    const token = await Token.create({
      tokenNumber,
      user: req.user.id,
      service: serviceId,
      branch: branchId,
      category: categoryId,
    });

    return res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET TOKEN DETAILS + POSITION IN QUEUE
exports.getTokenDetails = async (req, res) => {
  try {
    const tokenId = req.params.id;

    const token = await Token.findById(tokenId)
      .populate('service')
      .populate('branch')
      .populate('category')
      .populate('user', 'name email');

    if (!token) {
      return res.status(404).json({ message: 'Token not found' });
    }

    // Count how many waiting tokens were created before this token
    const queuePosition = await Token.countDocuments({
      category: token.category._id,
      status: 'WAITING',
      createdAt: { $lt: token.createdAt },
    });

    return res.json({
      token,
      position: queuePosition + 1, // user's actual position in queue
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
