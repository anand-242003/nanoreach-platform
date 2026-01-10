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
    console.error("Create Campaign Error:", error);
    res.status(500).json({ message: "Server error while creating campaign" });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (limit > 100) {
      return res.status(400).json({ message: "Limit cannot exceed 100" });
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        status: "ACTIVE",
      },
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

    // Get total count for pagination
    const total = await prisma.campaign.count({
      where: {
        status: "ACTIVE",
      },
    });

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
    console.error("Get Campaigns Error:", error);
    res.status(500).json({ message: "Server error while fetching campaigns" });
  }
};
