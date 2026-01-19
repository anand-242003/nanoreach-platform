import prisma from "../config/db.js";

export const createCampaign = async (req, res) => {
  try {
    let { title, description, prizePool, deadline } = req.body;

    title = title?.trim();
    description = description?.trim();

    if (!title || !description || !prizePool || !deadline) {
      return res.status(400).json({ message: "All fields are required: title, description, prizePool, deadline" });
    }

    if (title.length < 3 || title.length > 200) {
      return res.status(400).json({ message: "Title must be between 3 and 200 characters" });
    }

    if (description.length < 10 || description.length > 5000) {
      return res.status(400).json({ message: "Description must be between 10 and 5000 characters" });
    }

    const prizePoolNum = parseInt(prizePool);
    if (isNaN(prizePoolNum) || prizePoolNum < 0) {
      return res.status(400).json({ message: "Prize pool must be a positive number" });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: "Invalid deadline format" });
    }
    if (deadlineDate <= new Date()) {
      return res.status(400).json({ message: "Deadline must be in the future" });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        prizePool: prizePoolNum,
        deadline: deadlineDate,
        brandId: req.user.id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        prizePool: true,
        deadline: true,
        status: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
        console.error("Create Campaign Error:", error.message);
    } else {
        console.error("Create Campaign Error:", error);
    }
    res.status(500).json({ message: "Server error while creating campaign" });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 100, status = "ACTIVE" } = req.query;
    const skip = (page - 1) * limit;

    const campaigns = await prisma.campaign.findMany({
      where: { status },
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        startDate: true,
        endDate: true,
        status: true,
        categoryTags: true,
        prizeDistribution: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    });

    const total = await prisma.campaign.count({ where: { status } });

    res.json({
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Campaigns Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        budget: true,
        startDate: true,
        endDate: true,
        status: true,
        categoryTags: true,
        contentRequirements: true,
        rules: true,
        resultsDate: true,
        evaluationCriteria: true,
        prizeDistribution: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.json({ campaign });
  } catch (error) {
    console.error("Get Campaign Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyCampaigns = async (req, res) => {
  try {
    const brandId = req.user.id;
    
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    
    page = Math.max(1, Math.min(page, 1000));  
    limit = Math.max(1, Math.min(limit, 100)); 
    const skip = (page - 1) * limit;

    const where = { brandId };
    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        prizePool: true,
        deadline: true,
        status: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const total = await prisma.campaign.count({ where });

    res.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
        console.error("Get My Campaigns Error:", error.message);
    } else {
        console.error("Get My Campaigns Error:", error);
    }
    res.status(500).json({ message: "Server error while fetching campaigns" });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, prizePool, deadline } = req.body;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { brandId: true }
    });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this campaign" });
    }

    const updates = {};
    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (prizePool) updates.prizePool = parseInt(prizePool);
    if (deadline) updates.deadline = new Date(deadline);

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        title: true,
        description: true,
        prizePool: true,
        deadline: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Campaign updated successfully",
      campaign: updatedCampaign
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
        console.error("Update Campaign Error:", error.message);
    } else {
        console.error("Update Campaign Error:", error);
    }
    res.status(500).json({ message: "Server error while updating campaign" });
  }
};
