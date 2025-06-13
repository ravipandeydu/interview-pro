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

// Export consolidated service
export default {
  chatWithDatabase,
  generateDataSummary,
};
