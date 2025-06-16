/**
 * Plagiarism Detection Service
 *
 * This module provides services for detecting plagiarism in code submissions.
 * It analyzes code for similarities with external sources and other submissions.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import config from '../config/index.js';
import { ApiError } from '../middlewares/error.middleware.js';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

// Initialize OpenAI client
let openai;
function ensureApiKey() {
  if (!openai) {
    if (!config.ai.apiKey) {
      throw new ApiError('OpenAI API key is not configured', 500);
    }
    openai = new OpenAI({
      apiKey: config.ai.apiKey,
    });
  }
}

/**
 * Detect plagiarism in a submission
 * @param {string} submissionId - ID of the submission to check for plagiarism
 * @returns {Promise<Object>} Plagiarism report with score and matches
 */
export async function detectPlagiarism(submissionId) {
  try {
    ensureApiKey();
    
    // Get the submission
    const submission = await prisma.response.findUnique({
      where: { id: submissionId },
      include: {
        interview: {
          select: {
            id: true,
            title: true,
          },
        },
        interviewQuestion: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!submission) {
      throw new ApiError('Submission not found', 404);
    }

    // Get the code content from the submission
    const codeContent = submission.content;
    
    // Check if this is a coding question
    const question = submission.interviewQuestion.question;
    const isCodingQuestion = question.category === 'TECHNICAL' || question.category === 'PROBLEM_SOLVING';
    
    if (!isCodingQuestion) {
      return {
        score: 0,
        matches: [],
        message: 'Plagiarism detection is only available for coding questions.'
      };
    }

    // Get other submissions for the same question across all interviews
    const otherSubmissions = await prisma.response.findMany({
      where: {
        id: { not: submissionId },
        interviewQuestion: {
          questionId: question.id, // Compare based on question ID instead of interview ID
          question: {
            category: { in: ['TECHNICAL', 'PROBLEM_SOLVING'] }
          }
        }
      },
      include: {
        interview: {
          select: {
            id: true,
            title: true,
          },
        },
        interviewQuestion: {
          include: {
            question: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Use OpenAI to detect plagiarism
    const prompt = `You are an expert plagiarism detection system for code submissions. Analyze the following code submission for potential plagiarism:

Question: ${question.content}
Category: ${question.category}
Difficulty: ${question.difficulty}

Candidate's Code Submission:
\`\`\`
${codeContent}
\`\`\`

${otherSubmissions.length > 0 ? `Compare with other submissions for the same question from different interviews:
${otherSubmissions.map((s, i) => `Submission ${i + 1} from candidate "${s.candidate?.name || 'Unknown'}" in interview "${s.interview?.title || 'Unknown'}":
\`\`\`
${s.content}
\`\`\`
`).join('\n')}` : ''}

Please analyze the code for:
1. Similarities with common online sources (like Stack Overflow, GitHub, etc.)
2. Similarities with the other provided submissions
3. Evidence of code that appears to be directly copied rather than independently written

Provide a plagiarism score from 0 to 100, where:
- 0 means completely original code
- 100 means completely plagiarized code

Also identify specific matches with their sources and similarity percentages.

Format your response as a valid JSON object with the following structure:
{
  "score": number,
  "matches": [
    {
      "source": "description of source (e.g., 'Candidate Name - Interview Title', 'Stack Overflow', etc.)",
      "similarity": number (0-100),
      "matchedText": "the specific code segment that matches",
      "sourceType": "internal" or "external",
      "candidateId": "optional - only for internal sources",
      "interviewId": "optional - only for internal sources"
    },
    ...
  ]
}
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, // Lower temperature for more deterministic results
    });

    // Parse the response
    const responseText = completion.choices[0].message.content.trim();
    let plagiarismReport;
    
    try {
      // Find the JSON part in the response
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        plagiarismReport = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } catch (parseError) {
      logger.error('Error parsing OpenAI response:', parseError);
      logger.debug('Response text:', responseText);
      throw new ApiError('Failed to parse plagiarism analysis', 500);
    }

    // Update the submission with the plagiarism report
    // Transform the matches to include additional information for internal sources
    const enhancedMatches = plagiarismReport.matches.map(match => {
      // For internal sources, add candidate and interview information
      if (match.sourceType === 'internal' && match.candidateId && match.interviewId) {
        // Find the corresponding submission from otherSubmissions
        const sourceSubmission = otherSubmissions.find(s => 
          s.candidateId === match.candidateId && s.interviewId === match.interviewId
        );
        
        if (sourceSubmission) {
          return {
            ...match,
            source: `${sourceSubmission.candidate?.name || 'Unknown'} - ${sourceSubmission.interview?.title || 'Unknown Interview'}`,
          };
        }
      }
      return match;
    });

    const enhancedReport = {
      ...plagiarismReport,
      matches: enhancedMatches
    };

    const updatedSubmission = await prisma.response.update({
      where: { id: submissionId },
      data: {
        aiAnalysisDetails: {
          ...(submission.aiAnalysisDetails || {}),
          plagiarismReport: enhancedReport,
        },
      },
    });

    return enhancedReport;
  } catch (error) {
    logger.error('Error detecting plagiarism:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to detect plagiarism', 500);
  }
}

/**
 * Get plagiarism report for a submission
 * @param {string} submissionId - ID of the submission
 * @returns {Promise<Object>} Plagiarism report with score and matches
 */
export async function getPlagiarismReport(submissionId) {
  try {
    // Get the submission
    const submission = await prisma.response.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new ApiError('Submission not found', 404);
    }

    // Check if plagiarism report exists
    if (submission.aiAnalysisDetails && submission.aiAnalysisDetails.plagiarismReport) {
      return submission.aiAnalysisDetails.plagiarismReport;
    }

    // If no report exists, generate one
    return await detectPlagiarism(submissionId);
  } catch (error) {
    logger.error('Error getting plagiarism report:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to get plagiarism report', 500);
  }
}

const plagiarismService = {
  detectPlagiarism,
  getPlagiarismReport,
};

export default plagiarismService;