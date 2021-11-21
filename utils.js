import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const isAuthenticated = (req, res, next) => {
  const authorisation = req.headers.authorization;

  if (authorisation) {
    const token = authorisation.slice(7, authorisation.length); // Bearer XXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) res.status(401).send({ message: "Invalid token" });
      else {
        req.user = decode;
        next();
      }
    });
  } else res.status(401).send({ message: "No token found." });
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) next();
  else
    res
      .status(401)
      .send({ message: "You're unauthorized to access this content." });
};
