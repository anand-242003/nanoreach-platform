import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const requireVerified = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { verificationStatus: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verificationStatus !== "VERIFIED") {
      return res.status(403).json({ 
        message: "Account not verified. Please complete verification to access this feature.",
        verificationStatus: user.verificationStatus,
        requiresVerification: true
      });
    }

    next();
  } catch (error) {res.status(500).json({ message: "Server error" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ 
      message: "Admin access required",
      userRole: req.user.role
    });
  }
  next();
};

export const requireBrand = (req, res, next) => {
  if (req.user.role !== "BRAND") {
    return res.status(403).json({ 
      message: "Brand access required",
      userRole: req.user.role
    });
  }
  next();
};

export const requireInfluencer = (req, res, next) => {
  if (req.user.role !== "INFLUENCER") {
    return res.status(403).json({ 
      message: "Influencer access required",
      userRole: req.user.role
    });
  }
  next();
};

export const authenticate = protect;

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - insufficient role", userRole: req.user.role });
    }
    next();
  };
};
