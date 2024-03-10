import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
//import { rateLimit } from 'express-rate-limit';// for rate limiting

//const loginLimiter = rateLimit({
//  windowMs: 1 * 60 * 1000, // 1 minute window
//  max: 5, // limit to 5 requests per window
//  message: { message: "Too many login attempts. Please try again later." },
//});

// register of a user
export const register = async (req, res) => {
  try {
    // Input validation
    // validation of the email
    validation.validateEmail(req.body.email);

    // validation of the password
    validation.validatePassword(req.body.password);

    // Check for existing user with the same email
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // Secure password hashing with salting
    const salt = await bcrypt.genSalt(10); // increase rounds for stronger hashing
    const passwordHash = await bcrypt.hash(req.body.password, salt);

    // Create new user instance with sanitized (optional) and validated data
    const newUser = new User({
      firstName: req.body.firstName?.trim(), // optional: trim spaces
      lastName: req.body.lastName?.trim(), // optional: trim spaces
      email: req.body.email.toLowerCase(), // convert to lowercase
      password: passwordHash,
      picturePath: req.body.picturePath, // assuming validation and sanitization elsewhere
      friends: req.body.friends, // handle validation and authorization for friends list
      location: req.body.location?.trim(), // optional: trim spaces
      occupation: req.body.occupation?.trim(), // optional: trim spaces
      viewedPrfle: Math.floor(Math.random() * 10000), // consider using a more robust counter system
      impressions: Math.floor(Math.random() * 10000), // consider using a more robust counter system
    });

    // Save the new user
    const savedUser = await newUser.save();

    // Avoid sending sensitive data like password hash in response
    const { email, _id } = savedUser; // pick only necessary user information
    res
      .status(201)
      .json({ message: "User registered successfully.", user: { email, _id } });
  } catch (err) {
    console.error(err.message); // Log the error for debugging
    res.status(500).json({ message: "An error occurred during registration." }); // Generic error message
  }
};

// logging in
export const login = async (req, res) => {
  //  try{
  //      const {email, password} = req.body;
  //      const user = await User.findOne({email: email});
  //      if(!user) return res.status(400).json({msg: "User does not exist."});
  //
  //      const isMatch = await bcrypt.compare(password, user.password);
  //      if(!isMatch) return res.status(400).json({ msg: "Invalid credentials. "})
  //
  //      const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
  //      delete user.password;
  //      res.status(200).json({ token, user});
  //
  //  }catch(err){
  //      res.status(500).json({error: err.message});
  //  }
  try {
    // Input validation 
        // validation of the email
        validation.validateEmail(req.body.email);
        // validation of the password
        validation.validatePassword(req.body.password);

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    // Compare password with hashed password using bcrypt
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // Generate JWT token with appropriate expiration time (e.g., 1 hour)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Avoid sending sensitive data like password in response
    const { email, _id } = user; // pick only necessary user information
    res.status(200).json({ token, user: { email, _id } });
  } catch (err) {
    console.error(err.message); // Log the error for debugging
    res.status(500).json({ message: "An error occurred." }); // Generic error message
  }
};
