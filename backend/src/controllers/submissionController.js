import prisma from '../config/db.js';

export const createSubmission = async (req, res) => {
  try {
    const { campaignId, contentUrl, message } = req.body;
    const creatorId = req.user.id;

    if (!campaignId) {
      return res.status(400).json({ message: 'Campaign ID is required' });
    }

    if (!contentUrl) {
      return res.status(400).json({ message: 'Content URL is required' });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const existingSubmission = await prisma.submission.findFirst({
      where: {
        campaignId,
        creatorId
      }
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'You have already submitted to this campaign' });
    }

    const submission = await prisma.submission.create({
      data: {
        campaignId,
        creatorId,
        contentUrl,
        message: message || null,
        status: 'PENDING'
      },
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

    res.status(201).json({
      message: 'Submission created successfully',
      submission
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

    // Validate campaign ID format
    if (!campaignId || campaignId.length !== 24) {
      return res.status(400).json({ message: 'Invalid campaign ID format' });
    }

    console.log('Fetching submissions for campaign:', campaignId);
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);

    // Check if campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      console.log('Campaign not found:', campaignId);
      return res.status(404).json({ message: 'Campaign not found' });
    }

    console.log('Campaign found:', campaign.id, 'Brand ID:', campaign.brandId);

    // Check authorization
    if (campaign.brandId !== req.user.id) {
      console.log('Authorization failed. Campaign brand:', campaign.brandId, 'User:', req.user.id);
      return res.status(403).json({ message: 'Not authorized to view these submissions' });
    }

    // Fetch submissions
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

    console.log('Found submissions:', submissions.length);
    res.json(submissions);
  } catch (error) {
    console.error('Get campaign submissions error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    
    res.status(500).json({ 
      message: 'Server error while fetching submissions', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

    res.json(submissions);
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

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
      return res.status(403).json({ message: 'Not authorized to update this submission' });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status },
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
      message: `Submission ${status.toLowerCase()}`,
      submission: updatedSubmission
    });
  } catch (error) {
    console.error('Update submission status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


