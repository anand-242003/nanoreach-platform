import prisma from "../config/db.js";

export const getPendingInfluencers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'UNDER_REVIEW' } = req.query;
    const skip = (page - 1) * limit;

    const influencers = await prisma.user.findMany({
      where: {
        role: 'INFLUENCER',
        verificationStatus: status,
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        influencerProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const total = await prisma.user.count({
      where: {
        role: 'INFLUENCER',
        verificationStatus: status,
      }
    });

    res.json({
      influencers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get Pending Influencers Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPendingBrands = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'UNDER_REVIEW' } = req.query;
    const skip = (page - 1) * limit;

    const brands = await prisma.user.findMany({
      where: {
        role: 'BRAND',
        verificationStatus: status,
      },
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        brandProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    const total = await prisma.user.count({
      where: {
        role: 'BRAND',
        verificationStatus: status,
      }
    });

    res.json({
      brands,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get Pending Brands Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInfluencerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        influencerProfile: true,
      }
    });

    if (!user || user.role !== 'INFLUENCER') {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.json({ influencer: user });
  } catch (error) {
    console.error('Get Influencer Details Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getBrandDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        brandProfile: true,
      }
    });

    if (!user || user.role !== 'BRAND') {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.json({ brand: user });
  } catch (error) {
    console.error('Get Brand Details Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveInfluencer = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user || user.role !== 'INFLUENCER') {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { verificationStatus: 'VERIFIED' }
    });

    await prisma.influencerProfile.update({
      where: { userId: id },
      data: {
        verificationNotes: notes || 'Approved',
        verifiedAt: new Date(),
        verifiedBy: adminId,
      }
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'VERIFY_INFLUENCER',
        targetType: 'User',
        targetId: id,
        previousState: { verificationStatus: user.verificationStatus },
        newState: { verificationStatus: 'VERIFIED' },
        notes: notes || 'Influencer verified',
      }
    });

    res.json({ message: 'Influencer approved successfully' });
  } catch (error) {
    console.error('Approve Influencer Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectInfluencer = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    if (!notes) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user || user.role !== 'INFLUENCER') {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { verificationStatus: 'REJECTED' }
    });

    await prisma.influencerProfile.update({
      where: { userId: id },
      data: {
        verificationNotes: notes,
        verifiedBy: adminId,
      }
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'REJECT_INFLUENCER',
        targetType: 'User',
        targetId: id,
        previousState: { verificationStatus: user.verificationStatus },
        newState: { verificationStatus: 'REJECTED' },
        notes,
      }
    });

    res.json({ message: 'Influencer rejected' });
  } catch (error) {
    console.error('Reject Influencer Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const approveBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user || user.role !== 'BRAND') {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { verificationStatus: 'VERIFIED' }
    });

    await prisma.brandProfile.update({
      where: { userId: id },
      data: {
        verificationNotes: notes || 'Approved',
        verifiedAt: new Date(),
        verifiedBy: adminId,
      }
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'VERIFY_BRAND',
        targetType: 'User',
        targetId: id,
        previousState: { verificationStatus: user.verificationStatus },
        newState: { verificationStatus: 'VERIFIED' },
        notes: notes || 'Brand verified',
      }
    });

    res.json({ message: 'Brand approved successfully' });
  } catch (error) {
    console.error('Approve Brand Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const rejectBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    if (!notes) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    
    if (!user || user.role !== 'BRAND') {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { verificationStatus: 'REJECTED' }
    });

    await prisma.brandProfile.update({
      where: { userId: id },
      data: {
        verificationNotes: notes,
        verifiedBy: adminId,
      }
    });

    await prisma.adminAction.create({
      data: {
        performedBy: adminId,
        actionType: 'REJECT_BRAND',
        targetType: 'User',
        targetId: id,
        previousState: { verificationStatus: user.verificationStatus },
        newState: { verificationStatus: 'REJECTED' },
        notes,
      }
    });

    res.json({ message: 'Brand rejected' });
  } catch (error) {
    console.error('Reject Brand Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
