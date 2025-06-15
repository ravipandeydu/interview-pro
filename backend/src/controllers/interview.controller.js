/**
 * Interview Controller
 *
 * This module handles HTTP requests related to interview management.
 *
 * @author AI-generated
 * @date 2023-11-15
 */

import { sendSuccess, sendPaginated } from '../utils/response.js';

/**
 * Get all interviews with filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getAllInterviews = async (req, res, next) => {
  try {
    console.log('req.container:', req.container);
    const { interviewService } = req.container.cradle;
    const { page = 1, limit = 10, status, candidateId, search } = req.query;
    
    const result = await interviewService.getAllInterviews({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      candidateId,
      search
    });
    
    sendPaginated(
      res,
      200,
      'Interviews retrieved successfully',
      result.interviews,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get interview by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getInterviewById = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const interview = await interviewService.getInterviewById(req.params.id);
    sendSuccess(res, 200, 'Interview retrieved successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const createInterview = async (req, res, next) => {
  try {
    console.log('req.container:', req.container); // Debug log
    const { interviewService } = req.container.cradle;
    const recruiterId = req.user.id; // Get the current user's ID from the JWT
    const interviewData = { ...req.body, recruiterId };
    
    const interview = await interviewService.createInterview(interviewData);
    sendSuccess(res, 201, 'Interview created successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Update interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const updateInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id } = req.params;
    const updateData = req.body;
    
    const interview = await interviewService.updateInterview(id, updateData);
    sendSuccess(res, 200, 'Interview updated successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const deleteInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    await interviewService.deleteInterview(req.params.id);
    sendSuccess(res, 200, 'Interview deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add questions to an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const addQuestionsToInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id } = req.params;
    const { questions } = req.body;
    
    const interview = await interviewService.addQuestionsToInterview(id, questions);
    sendSuccess(res, 200, 'Questions added successfully', interview);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a question from an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const removeQuestionFromInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id, questionId } = req.params;
    
    await interviewService.removeQuestionFromInterview(id, questionId);
    sendSuccess(res, 200, 'Question removed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Join an interview session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const joinInterview = async (req, res, next) => {
  try {
    const { interviewService } = req.container.cradle;
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get the interview details
    const interview = await interviewService.getInterviewById(id);
    
    // Update the interview status to IN_PROGRESS if it's currently SCHEDULED
    if (interview.status === 'SCHEDULED') {
      await interviewService.updateInterview(id, { status: 'IN_PROGRESS' });
    }
    
    // Return the interview data and a token for video chat
    // In a real implementation, you might generate a token for video service here
    sendSuccess(res, 200, 'Successfully joined the interview', {
      interview,
      token: id // Using interview ID as token for simplicity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate PDF report for an interview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const generatePdfReport = async (req, res, next) => {
  try {
    const { interviewService, responseService, aiService } = req.container.cradle;
    const { id } = req.params;
    
    // Get the interview details with candidate and questions
    const interview = await interviewService.getInterviewById(id);
    if (!interview) {
      throw new Error('Interview not found');
    }
    
    // Get all submissions for this interview
    const submissions = await responseService.getResponsesByInterviewId(id);
    
    // Create a PDF document using PDFKit
    const PDFDocument = (await import('pdfkit')).default;
    const { Readable } = await import('stream');
    
    // Create a unique filename for the PDF
    const timestamp = Date.now();
    const filename = `${id}_candidate_summary_${timestamp}.pdf`;
    
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Create a buffer to store the PDF data
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Import the Cloudflare R2 service
    const { uploadToR2 } = await import('../services/cloudflare-r2.service.js');
    
    // Add header with logo and title
    doc.fontSize(25).text('Candidate Summary Report', { align: 'center' });
    doc.moveDown();
    
    // Add interview details
    doc.fontSize(14).text('Interview Details', { underline: true });
    doc.fontSize(12).text(`Interview ID: ${interview.id}`);
    doc.text(`Title: ${interview.title}`);
    doc.text(`Date: ${new Date(interview.scheduledAt).toLocaleDateString()}`);
    doc.text(`Duration: ${interview.durationMinutes} minutes`);
    doc.moveDown();
    
    // Add candidate details
    doc.fontSize(14).text('Candidate Details', { underline: true });
    doc.fontSize(12).text(`Name: ${interview.candidate.fullName}`);
    doc.text(`Email: ${interview.candidate.email}`);
    if (interview.candidate.phone) doc.text(`Phone: ${interview.candidate.phone}`);
    if (interview.candidate.currentPosition) doc.text(`Current Position: ${interview.candidate.currentPosition}`);
    if (interview.candidate.currentCompany) doc.text(`Current Company: ${interview.candidate.currentCompany}`);
    doc.moveDown();
    
    // Add AI-generated performance summary
    doc.fontSize(14).text('Performance Summary', { underline: true });
    
    // Calculate overall score
    let totalScore = 0;
    let totalQuestions = 0;
    
    // Process each submission
    for (const submission of submissions) {
      if (submission.aiAnalysis) {
        totalScore += submission.aiAnalysis.score || 0;
        totalQuestions++;
      }
    }
    
    const overallScore = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 10) / 10 : 0;
    doc.fontSize(12).text(`Overall Score: ${overallScore}/10`);
    
    // Add technical proficiency scoring
    doc.moveDown();
    doc.fontSize(14).text('Technical Proficiency', { underline: true });
    
    // Group questions by category
    const questionsByCategory = {};
    for (const question of interview.questions) {
      const category = question.category || 'UNCATEGORIZED';
      if (!questionsByCategory[category]) {
        questionsByCategory[category] = [];
      }
      questionsByCategory[category].push(question);
    }
    
    // Add scores by category
    for (const category in questionsByCategory) {
      const questions = questionsByCategory[category];
      let categoryScore = 0;
      let categoryQuestions = 0;
      
      for (const question of questions) {
        const submission = submissions.find(s => s.questionId === question.id);
        if (submission && submission.aiAnalysis) {
          categoryScore += submission.aiAnalysis.score || 0;
          categoryQuestions++;
        }
      }
      
      const avgCategoryScore = categoryQuestions > 0 ? Math.round((categoryScore / categoryQuestions) * 10) / 10 : 0;
      doc.fontSize(12).text(`${category}: ${avgCategoryScore}/10`);
    }
    
    // Add detailed question analysis
    doc.addPage();
    doc.fontSize(16).text('Detailed Question Analysis', { align: 'center' });
    doc.moveDown();
    
    for (const submission of submissions) {
      const question = interview.questions.find(q => q.id === submission.questionId);
      if (!question) continue;
      
      doc.fontSize(14).text(question.content, { underline: true });
      doc.fontSize(10).text(`Category: ${question.category || 'N/A'} | Difficulty: ${question.difficulty || 'N/A'}`);
      doc.moveDown(0.5);
      
      // Add candidate's answer (truncated if too long)
      const answer = submission.content || 'No answer provided';
      doc.fontSize(12).text('Candidate Answer:', { underline: true });
      doc.fontSize(10).text(answer.length > 500 ? answer.substring(0, 500) + '...' : answer);
      doc.moveDown(0.5);
      
      // Add AI analysis if available
      if (submission.aiAnalysis) {
        doc.fontSize(12).text('AI Analysis:', { underline: true });
        doc.fontSize(10).text(`Score: ${submission.aiAnalysis.score}/10`);
        
        if (submission.aiAnalysis.feedback) {
          doc.fontSize(10).text('Feedback: ' + submission.aiAnalysis.feedback);
        }
        
        if (submission.aiAnalysis.strengths && submission.aiAnalysis.strengths.length > 0) {
          doc.fontSize(10).text('Strengths:');
          submission.aiAnalysis.strengths.forEach(strength => {
            doc.fontSize(10).text(`• ${strength}`);
          });
        }
        
        if (submission.aiAnalysis.weaknesses && submission.aiAnalysis.weaknesses.length > 0) {
          doc.fontSize(10).text('Areas for Improvement:');
          submission.aiAnalysis.weaknesses.forEach(weakness => {
            doc.fontSize(10).text(`• ${weakness}`);
          });
        }
        
        // Add code quality metrics for coding questions
        if (question.type === 'coding' && submission.aiAnalysis.codeQuality) {
          doc.fontSize(10).text('Code Quality Metrics:');
          const codeQuality = submission.aiAnalysis.codeQuality;
          
          doc.fontSize(9).text(`• Readability: ${codeQuality.readability || 'N/A'}`);
          doc.fontSize(9).text(`• Efficiency: ${codeQuality.efficiency || 'N/A'}`);
          doc.fontSize(9).text(`• Maintainability: ${codeQuality.maintainability || 'N/A'}`);
          doc.fontSize(9).text(`• Error Handling: ${codeQuality.errorHandling || 'N/A'}`);
        }
      }
      
      doc.moveDown();
      doc.text('-------------------------------------------');
      doc.moveDown();
    }
    
    // Add communication skills assessment
    doc.addPage();
    doc.fontSize(16).text('Communication Skills Assessment', { align: 'center' });
    doc.moveDown();
    
    // Filter for behavioral or situational questions that assess communication
    const communicationQuestions = interview.questions.filter(q => 
      q.category === 'BEHAVIORAL' || q.category === 'SITUATIONAL');
    
    if (communicationQuestions.length > 0) {
      let communicationScore = 0;
      let communicationQuestionCount = 0;
      
      for (const question of communicationQuestions) {
        const submission = submissions.find(s => s.questionId === question.id);
        if (submission && submission.aiAnalysis) {
          communicationScore += submission.aiAnalysis.score || 0;
          communicationQuestionCount++;
        }
      }
      
      const avgCommunicationScore = communicationQuestionCount > 0 ? 
        Math.round((communicationScore / communicationQuestionCount) * 10) / 10 : 0;
      
      doc.fontSize(12).text(`Overall Communication Score: ${avgCommunicationScore}/10`);
      doc.moveDown();
      
      // Add communication strengths and weaknesses
      const strengths = [];
      const weaknesses = [];
      
      for (const question of communicationQuestions) {
        const submission = submissions.find(s => s.questionId === question.id);
        if (submission && submission.aiAnalysis) {
          if (submission.aiAnalysis.strengths) {
            strengths.push(...submission.aiAnalysis.strengths);
          }
          if (submission.aiAnalysis.weaknesses) {
            weaknesses.push(...submission.aiAnalysis.weaknesses);
          }
        }
      }
      
      if (strengths.length > 0) {
        doc.fontSize(12).text('Communication Strengths:', { underline: true });
        // Deduplicate strengths
        [...new Set(strengths)].slice(0, 5).forEach(strength => {
          doc.fontSize(10).text(`• ${strength}`);
        });
        doc.moveDown();
      }
      
      if (weaknesses.length > 0) {
        doc.fontSize(12).text('Communication Areas for Improvement:', { underline: true });
        // Deduplicate weaknesses
        [...new Set(weaknesses)].slice(0, 5).forEach(weakness => {
          doc.fontSize(10).text(`• ${weakness}`);
        });
        doc.moveDown();
      }
    } else {
      doc.fontSize(12).text('No communication-focused questions were asked in this interview.');
    }
    
    // Add summary and recommendations
    doc.addPage();
    doc.fontSize(16).text('Summary and Recommendations', { align: 'center' });
    doc.moveDown();
    
    // Overall recommendation based on score
    let recommendation = '';
    if (overallScore >= 8) {
      recommendation = 'Strong candidate. Recommended for next steps.';
    } else if (overallScore >= 6) {
      recommendation = 'Promising candidate. Consider for next round with focus on improvement areas.';
    } else if (overallScore >= 4) {
      recommendation = 'Average performance. May need additional screening or technical assessment.';
    } else {
      recommendation = 'Below expectations. Not recommended to proceed at this time.';
    }
    
    doc.fontSize(12).text(`Overall Recommendation: ${recommendation}`);
    doc.moveDown();
    
    // Add footer with date generated
    doc.fontSize(10).text(`Report generated on ${new Date().toLocaleString()}`, { align: 'center' });
    
    // Finalize the PDF
    doc.end();
    
    // Wait for the PDF to be fully generated
    await new Promise((resolve) => {
      doc.on('end', resolve);
    });
    
    // Combine all chunks into a single buffer
    const pdfBuffer = Buffer.concat(chunks);
    
    // Upload the PDF to Cloudflare R2
    const pdfUrl = await uploadToR2(
      pdfBuffer,
      filename,
      'application/pdf',
      'reports'
    );
    
    sendSuccess(res, 200, 'PDF report generated successfully', { url: pdfUrl });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    next(error);
  }
};

export default {
  getAllInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  addQuestionsToInterview,
  removeQuestionFromInterview,
  joinInterview,
  generatePdfReport
};