const express = require("express");
const User = require("../models/user");
const { validateUserInput } = require("../validations");
const { hashPassword, comparePassword } = require("../utils");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  try {
    const missingFields = [];
    if (!fname) missingFields.push("fname");
    if (!lname) missingFields.push("lname");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please provide the following required fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    const validationErrors = validateUserInput(fname, lname, email, password);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: `User with this ${user.email} email already exists` });
    }

    const hashedPassword = await hashPassword(password);

    user = new User({
      fname,
      lname,
      email,
      password: hashedPassword,
    });

    await user.save();

    user.password = undefined;

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Please provide the following required fields: ${missingFields.join(
          ", "
        )}`,
      });
    }

    const user = await User.findOne({ email }).select("-createdAt -updatedAt -__v");;
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    user.password = undefined;

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/user", authMiddleware, (req, res) => {
  res.status(200).json({
    user: req.user,
  });
});

router.put("/user", authMiddleware, async (req, res) => {
  const { fname, lname, email, profilePicture, dob, phone } = req.body;

  try {
    const updatedFields = {};
    if (fname) updatedFields.fname = fname;
    if (lname) updatedFields.lname = lname;
    if (email) updatedFields.email = email;
    if (profilePicture) updatedFields.profilePicture = profilePicture;
    if (dob) updatedFields.dob = dob;
    if (phone) updatedFields.phone = phone;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { $set: updatedFields },
      { new: true, runValidators: true } 
    ).select("-password"); 

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
