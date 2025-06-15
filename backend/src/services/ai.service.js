/**
 * AI Service Module
 *
 * Provides AI-powered functionalities for translating natural language queries to PostgreSQL queries,
 * executing those queries, and generating human-readable summaries or responses.
 *
 * @module services/aiService
 * @author Auto-generated
 * @date " + new Date().toISOString().split('T')[0] + "
 */

import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { ApiError } from '../middlewares/error.middleware.js';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: config.ai.apiKey });
const prisma = new PrismaClient();

/**
 * Ensure that the AI API key is configured before making requests.
 * @throws {ApiError} When API key is missing or invalid.
 */
function ensureApiKey() {
  if (!config.ai || !config.ai.apiKey) {
    throw new ApiError('AI API key is not configured.', 500);
  }
}

/**
 * Get available models from Prisma schema
 * @returns {Promise<Array<string>>} Array of model names
 */
async function getAvailableModels() {
  // Get the list of models from Prisma's dmmf
  const modelNames = Object.keys(prisma);
  
  // Filter out non-model properties
  return modelNames.filter(name => {
    return (
      typeof prisma[name] === 'object' && 
      prisma[name] !== null && 
      !name.startsWith('_') &&
      name !== 'constructor' &&
      name !== 'disconnect' &&
      name !== 'connect' &&
      name !== '$on' &&
      name !== '$transaction' &&
      name !== '$use'
    );
  });
}

/**
 * Convert a natural language question into a Prisma query specification using OpenAI.
 * @param {string} question - The user-provided natural language question.
 * @returns {Promise<Object>} Object containing model, where, select, orderBy, and take.
 * @throws {ApiError} On errors from OpenAI or invalid models.
 */
export async function naturalLanguageToPrismaQuery(question) {
  ensureApiKey();
  try {
    // Retrieve available model names from Prisma
    const modelNames = await getAvailableModels();

    // Construct prompt for the AI
    const prompt = `You are a Prisma query generator. Convert the following natural language question to a Prisma query specification.
Available models: ${modelNames.join(', ')}
Question: ${question}
Respond only with valid JSON: { model, where, select, orderBy, take }`;

    // Call OpenAI chat completion
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    // Parse AI's JSON response
    const content = completion.choices?.[0]?.message?.content?.trim();
    let spec;
    try {
      spec = JSON.parse(content);
    } catch (parseErr) {
      logger.error('Failed to parse AI response as JSON', { content });
      throw new ApiError('Invalid AI response format.', 500);
    }

    // Validate the specified model
    if (!modelNames.includes(spec.model)) {
      throw new ApiError(`Model '${spec.model}' not found.`, 400);
    }
    return spec;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    logger.error('naturalLanguageToPrismaQuery error', { message: err.message });
    throw new ApiError('Failed to transform natural language query.', 500);
  }
}

/**
 * Execute a Prisma query based on provided specification.
 * @param {Object} spec - The query specification: { model, where, select, orderBy, take }
 * @returns {Promise<Array>} Array of resulting documents.
 * @throws {ApiError} On database access errors.
 */
export async function executePrismaQuery(spec) {
  try {
    const { model, where = {}, select, orderBy, take } = spec;
    
    // Build query options
    const options = {};
    if (where) options.where = where;
    if (select) options.select = select;
    if (orderBy) options.orderBy = orderBy;
    if (take) options.take = take;
    
    // Execute query using dynamic model access
    return await prisma[model].findMany(options);
  } catch (err) {
    logger.error('executePrismaQuery error', { message: err.message });
    throw new ApiError('Database query execution failed.', 500);
  }
}

/**
 * Generate a natural language answer based on query results using OpenAI.
 * @param {string} question - The original user question.
 * @param {Array} results - Array of documents from the query.
 * @returns {Promise<string>} The AI-generated natural language response.
 * @throws {ApiError} On AI service errors.
 */
export async function generateResponse(question, results) {
  ensureApiKey();
  try {
    const summary = JSON.stringify(results).slice(0, 2000); // limit size
    const prompt = `You are an AI assistant.\nOriginal question: ${question}\nQuery results: ${summary}\nProvide a concise, human-readable answer. If no results, explain no data found.`;

    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    logger.error('generateResponse error', { message: err.message });
    throw new ApiError('Failed to generate natural language response.', 500);
  }
}

/**
 * Main entry: handle a natural language chat with the database.
 * @param {string} question - The user's natural language question.
 * @returns {Promise<Object>} Object with answer and metadata.
 */
export async function chatWithDatabase(question) {
  try {
    const spec = await naturalLanguageToPrismaQuery(question);
    const results = await executePrismaQuery(spec);
    const answer = await generateResponse(question, results);

    return {
      answer,
      metadata: {
        model: spec.model,
        resultCount: results.length,
        query: process.env.NODE_ENV === 'development' ? spec.where : undefined,
      },
    };
  } catch (err) {
    logger.error('chatWithDatabase error', { message: err.message });
    throw err;
  }
}

/**
 * Generate a Markdown summary of data in a model over a specified timeframe.
 * @param {string} modelName - Prisma model name.
 * @param {string} [timeframe='month'] - One of 'day', 'week', 'month', 'year'.
 * @returns {Promise<Object>} Summary content and metadata.
 */
export async function generateDataSummary(modelName, timeframe = 'month') {
  ensureApiKey();
  try {
    // Verify model exists
    const modelNames = await getAvailableModels();
    if (!modelNames.includes(modelName)) {
      throw new ApiError(`Model '${modelName}' not found.`, 404);
    }

    // Count total records
    const total = await prisma[modelName].count();
    if (total === 0) {
      return { summary: `The ${modelName} model is empty.`, count: 0 };
    }

    // Determine date range
    const now = new Date();
    const start = new Date(now);
    switch (timeframe) {
      case 'day':
        start.setDate(now.getDate() - 1);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }

    // Fetch samples
    const sample = await prisma[modelName].findMany({
      take: 10,
    });
    
    // Fetch recent records if createdAt field exists
    let recent = [];
    try {
      recent = await prisma[modelName].findMany({
        where: {
          createdAt: {
            gte: start
          }
        },
        take: 50,
      });
    } catch (err) {
      // If createdAt doesn't exist, this will fail silently
      logger.debug('Could not query by createdAt, field may not exist', { modelName });
    }

    const prompt = `You are a data analyst. Summarize the '${modelName}' model (total: ${total}, timeframe: ${timeframe}).\nSamples: ${JSON.stringify(sample)}${recent.length ? `\nRecent: ${JSON.stringify(recent)}` : ''}`;
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    return {
      summary: completion.choices[0].message.content.trim(),
      count: total,
      timeframe,
      sampleCount: sample.length,
      recentCount: recent.length,
    };
  } catch (err) {
    logger.error('generateDataSummary error', { message: err.message });
    if (err instanceof ApiError) throw err;
    throw new ApiError('Data summary generation failed.', 500);
  }
}

/**
 * Generate interview questions based on job title, skills, and categories
 * @param {Object} options - Options for generating questions
 * @param {string} options.jobTitle - Job title
 * @param {Array<string>} options.skills - List of skills
 * @param {Array<string>} options.categories - List of question categories
 * @param {number} options.count - Number of questions to generate
 * @returns {Promise<Array<Object>>} Array of generated questions
 */
export async function generateInterviewQuestions({ jobTitle, skills, categories, count = 5 }) {
  ensureApiKey();
  try {
    // Validate input
    if (!jobTitle) {
      throw new ApiError('Job title is required', 400);
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      throw new ApiError('At least one skill is required', 400);
    }

    // Prepare prompt for OpenAI
    const prompt = `Generate ${count} unique interview questions for a ${jobTitle} position.

Skills: ${skills.join(', ')}
${categories && categories.length > 0 ? `Categories: ${categories.join(', ')}\n` : ''}

For each question, provide:
1. The question content
2. The category (${categories && categories.length > 0 ? categories.join(', ') : 'TECHNICAL, BEHAVIORAL, SITUATIONAL'})
3. Difficulty level (EASY, MEDIUM, HARD)
4. Expected answer
5. Relevant tags

Format the response as a valid JSON array of objects with the following structure:
[
  {
    "content": "question text",
    "category": "CATEGORY",
    "difficulty": "DIFFICULTY",
    "expectedAnswer": "expected answer text",
    "tags": ["tag1", "tag2"]
  }
]
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    // Parse the response
    const responseText = completion.choices[0].message.content.trim();
    let questions;
    
    try {
      // Find the JSON part in the response
      const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } catch (parseError) {
      logger.error('Error parsing OpenAI response:', parseError);
      logger.debug('Response text:', responseText);
      throw new ApiError('Failed to parse AI-generated questions', 500);
    }

    // Validate and format questions
    const formattedQuestions = questions.map(q => ({
      content: q.content,
      category: q.category,
      difficulty: q.difficulty,
      expectedAnswer: q.expectedAnswer,
      tags: Array.isArray(q.tags) ? q.tags : [],
      isActive: true
    }));

    return formattedQuestions;
  } catch (error) {
    logger.error('Error generating interview questions:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to generate interview questions', 500);
  }
}

/**
 * Analyze a candidate's response to an interview question
 * @param {Object} options - Options for analyzing the response
 * @param {Object} options.question - The question object
 * @param {string} options.responseContent - The candidate's response content
 * @returns {Promise<Object>} Analysis results with score and details
 */
export async function analyzeResponse({ question, responseContent }) {
  ensureApiKey();
  console.log('analyzeResponse', { question, responseContent });
  try {
    // Validate input
    if (!question || !question.content) {
      throw new ApiError('Question is required', 400);
    }

    if (!responseContent) {
      throw new ApiError('Response content is required', 400);
    }

    // Check if this is a coding question
    const isCodingQuestion = question.category === 'TECHNICAL' || question.category === 'PROBLEM_SOLVING';
    
    // Use different prompts based on question type
    let prompt;
    
    if (isCodingQuestion) {
      // For coding questions, use code quality analysis
      prompt = `You are an expert software engineer evaluating a candidate's code submission for the following interview question:

Question: ${question.content}
Category: ${question.category}
Difficulty: ${question.difficulty}
Expected Answer: ${question.expectedAnswer || 'Not provided'}

Candidate's Code Submission:
\`\`\`
${responseContent}
\`\`\`

Please perform a comprehensive code quality analysis and provide:
1. A score from 0 to 100 based on overall code quality and correctness
2. Detailed feedback on the code's strengths and weaknesses
3. Specific suggestions for improvement
4. Code quality metrics analysis covering:
   - Static code analysis (syntax, structure, organization)
   - Best practices adherence
   - Performance optimization opportunities
   - Potential security vulnerabilities
   - Code style and readability

Format your response as a valid JSON object with the following structure:
{
  "score": number,
  "analysis": "detailed analysis text",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...],
  "codeQualityMetrics": {
    "maintainability": number (0-100),
    "reliability": number (0-100),
    "security": number (0-100),
    "performance": number (0-100)
  },
  "codeQualityDetails": {
    "staticAnalysis": ["finding1", "finding2", ...],
    "bestPractices": ["practice1", "practice2", ...],
    "performanceIssues": ["issue1", "issue2", ...],
    "securityVulnerabilities": ["vulnerability1", "vulnerability2", ...]
  }
}
`;
    } else {
      // For non-coding questions, use the original prompt
      prompt = `You are an expert interviewer evaluating a candidate's response to the following interview question:

Question: ${question.content}
Category: ${question.category}
Difficulty: ${question.difficulty}
Expected Answer: ${question.expectedAnswer || 'Not provided'}

Candidate's Response: ${responseContent}

Please analyze the response and provide:
1. A score from 0 to 100 based on how well the response addresses the question
2. Detailed feedback on the strengths and weaknesses of the response
3. Suggestions for improvement

Format your response as a valid JSON object with the following structure:
{
  "score": number,
  "analysis": "detailed analysis text",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}
`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: config.ai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    // Parse the response
    const responseText = completion.choices[0].message.content.trim();
    let analysis;
    
    try {
      // Find the JSON part in the response
      const jsonMatch = responseText.match(/\{.*\}/s);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not extract JSON from response');
      }
    } catch (parseError) {
      logger.error('Error parsing OpenAI response:', parseError);
      logger.debug('Response text:', responseText);
      throw new ApiError('Failed to parse AI analysis', 500);
    }

    console.log("analysis", responseText, analysis)

    return {
      score: analysis.score,
      details: {
        analysis: analysis.analysis,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        suggestions: analysis.suggestions || []
      }
    };
  } catch (error) {
    logger.error('Error analyzing response:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to analyze response', 500);
  }
}

// Export consolidated service
export default {
  chatWithDatabase,
  generateDataSummary,
  generateInterviewQuestions,
  analyzeResponse
};
