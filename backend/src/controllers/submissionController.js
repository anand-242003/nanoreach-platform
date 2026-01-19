import prisma from '../config/db.js';

export const createSubmission = async (req, res) => {
  try {
    const { campaignId, description, socialLink } = req.body;
    const creatorId = req.user.id;

    if (!campaignId) {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }

    if (!description) {
      return res.status(400).json({ message: 'Description is required' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const files = req.files ? req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: file.mimetype,
      size: file.size
    })) : [];

    const submissionData = {
      campaignId,
      creatorId,
      description,
      socialLink: socialLink || null,
      files: files.length > 0 ? JSON.stringify(files) : null,
      status: 'PENDING'
    };

    const submission = await prisma.submission.create({
      data: submissionData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        campaign: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    const responseSubmission = {
      ...submission,
      files: submission.files ? JSON.parse(submission.files) : []
    };

    res.status(201).json({
      message: 'Submission created successfully',
      submission: responseSubmission
    });
  } catch (error) {
    console.error('Create submission error:', error.message);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};

export const getCampaignSubmissions = async (req, res) => {
  try {
    const { id: campaignId } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.brandId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }

    const submissions = await prisma.submission.findMany({
      where: { campaignId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const submissionsWithFiles = submissions.map(sub => ({
      ...sub,
      files: sub.files ? JSON.parse(sub.files) : []
    }));

    res.json({ submissions: submissionsWithFiles });
  } catch (error) {
    console.error('Get campaign submissions error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const creatorId = req.user.id;

    const submissions = await prisma.submission.findMany({
      where: { creatorId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            prizePool: true,
            deadline: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const submissionsWithFiles = submissions.map(sub => ({
      ...sub,
      files: sub.files ? JSON.parse(sub.files) : []
    }));

    res.json({ submissions: submissionsWithFiles });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const approveSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        campaign: true
      }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.campaign.brandId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to approve this submission' });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Submission approved',
      submission: {
        ...updatedSubmission,
        files: updatedSubmission.files ? JSON.parse(updatedSubmission.files) : []
      }
    });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const rejectSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        campaign: true
      }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    if (submission.campaign.brandId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this submission' });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Submission rejected',
      submission: {
        ...updatedSubmission,
        files: updatedSubmission.files ? JSON.parse(updatedSubmission.files) : []
      }
    });
  } catch (error) {
    console.error('Reject submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
