const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "wrong password" });
    }

    req.session.isLoggedIn = true;
    req.session.userId = user._id.toString();

    await req.session.save();

    res.status(200).json({
      message: "logged in",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.json({ message: "logged out" });
  });
};

exports.postSignUp = async (req, res, next) => {

  try {
    const { password, email, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    res.status(201).json({ message: "signed up" });
  } catch (err) {
    next(err);
  }
};
