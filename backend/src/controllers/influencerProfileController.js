import prisma from "../config/db.js";

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { displayName, bio, youtubeChannelUrl, categoryTags } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'INFLUENCER') {
      return res.status(403).json({ 
        message: `Only influencers can create influencer profiles. Your role: ${user.role}. Please contact support if this is incorrect.` 
      });
    }

    let tags = categoryTags;
    if (typeof categoryTags === 'string') {
      try {
        tags = JSON.parse(categoryTags);
      } catch {
        tags = [categoryTags];
      }
    }

    const existingProfile = await prisma.influencerProfile.findUnique({ where: { userId } });

    let profile;
    if (existingProfile) {
      profile = await prisma.influencerProfile.update({
        where: { userId },
        data: {
          displayName,
          bio,
          youtubeChannelUrl,
          categoryTags: Array.isArray(tags) ? tags : [tags],
        }
      });
    } else {
      profile = await prisma.influencerProfile.create({
        data: {
          userId,
          displayName,
          bio,
          youtubeChannelUrl,
          categoryTags: Array.isArray(tags) ? tags : [tags],
          pastWorkLinks: [],
        }
      });
    }

    res.status(existingProfile ? 200 : 201).json({
      message: existingProfile ? 'Profile updated' : 'Profile created',
      profile
    });
  } catch (error) {res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const addSocialLinks = async (req, res) => {
  try {
    const { youtubeChannelUrl, youtubeChannelId, subscriberCount } = req.body;
    const userId = req.user.id;

    const profile = await prisma.influencerProfile.update({
      where: { userId },
      data: {
        youtubeChannelUrl,
        youtubeChannelId: youtubeChannelId || null,
        subscriberCount: subscriberCount ? parseInt(subscriberCount) : null,
      }
    });

    res.json({ message: 'Social links updated', profile });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No document uploaded' });
    }

    const profile = await prisma.influencerProfile.update({
      where: { userId },
      data: {
        identityDocument: req.file.path,
      }
    });

    res.json({ message: 'Document uploaded successfully', document: req.file.path });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};

export const addPastWork = async (req, res) => {
  try {
    const { workLinks } = req.body;
    const userId = req.user.id;

    let links = workLinks;
    if (typeof workLinks === 'string') {
      try {
        links = JSON.parse(workLinks);
      } catch {
        links = [workLinks];
      }
    }

    const profile = await prisma.influencerProfile.update({
      where: { userId },
      data: {
        pastWorkLinks: Array.isArray(links) ? links : [links],
      }
    });

    res.json({ message: 'Past work added', profile });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};

export const submitForVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.influencerProfile.findUnique({ where: { userId } });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found. Complete profile first.' });
    }

    if (!profile.displayName || !profile.bio || !profile.youtubeChannelUrl || !profile.identityDocument) {
      return res.status(400).json({ 
        message: 'Incomplete profile. Please fill all required fields and upload identity document.' 
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: 'UNDER_REVIEW' }
    });

    res.json({ 
      message: 'Profile submitted for verification',
      verificationStatus: 'UNDER_REVIEW'
    });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const profile = await prisma.influencerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
            verificationStatus: true,
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });
  } catch (error) {res.status(500).json({ message: 'Server error' });
  }
};
