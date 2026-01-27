import prisma from "../config/db.js";

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

export const getMyCampaigns = async (req, res) => {
  try {
    const { status } = req.query;
    const brandId = req.user.id;

    const where = { brandId };
    if (status) {
      where.status = status;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
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
        createdAt: true,
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
      },
    });

    res.json({ campaigns });
  } catch (error) {
    console.error("Get My Campaigns Error:", error);
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
    res.status(500).json({ message: "Server error" });
  }
};

export const createCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      startDate,
      endDate,
      categoryTags,
      contentRequirements,
      rules,
      resultsDate,
      evaluationCriteria,
      prizeDistribution,
    } = req.body;

    const brandId = req.user.id;

    if (!title || !description || !budget || !endDate) {
      return res.status(400).json({ message: "Title, description, budget, and end date are required" });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        budget: parseFloat(budget),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        categoryTags: categoryTags || [],
        contentRequirements,
        rules,
        resultsDate: resultsDate ? new Date(resultsDate) : null,
        evaluationCriteria: evaluationCriteria || {},
        prizeDistribution: prizeDistribution || [],
        status: 'DRAFT',
        brandId,
      },
    });

    res.status(201).json({
      message: "Campaign created successfully",
      campaign,
    });
  } catch (error) {
    console.error("Create Campaign Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = req.user.id;
    const updateData = req.body;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (updateData.budget) updateData.budget = parseFloat(updateData.budget);
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    if (updateData.resultsDate) updateData.resultsDate = new Date(updateData.resultsDate);

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
    });

    res.json({ message: "Campaign updated", campaign: updatedCampaign });
  } catch (error) {
    console.error("Update Campaign Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const brandId = req.user.id;

    const campaign = await prisma.campaign.findUnique({ where: { id } });

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (campaign.brandId !== brandId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await prisma.campaign.delete({ where: { id } });

    res.json({ message: "Campaign deleted" });
  } catch (error) {
    console.error("Delete Campaign Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
