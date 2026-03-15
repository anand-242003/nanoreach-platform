import { google } from 'googleapis';
import prisma from '../config/db.js';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/  
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('Invalid YouTube URL format');
};

export const verifyYouTubeMetrics = async (videoUrl) => {
  try {
    
    const videoId = extractVideoId(videoUrl);

    const response = await youtube.videos.list({
      part: 'statistics,snippet,contentDetails',
      id: videoId
    });

    const video = response.data.items?.[0];
    
    if (!video) {
      return { 
        verified: false, 
        error: 'Video not found or is private/deleted' 
      };
    }

    if (video.snippet.privacyStatus === 'private') {
      return { 
        verified: false, 
        error: 'Video is private' 
      };
    }

    const stats = video.statistics;
    
    return {
      verified: true,
      platform: 'YOUTUBE',
      videoId: video.id,

      metadata: {
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        categoryId: video.snippet.categoryId,
        tags: video.snippet.tags || [],
        thumbnailUrl: video.snippet.thumbnails?.high?.url
      },

      metrics: {
        views: parseInt(stats.viewCount || 0),
        likes: parseInt(stats.likeCount || 0),
        comments: parseInt(stats.commentCount || 0),
        favorites: parseInt(stats.favoriteCount || 0)
      },

      apiResponse: video,
      verifiedAt: new Date().toISOString()
    };

  } catch (error) {if (error.response?.status === 403) {
      return { 
        verified: false, 
        error: 'YouTube API quota exceeded or invalid API key' 
      };
    }
    
    if (error.response?.status === 404) {
      return { 
        verified: false, 
        error: 'Video not found' 
      };
    }

    return { 
      verified: false, 
      error: error.message || 'Failed to verify YouTube metrics' 
    };
  }
};

export const createMetricsSnapshot = async (submissionId, verifiedData, fraudResults = null) => {
  try {
    const snapshot = await prisma.metricsSnapshot.create({
      data: {
        submissionId,
        views: verifiedData.metrics.views,
        likes: verifiedData.metrics.likes,
        comments: verifiedData.metrics.comments,
        shares: 0, 
        engagement: calculateEngagementRate(verifiedData.metrics),
        verifiedVia: 'YOUTUBE_API',
        apiResponse: verifiedData.apiResponse || verifiedData,
        fraudScore: fraudResults?.fraudScore || null,
        riskLevel: fraudResults?.riskLevel || null,
        fraudChecks: fraudResults?.checks || null
      }
    });

    return snapshot;
  } catch (error) {throw error;
  }
};

const calculateEngagementRate = (metrics) => {
  const { views, likes, comments } = metrics;
  if (views === 0) return 0;
  
  const totalEngagement = likes + comments;
  return (totalEngagement / views) * 100;
};

export const getMetricsHistory = async (submissionId, limit = 30) => {
  try {
    const snapshots = await prisma.metricsSnapshot.findMany({
      where: { submissionId },
      orderBy: { capturedAt: 'desc' },
      take: limit
    });

    return snapshots;
  } catch (error) {return [];
  }
};
