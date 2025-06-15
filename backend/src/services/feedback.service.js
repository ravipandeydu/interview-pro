/**
 * Feedback Generator Service
 *
 * This module provides services for generating comprehensive feedback for interview responses.
 * It leverages the AI service to analyze responses and generate structured feedback.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { ApiError } from '../middlewares/error.middleware.js';
import aiService from './ai.service.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Generate feedback for a specific response
 * @param {string} responseId - ID of the response to generate feedback for
 * @returns {Promise<Object>} Generated feedback
 */
export async function generateFeedbackForResponse(responseId) {
  try {
    // Get the response with its associated question
    const response = await prisma.response.findUnique({
      where: { id: responseId },
      include: {
        interviewQuestion: {
          include: {
            question: true
          }
        }
      }
    });

    if (!response) {
      throw new ApiError('Response not found', 404);
    }

    // Check if AI analysis already exists
    if (!response.aiAnalysisScore || !response.aiAnalysisDetails) {
      // If not, generate AI analysis first
      const question = response.interviewQuestion.question;
      const analysis = await aiService.analyzeResponse({
        question: {
          content: question.content,
          category: question.category,
          difficulty: question.difficulty,
          expectedAnswer: question.expectedAnswer
        },
        responseContent: response.transcriptText || response.content
      });

      // Update the response with AI analysis
      await prisma.response.update({
        where: { id: responseId },
        data: {
          aiAnalysisScore: analysis.score,
          aiAnalysisDetails: analysis.details,
        }
      });

      // Use the newly generated analysis for feedback
      return {
        score: analysis.score,
        feedback: analysis.details.analysis,
        strengths: analysis.details.strengths,
        weaknesses: analysis.details.weaknesses,
        suggestions: analysis.details.suggestions,
        codeQualityMetrics: analysis.details.codeQualityMetrics,
        codeQualityDetails: analysis.details.codeQualityDetails
      };
    } else {
      // Use existing AI analysis for feedback
      return {
        score: response.aiAnalysisScore,
        feedback: response.aiAnalysisDetails.analysis,
        strengths: response.aiAnalysisDetails.strengths || [],
        weaknesses: response.aiAnalysisDetails.weaknesses || [],
        suggestions: response.aiAnalysisDetails.suggestions || [],
        codeQualityMetrics: response.aiAnalysisDetails.codeQualityMetrics,
        codeQualityDetails: response.aiAnalysisDetails.codeQualityDetails
      };
    }
  } catch (error) {
    logger.error('Error generating feedback for response:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to generate feedback', 500);
  }
}

/**
 * Generate comprehensive feedback for an entire interview
 * @param {string} interviewId - ID of the interview to generate feedback for
 * @returns {Promise<Object>} Generated comprehensive feedback
 */
export async function generateInterviewFeedback(interviewId) {
  try {
    // Get the interview with its questions and responses
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        candidate: true,
        questions: {
          include: {
            question: true,
            response: true
          }
        }
      }
    });

    if (!interview) {
      throw new ApiError('Interview not found', 404);
    }

    // Generate feedback for each response if not already analyzed
    const feedbackPromises = interview.questions.map(async (interviewQuestion) => {
      if (interviewQuestion.response) {
        return generateFeedbackForResponse(interviewQuestion.response.id);
      }
      return null;
    });

    const feedbackResults = await Promise.all(feedbackPromises);
    const validFeedback = feedbackResults.filter(Boolean);

    // Calculate overall score
    let totalScore = 0;
    validFeedback.forEach(feedback => {
      totalScore += feedback.score || 0;
    });
    const overallScore = validFeedback.length > 0 ? Math.round((totalScore / validFeedback.length) * 10) / 10 : 0;

    // Group feedback by question category
    const feedbackByCategory = {};
    interview.questions.forEach((interviewQuestion, index) => {
      const category = interviewQuestion.question.category || 'UNCATEGORIZED';
      if (!feedbackByCategory[category]) {
        feedbackByCategory[category] = [];
      }
      
      if (interviewQuestion.response && feedbackResults[index]) {
        feedbackByCategory[category].push({
          question: interviewQuestion.question,
          feedback: feedbackResults[index]
        });
      }
    });

    // Calculate category scores
    const categoryScores = {};
    Object.keys(feedbackByCategory).forEach(category => {
      const categoryFeedback = feedbackByCategory[category];
      let categoryScore = 0;
      categoryFeedback.forEach(item => {
        categoryScore += item.feedback.score || 0;
      });
      categoryScores[category] = categoryFeedback.length > 0 ? 
        Math.round((categoryScore / categoryFeedback.length) * 10) / 10 : 0;
    });

    // Collect all strengths and weaknesses
    const allStrengths = [];
    const allWeaknesses = [];
    const allSuggestions = [];

    validFeedback.forEach(feedback => {
      if (feedback.strengths) allStrengths.push(...feedback.strengths);
      if (feedback.weaknesses) allWeaknesses.push(...feedback.weaknesses);
      if (feedback.suggestions) allSuggestions.push(...feedback.suggestions);
    });

    // Deduplicate and limit to top items
    const uniqueStrengths = [...new Set(allStrengths)].slice(0, 5);
    const uniqueWeaknesses = [...new Set(allWeaknesses)].slice(0, 5);
    const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 5);

    // Generate overall recommendation based on score
    let recommendation = '';
    if (overallScore >= 80) {
      recommendation = 'Strong candidate. Recommended for next steps.';
    } else if (overallScore >= 60) {
      recommendation = 'Promising candidate. Consider for next round with focus on improvement areas.';
    } else if (overallScore >= 40) {
      recommendation = 'Average performance. May need additional screening or technical assessment.';
    } else {
      recommendation = 'Below expectations. Not recommended to proceed at this time.';
    }

    // Compile comprehensive feedback
    const comprehensiveFeedback = {
      overallScore,
      categoryScores,
      strengths: uniqueStrengths,
      weaknesses: uniqueWeaknesses,
      suggestions: uniqueSuggestions,
      recommendation,
      detailedFeedback: feedbackByCategory
    };

    // Update the interview with the feedback summary
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        feedbackSummary: recommendation,
        aiAnalysis: comprehensiveFeedback
      }
    });

    return comprehensiveFeedback;
  } catch (error) {
    logger.error('Error generating interview feedback:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to generate interview feedback', 500);
  }
}

/**
 * Generate feedback with customized template
 * @param {string} responseId - ID of the response to generate feedback for
 * @param {Object} templateOptions - Options for customizing the feedback template
 * @returns {Promise<Object>} Generated feedback using the custom template
 */
export async function generateCustomFeedback(responseId, templateOptions) {
  try {
    // Get the basic feedback first
    const basicFeedback = await generateFeedbackForResponse(responseId);
    
    // Apply template options
    const customizedFeedback = {
      ...basicFeedback,
      formattedFeedback: ''
    };
    
    // Format the feedback based on template options
    let formattedFeedback = '';
    
    // Add header if specified
    if (templateOptions.includeHeader) {
      formattedFeedback += `# Feedback Summary\n\n`;
    }
    
    // Add score if specified
    if (templateOptions.includeScore) {
      formattedFeedback += `**Score:** ${basicFeedback.score}/100\n\n`;
    }
    
    // Add main feedback
    formattedFeedback += `${basicFeedback.feedback}\n\n`;
    
    // Add strengths if specified
    if (templateOptions.includeStrengths && basicFeedback.strengths && basicFeedback.strengths.length > 0) {
      formattedFeedback += `**Strengths:**\n`;
      basicFeedback.strengths.forEach(strength => {
        formattedFeedback += `- ${strength}\n`;
      });
      formattedFeedback += '\n';
    }
    
    // Add weaknesses if specified
    if (templateOptions.includeWeaknesses && basicFeedback.weaknesses && basicFeedback.weaknesses.length > 0) {
      formattedFeedback += `**Areas for Improvement:**\n`;
      basicFeedback.weaknesses.forEach(weakness => {
        formattedFeedback += `- ${weakness}\n`;
      });
      formattedFeedback += '\n';
    }
    
    // Add suggestions if specified
    if (templateOptions.includeSuggestions && basicFeedback.suggestions && basicFeedback.suggestions.length > 0) {
      formattedFeedback += `**Suggestions:**\n`;
      basicFeedback.suggestions.forEach(suggestion => {
        formattedFeedback += `- ${suggestion}\n`;
      });
      formattedFeedback += '\n';
    }
    
    // Add code quality metrics if specified and available
    if (templateOptions.includeCodeQuality && basicFeedback.codeQualityMetrics) {
      formattedFeedback += `**Code Quality Metrics:**\n`;
      formattedFeedback += `- Maintainability: ${basicFeedback.codeQualityMetrics.maintainability}/100\n`;
      formattedFeedback += `- Reliability: ${basicFeedback.codeQualityMetrics.reliability}/100\n`;
      formattedFeedback += `- Security: ${basicFeedback.codeQualityMetrics.security}/100\n`;
      formattedFeedback += `- Performance: ${basicFeedback.codeQualityMetrics.performance}/100\n\n`;
    }
    
    // Add footer if specified
    if (templateOptions.includeFooter) {
      formattedFeedback += `\n*Generated on ${new Date().toLocaleDateString()}*`;
    }
    
    customizedFeedback.formattedFeedback = formattedFeedback;
    return customizedFeedback;
  } catch (error) {
    logger.error('Error generating custom feedback:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to generate custom feedback', 500);
  }
}

export default {
  generateFeedbackForResponse,
  generateInterviewFeedback,
  generateCustomFeedback
};