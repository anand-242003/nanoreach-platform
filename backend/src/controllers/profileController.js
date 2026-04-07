import prisma from "../config/db.js";
import { isValidGST, isValidPAN } from "../utils/validators.js";

export const createInfluencerProfile = async (req, res) => {
  try {
    const { displayName, bio, youtubeChannelUrl, categoryTags } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'INFLUENCER') {
      return res.status(403).json({ message: 'Only influencers can create influencer profiles' });
    }

    let tags = categoryTags;
    if (typeof categoryTags === 'string') {
      try {
        tags = JSON.parse(categoryTags);
      } catch {
        tags = [categoryTags];
      }
    }

    const profileData = {
      displayName,
      bio,
      youtubeChannelUrl,
      categoryTags: Array.isArray(tags) ? tags : [tags],
      ...(req.file && { identityDocument: req.file.location || req.file.path }),
    };

    const profile = await prisma.influencerProfile.upsert({
      where: { userId },
      create: { userId, pastWorkLinks: [], ...profileData },
      update: profileData,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: 'UNDER_REVIEW' }
    });

    res.status(201).json({
      message: 'Profile created successfully',
      profile
    });
  } catch (error) {res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createBrandProfile = async (req, res) => {
  try {
    const { companyName, website, industry, gstNumber, panNumber } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user.role !== 'BRAND') {
      return res.status(403).json({ message: 'Only brands can create brand profiles' });
    }

    const normalizedPan = panNumber?.trim()?.toUpperCase();
    const normalizedGst = gstNumber?.trim()?.toUpperCase();

    if (!companyName || !website || !industry || !normalizedPan || !normalizedGst) {
      return res.status(400).json({ 
        message: 'Company name, website, industry, PAN, and GST are required',
        missingFields: {
          companyName: !companyName,
          website: !website,
          industry: !industry,
          panNumber: !normalizedPan,
          gstNumber: !normalizedGst,
        }
      });
    }

    if (!isValidPAN(normalizedPan)) {
      return res.status(400).json({ message: 'Invalid PAN format' });
    }

    if (!isValidGST(normalizedGst)) {
      return res.status(400).json({ message: 'Invalid GST format' });
    }

    const existingBrandProfile = await prisma.brandProfile.findUnique({ where: { userId } });
    if (!req.file && !existingBrandProfile?.businessDocument) {
      return res.status(400).json({ message: 'Business document is required for verification' });
    }

    const brandData = {
      companyName,
      website,
      industry,
      gstNumber: normalizedGst,
      panNumber: normalizedPan,
      ...(req.file && { businessDocument: req.file.location || req.file.path }),
    };

    const profile = await prisma.brandProfile.upsert({
      where: { userId },
      create: { userId, ...brandData },
      update: brandData,
    });

    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: 'UNDER_REVIEW' }
    });

    res.status(201).json({
      message: 'Profile created successfully and submitted for verification',
      profile
    });
  } catch (error) {res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        influencerProfile: true,
        brandProfile: true,
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = user.role === 'INFLUENCER' ? user.influencerProfile : user.brandProfile;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
      profile
    });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};

export const updateInfluencerProfile = async (req, res) => {
  try {
    const { displayName, bio, youtubeChannelUrl, categoryTags } = req.body;
    const userId = req.user.id;

    let tags = categoryTags;
    if (typeof categoryTags === 'string') {
      try {
        tags = JSON.parse(categoryTags);
      } catch {
        tags = [categoryTags];
      }
    }

    const updateData = {
      displayName,
      bio,
      youtubeChannelUrl,
      categoryTags: Array.isArray(tags) ? tags : [tags],
    };

    if (req.file) {
      updateData.identityDocument = req.file.location || req.file.path;
    }

    const profile = await prisma.influencerProfile.update({
      where: { userId },
      data: updateData
    });

    res.json({ message: 'Profile updated', profile });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};

export const updateBrandProfile = async (req, res) => {
  try {
    const { companyName, website, industry, gstNumber, panNumber } = req.body;
    const userId = req.user.id;

    const normalizedPan = panNumber?.trim()?.toUpperCase();
    const normalizedGst = gstNumber?.trim()?.toUpperCase();

    if (!companyName || !website || !industry || !normalizedPan || !normalizedGst) {
      return res.status(400).json({
        message: 'Company name, website, industry, PAN, and GST are required',
      });
    }

    if (!isValidPAN(normalizedPan)) {
      return res.status(400).json({ message: 'Invalid PAN format' });
    }

    if (!isValidGST(normalizedGst)) {
      return res.status(400).json({ message: 'Invalid GST format' });
    }

    const updateData = {
      companyName,
      website,
      industry,
      gstNumber: normalizedGst,
      panNumber: normalizedPan,
    };

    if (req.file) {
      updateData.businessDocument = req.file.location || req.file.path;
    }

    const profile = await prisma.brandProfile.update({
      where: { userId },
      data: updateData
    });

    res.json({ message: 'Profile updated', profile });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};
