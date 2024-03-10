const validator = require('validator'); // for email validation

export const validateEmail = (email) =>{
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email address." });
      }
}
export const validatePassword = (password) =>{
    if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long." });
      }
}