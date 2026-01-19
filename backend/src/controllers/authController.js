import prisma from "../config/db.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/generateToken.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signup = async (req, res) => {
    try {
        let { name, email, password, role } = req.body;
        
        name = name?.trim();
        email = email?.trim();
        
        if (!email || !password || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }
        
        const validRoles = ["BRAND", "INFLUENCER", "ADMIN"];
        const userRole = role && validRoles.includes(role) ? role : "INFLUENCER";
        
        const normalizedEmail = email.toLowerCase();

        const existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                password: hashedPassword,
                name,
                role: userRole,
                verificationStatus: "PENDING",
            },
        });
        const token = generateToken(user.id, user.role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", 
            maxAge: 7 * 1024 * 60 * 60 * 1000,
        });
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                verificationStatus: user.verificationStatus,
            },
            redirectTo: "/onboarding",
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        let { email, password } = req.body;
        
        email = email?.trim();

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const normalizedEmail = email.toLowerCase();

        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: {
                influencerProfile: true,
                brandProfile: true,
            }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = generateToken(user.id, user.role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const hasProfile = user.role === 'INFLUENCER' 
            ? user.influencerProfile !== null 
            : user.brandProfile !== null;

        res.json({
            message: "Login successful",
            user: { 
                id: user.id,
                name: user.name,
                email: user.email, 
                role: user.role,
                verificationStatus: user.verificationStatus,
                hasProfile,
            },
            redirectTo: !hasProfile ? "/onboarding" : "/dashboard",
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const logout = (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json({ message: "Logout successful" });
};

// FIXED: Updated to use correct schema fields
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationStatus: true,
        createdAt: true,
        influencerProfile: {
          select: {
            displayName: true,
            bio: true,
            profileImage: true,
            youtubeChannelUrl: true,
            youtubeChannelId: true,
            subscriberCount: true,
            categoryTags: true,
            verifiedAt: true,
          }
        },
        brandProfile: {
          select: {
            companyName: true,
            logo: true,
            website: true,
            industry: true,
            verifiedAt: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// FIXED: Updated to use correct schema fields
export const getVerificationStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        role: true,
        verificationStatus: true,
        influencerProfile: {
          select: {
            displayName: true,
            categoryTags: true,
            youtubeChannelUrl: true,
            pastWorkLinks: true,
            identityDocument: true,
            verificationNotes: true,
            verifiedAt: true,
            verifiedBy: true,
          }
        },
        brandProfile: {
          select: {
            companyName: true,
            website: true,
            industry: true,
            gstNumber: true,
            panNumber: true,
            businessDocument: true,
            verificationNotes: true,
            verifiedAt: true,
            verifiedBy: true,
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      verificationStatus: user.verificationStatus,
      profile: user.role === 'INFLUENCER' ? user.influencerProfile : user.brandProfile,
      role: user.role
    });
  } catch (error) {
    console.error("Get Verification Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};