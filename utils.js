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

/**
 * Converts a string into a URL and SEO friendly slug.
 * @param {String} text The input text to convert into a slug.
 * @returns {String} The slug.
 */
export const slugify = (text) => {
  return text
    .toString() // Called just to prevent any casting error.
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents.
    .toLowerCase() // Ensure that the whole string is all lowercase letters.
    .replace(/\s+/g, "-") // Replace all spaces with hyphens.
    .replace(/[^\w\-]+/g, "") // Remove all non-letter characters.
    .replace(/^-+/, "") // trim the beginning of the string.
    .replace(/-+$/, ""); // trim the end of the string as well...
};
