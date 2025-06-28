const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

exports.sendResetCode = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  user.resetCode = code;
  user.resetCodeExpires = expiry;
  await user.save();

  await sendEmail(email, 'Your Reset Code', `<div>
        <h2>
        Your password reset code is: ${code}
        </h2>
        </div>`);

  res.status(200).json({ message: 'Code sent to email' });
};

exports.verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.resetCode !== code || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired code' });
  }

  res.status(200).json({ message: 'Code verified' });
};

exports.resetPassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });


  user.password = password; // Hash the new password in the User model's pre-save hook
  user.resetCode = null;
  user.resetCodeExpires = null;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
};
