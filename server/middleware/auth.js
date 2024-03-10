import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
 // 1. Check for authorization header
 const authorizationHeader = req.header('Authorization');
 if (!authorizationHeader) {
   return res.status(403).json({ message: 'Unauthorized access' });
 }

 // 2. Extract token (optional)
 const token = authorizationHeader.split(' ')[1]; // Assuming 'Bearer ' format
 if (!token) {
   return res.status(403).json({ message: 'Invalid token format' });
 }

 // 3. Verify token
 try {
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   req.user = decoded; // Attach decoded user information to request object
   next(); // Proceed to next middleware or route handler
 } catch (err) {
   if (err.name === 'JsonWebTokenError') { // Handle specific JWT errors
     return res.status(401).json({ message: 'Invalid token' });
   } else if (err.name === 'TokenExpiredError') { // Handle expired tokens
     return res.status(401).json({ message: 'Token expired' });
   } else { // Other errors
     console.error(err); // Log the error for debugging
     return res.status(500).json({ message: 'Internal server error' });
   }
 }
};
