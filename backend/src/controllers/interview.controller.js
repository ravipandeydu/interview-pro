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
    const fs = await import('fs');
    const path = await import('path');
    
    // Create a unique filename for the PDF
    const timestamp = Date.now();
    const filename = `${id}_candidate_summary_${timestamp}.pdf`;
    
    // Create a new PDF document with better margins and layout
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      info: {
        Title: `Candidate Summary - ${interview.candidate.fullName}`,
        Author: 'InterviewPro',
        Subject: `Interview Report for ${interview.title}`,
        Keywords: 'interview, assessment, candidate, report',
        CreationDate: new Date(),
      }
    });
    
    // Create a buffer to store the PDF data
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    
    // Import the Cloudflare R2 service
    const { uploadToR2 } = await import('../services/cloudflare-r2.service.js');
    
    // Define colors based on the application theme
    const colors = {
      primary: '#000000',
      secondary: '#4B5563',
      accent: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      light: '#F3F4F6',
      dark: '#1F2937',
      muted: '#9CA3AF',
    };
    
    // Helper function to draw a rounded rectangle
    const drawRoundedRect = (x, y, width, height, radius, fillColor) => {
      doc.roundedRect(x, y, width, height, radius).fill(fillColor);
    };
    
    // Helper function to create a score gauge
    const drawScoreGauge = (x, y, score, label, width = 150) => {
      const gaugeHeight = 20;
      const radius = gaugeHeight / 2;
      
      // Draw background
      doc.roundedRect(x, y, width, gaugeHeight, radius).fill(colors.light);
      
      // Calculate fill width based on score (0-10)
      const fillWidth = Math.max(0, Math.min(10, score)) / 10 * width;
      
      // Determine color based on score
      let fillColor;
      if (score >= 8) fillColor = colors.success;
      else if (score >= 6) fillColor = colors.accent;
      else if (score >= 4) fillColor = colors.warning;
      else fillColor = colors.danger;
      
      // Draw filled portion if score > 0
      if (fillWidth > 0) {
        doc.roundedRect(x, y, fillWidth, gaugeHeight, radius).fill(fillColor);
      }
      
      // Add score text
      doc.fillColor(colors.dark)
         .fontSize(10)
         .text(`${score}/10`, x + width + 10, y + 5);
      
      // Add label below
      doc.fillColor(colors.secondary)
         .fontSize(9)
         .text(label, x, y + gaugeHeight + 5, { width });
    };
    
    // Add header with logo and title
    // Draw header background
    drawRoundedRect(50, 50, doc.page.width - 100, 80, 5, colors.light);
    
    // Add title
    doc.fillColor(colors.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('InterviewPro', 70, 70);
    
    doc.fillColor(colors.accent)
       .fontSize(18)
       .font('Helvetica')
       .text('Candidate Assessment Report', 70, 100);
    
    // Add date on the right
    doc.fillColor(colors.secondary)
       .fontSize(10)
       .text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 
             doc.page.width - 200, 70, { align: 'right' });
    
    doc.moveDown(3);
    
    // Add interview details in a styled box
    drawRoundedRect(50, doc.y, doc.page.width - 100, 100, 5, '#F9FAFB');
    
    doc.fillColor(colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Interview Details', 70, doc.y + 15);
    
    doc.fillColor(colors.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text(`Title: ${interview.title}`, 70, doc.y + 15);
    doc.text(`Date: ${new Date(interview.scheduledAt).toLocaleDateString()}`, 70, doc.y + 5);
    doc.text(`Duration: ${interview.durationMinutes} minutes`, 70, doc.y + 5);
    doc.text(`Position: ${interview.position || 'Not specified'}`, 70, doc.y + 5);
    
    doc.moveDown(4);
    
    // Add candidate details in a styled box
    drawRoundedRect(50, doc.y, doc.page.width - 100, 120, 5, '#F9FAFB');
    
    doc.fillColor(colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Candidate Details', 70, doc.y + 15);
    
    doc.fillColor(colors.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text(`Name: ${interview.candidate.fullName}`, 70, doc.y + 15);
    doc.text(`Email: ${interview.candidate.email}`, 70, doc.y + 5);
    if (interview.candidate.phone) doc.text(`Phone: ${interview.candidate.phone}`, 70, doc.y + 5);
    if (interview.candidate.currentPosition) doc.text(`Current Position: ${interview.candidate.currentPosition}`, 70, doc.y + 5);
    if (interview.candidate.currentCompany) doc.text(`Current Company: ${interview.candidate.currentCompany}`, 70, doc.y + 5);
    
    doc.moveDown(4);
    
    // Add AI-generated performance summary
    doc.fillColor(colors.primary)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('Performance Summary', { align: 'center' });
    
    doc.moveDown();
    
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
    
    // Draw overall score gauge
    drawRoundedRect(50, doc.y, doc.page.width - 100, 80, 5, '#F9FAFB');
    
    doc.fillColor(colors.primary)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Overall Performance', 70, doc.y + 15);
    
    // Draw a large score gauge
    const gaugeY = doc.y + 15;
    const gaugeWidth = doc.page.width - 200;
    const gaugeHeight = 30;
    const gaugeRadius = gaugeHeight / 2;
    
    // Draw background
    doc.roundedRect(70, gaugeY, gaugeWidth, gaugeHeight, gaugeRadius).fill(colors.light);
    
    // Calculate fill width based on score (0-10)
    const fillWidth = Math.max(0, Math.min(10, overallScore)) / 10 * gaugeWidth;
    
    // Determine color based on score
    let fillColor;
    if (overallScore >= 8) fillColor = colors.success;
    else if (overallScore >= 6) fillColor = colors.accent;
    else if (overallScore >= 4) fillColor = colors.warning;
    else fillColor = colors.danger;
    
    // Draw filled portion if score > 0
    if (fillWidth > 0) {
      doc.roundedRect(70, gaugeY, fillWidth, gaugeHeight, gaugeRadius).fill(fillColor);
    }
    
    // Add score text
    doc.fillColor(colors.dark)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(`${overallScore}/10`, gaugeWidth + 80, gaugeY + 8);
    
    doc.moveDown(4);
    
    // Add technical proficiency scoring
    doc.fillColor(colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Technical Proficiency by Category', { align: 'center' });
    
    doc.moveDown();
    
    // Group questions by category
    const questionsByCategory = {};
    for (const question of interview.questions) {
      const category = question.category || 'UNCATEGORIZED';
      if (!questionsByCategory[category]) {
        questionsByCategory[category] = [];
      }
      questionsByCategory[category].push(question);
    }
    
    // Draw category box
    drawRoundedRect(50, doc.y, doc.page.width - 100, 30 + Object.keys(questionsByCategory).length * 40, 5, '#F9FAFB');
    
    doc.moveDown();
    
    // Add scores by category with visual gauges
    let yOffset = doc.y;
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
      
      // Draw score gauge for this category
      drawScoreGauge(70, yOffset, avgCategoryScore, category, 300);
      yOffset += 40;
    }
    
    // Add detailed question analysis
    doc.addPage();
    
    // Add header to the new page
    drawRoundedRect(50, 50, doc.page.width - 100, 60, 5, colors.light);
    
    doc.fillColor(colors.primary)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('Detailed Question Analysis', 70, 70, { align: 'center' });
    
    doc.moveDown(3);
    
    // Counter for question number
    let questionNumber = 1;
    
    for (const submission of submissions) {
      const question = interview.questions.find(q => q.id === submission.questionId);
      if (!question) continue;
      
      // Check if we need a new page (if less than 150 points left on the page)
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
        doc.moveDown();
      }
      
      // Draw question box
      drawRoundedRect(50, doc.y, doc.page.width - 100, 40, 5, colors.accent);
      
      // Question header
      doc.fillColor('white')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(`Question ${questionNumber}: ${question.content.substring(0, 60)}${question.content.length > 60 ? '...' : ''}`, 70, doc.y - 30, { width: doc.page.width - 140 });
      
      doc.moveDown(2);
      
      // Question metadata
      doc.fillColor(colors.secondary)
         .fontSize(10)
         .font('Helvetica')
         .text(`Category: ${question.category || 'N/A'} | Difficulty: ${question.difficulty || 'N/A'} | Type: ${question.type || 'N/A'}`, 70, doc.y);
      
      doc.moveDown();
      
      // Draw answer box
      drawRoundedRect(70, doc.y, doc.page.width - 140, 80, 5, '#F9FAFB');
      
      // Add candidate's answer (truncated if too long)
      const answer = submission.content || 'No answer provided';
      doc.fillColor(colors.primary)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Candidate Answer:', 90, doc.y + 10);
      
      doc.fillColor(colors.secondary)
         .fontSize(10)
         .font('Helvetica')
         .text(answer.length > 300 ? answer.substring(0, 300) + '...' : answer, 90, doc.y + 10, { width: doc.page.width - 180 });
      
      doc.moveDown(5);
      
      // Add AI analysis if available
      if (submission.aiAnalysis) {
        // Draw analysis box
        drawRoundedRect(70, doc.y, doc.page.width - 140, 120, 5, '#F0F9FF');
        
        doc.fillColor(colors.primary)
           .fontSize(11)
           .font('Helvetica-Bold')
           .text('AI Analysis:', 90, doc.y + 10);
        
        // Draw score gauge
        drawScoreGauge(90, doc.y + 10, submission.aiAnalysis.score, 'Score', 200);
        
        doc.moveDown(2);
        
        if (submission.aiAnalysis.feedback) {
          doc.fillColor(colors.secondary)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Feedback:', 90, doc.y + 10);
          
          doc.fillColor(colors.secondary)
             .fontSize(9)
             .font('Helvetica')
             .text(submission.aiAnalysis.feedback, 90, doc.y + 5, { width: doc.page.width - 180 });
          
          doc.moveDown();
        }
        
        // Two-column layout for strengths and weaknesses
        const colWidth = (doc.page.width - 180) / 2;
        
        // Check if we need a new page
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
          doc.moveDown();
        }
        
        // Draw strengths and weaknesses box
        drawRoundedRect(70, doc.y, doc.page.width - 140, 120, 5, '#F0FFF4');
        
        // Left column: Strengths
        if (submission.aiAnalysis.strengths && submission.aiAnalysis.strengths.length > 0) {
          doc.fillColor(colors.success)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Strengths:', 90, doc.y + 10);
          
          submission.aiAnalysis.strengths.forEach((strength, idx) => {
            if (idx < 3) { // Limit to 3 strengths
              doc.fillColor(colors.secondary)
                 .fontSize(9)
                 .font('Helvetica')
                 .text(`• ${strength}`, 90, doc.y + 5, { width: colWidth - 20 });
            }
          });
        }
        
        // Right column: Weaknesses
        if (submission.aiAnalysis.weaknesses && submission.aiAnalysis.weaknesses.length > 0) {
          doc.fillColor(colors.warning)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Areas for Improvement:', 90 + colWidth, doc.y - (submission.aiAnalysis.strengths?.length || 0) * 15);
          
          submission.aiAnalysis.weaknesses.forEach((weakness, idx) => {
            if (idx < 3) { // Limit to 3 weaknesses
              doc.fillColor(colors.secondary)
                 .fontSize(9)
                 .font('Helvetica')
                 .text(`• ${weakness}`, 90 + colWidth, doc.y - ((submission.aiAnalysis.strengths?.length || 0) - idx) * 15, { width: colWidth - 20 });
            }
          });
        }
        
        doc.moveDown(7);
        
        // Add code quality metrics for coding questions
        if (question.type === 'coding' && submission.aiAnalysis.codeQuality) {
          // Draw code quality box
          drawRoundedRect(70, doc.y, doc.page.width - 140, 80, 5, '#F0F4FF');
          
          doc.fillColor(colors.accent)
             .fontSize(10)
             .font('Helvetica-Bold')
             .text('Code Quality Metrics:', 90, doc.y + 10);
          
          const codeQuality = submission.aiAnalysis.codeQuality;
          const metrics = [
            { name: 'Readability', value: codeQuality.readability || 'N/A' },
            { name: 'Efficiency', value: codeQuality.efficiency || 'N/A' },
            { name: 'Maintainability', value: codeQuality.maintainability || 'N/A' },
            { name: 'Error Handling', value: codeQuality.errorHandling || 'N/A' }
          ];
          
          // Display metrics in a grid
          let metricX = 90;
          let metricY = doc.y + 15;
          
          metrics.forEach((metric, idx) => {
            const xPos = metricX + (idx % 2) * 200;
            const yPos = metricY + Math.floor(idx / 2) * 20;
            
            doc.fillColor(colors.secondary)
               .fontSize(9)
               .font('Helvetica-Bold')
               .text(`${metric.name}:`, xPos, yPos);
            
            doc.fillColor(colors.dark)
               .fontSize(9)
               .font('Helvetica')
               .text(metric.value, xPos + 80, yPos);
          });
          
          doc.moveDown(5);
        }
      }
      
      // Add separator between questions
      doc.moveDown();
      doc.strokeColor(colors.muted)
         .lineWidth(1)
         .moveTo(70, doc.y)
         .lineTo(doc.page.width - 70, doc.y)
         .stroke();
      doc.moveDown(2);
      
      questionNumber++;
    }
    
    // Add communication skills assessment
    doc.addPage();
    
    // Add header to the new page
    drawRoundedRect(50, 50, doc.page.width - 100, 60, 5, colors.light);
    
    doc.fillColor(colors.primary)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('Communication Skills Assessment', 70, 70, { align: 'center' });
    
    doc.moveDown(3);
    
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
      
      // Draw communication score box
      drawRoundedRect(50, doc.y, doc.page.width - 100, 80, 5, '#F9FAFB');
      
      doc.fillColor(colors.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Communication Proficiency', 70, doc.y + 15);
      
      // Draw a score gauge for communication
      const commGaugeY = doc.y + 15;
      const commGaugeWidth = doc.page.width - 200;
      const commGaugeHeight = 30;
      const commGaugeRadius = commGaugeHeight / 2;
      
      // Draw background
      doc.roundedRect(70, commGaugeY, commGaugeWidth, commGaugeHeight, commGaugeRadius).fill(colors.light);
      
      // Calculate fill width based on score (0-10)
      const commFillWidth = Math.max(0, Math.min(10, avgCommunicationScore)) / 10 * commGaugeWidth;
      
      // Determine color based on score
      let commFillColor;
      if (avgCommunicationScore >= 8) commFillColor = colors.success;
      else if (avgCommunicationScore >= 6) commFillColor = colors.accent;
      else if (avgCommunicationScore >= 4) commFillColor = colors.warning;
      else commFillColor = colors.danger;
      
      // Draw filled portion if score > 0
      if (commFillWidth > 0) {
        doc.roundedRect(70, commGaugeY, commFillWidth, commGaugeHeight, commGaugeRadius).fill(commFillColor);
      }
      
      // Add score text
      doc.fillColor(colors.dark)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(`${avgCommunicationScore}/10`, commGaugeWidth + 80, commGaugeY + 8);
      
      doc.moveDown(4);
      
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
      
      // Create a two-column layout for strengths and weaknesses
      const colWidth = (doc.page.width - 140) / 2;
      
      // Draw strengths and weaknesses container
      drawRoundedRect(50, doc.y, doc.page.width - 100, 200, 5, '#F9FAFB');
      
      // Left column: Strengths
      if (strengths.length > 0) {
        doc.fillColor(colors.success)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Communication Strengths', 70, doc.y + 15);
        
        // Draw strengths box
        drawRoundedRect(70, doc.y + 10, colWidth - 30, 150, 5, '#F0FFF4');
        
        doc.moveDown(1);
        
        // Deduplicate strengths
        [...new Set(strengths)].slice(0, 5).forEach((strength, idx) => {
          doc.fillColor(colors.secondary)
             .fontSize(10)
             .font('Helvetica')
             .text(`${idx + 1}. ${strength}`, 90, doc.y + 10, { width: colWidth - 50 });
          
          doc.moveDown(0.5);
        });
      }
      
      // Right column: Weaknesses
      if (weaknesses.length > 0) {
        doc.fillColor(colors.warning)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('Areas for Improvement', 70 + colWidth, doc.y - (strengths.length > 0 ? 120 : 0));
        
        // Draw weaknesses box
        drawRoundedRect(70 + colWidth, doc.y - (strengths.length > 0 ? 110 : 0), colWidth - 30, 150, 5, '#FFF5F5');
        
        let weaknessY = doc.y - (strengths.length > 0 ? 100 : 0);
        
        // Deduplicate weaknesses
        [...new Set(weaknesses)].slice(0, 5).forEach((weakness, idx) => {
          doc.fillColor(colors.secondary)
             .fontSize(10)
             .font('Helvetica')
             .text(`${idx + 1}. ${weakness}`, 90 + colWidth, weaknessY, { width: colWidth - 50 });
          
          weaknessY += 20;
        });
      }
      
      doc.moveDown(10);
    } else {
      // Draw info box for no communication questions
      drawRoundedRect(50, doc.y, doc.page.width - 100, 80, 5, '#FFF5F5');
      
      doc.fillColor(colors.secondary)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('No communication-focused questions were asked in this interview.', 70, doc.y + 30, { align: 'center' });
      
      doc.moveDown(5);
    }
    
    // Add summary and recommendations
    doc.addPage();
    
    // Add header to the new page
    drawRoundedRect(50, 50, doc.page.width - 100, 60, 5, colors.light);
    
    doc.fillColor(colors.primary)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('Summary and Recommendations', 70, 70, { align: 'center' });
    
    doc.moveDown(3);
    
    // Provide a summary based on overall score
    let summaryText = '';
    let recommendationsText = '';
    let summaryColor = '';
    let recommendationIcon = '';
    
    if (overallScore >= 8) {
      summaryText = 'The candidate demonstrated excellent technical proficiency and communication skills throughout the interview. They showed a strong understanding of core concepts and were able to apply them effectively.';
      recommendationsText = 'Highly recommended for the position. Consider fast-tracking this candidate in the hiring process.';
      summaryColor = colors.success;
      recommendationIcon = '✓✓';
    } else if (overallScore >= 6) {
      summaryText = 'The candidate showed good technical knowledge and communication skills. They were able to answer most questions adequately, though there were some areas where deeper knowledge could be beneficial.';
      recommendationsText = 'Recommended for the position. Consider a follow-up interview to explore specific areas in more depth.';
      summaryColor = colors.accent;
      recommendationIcon = '✓';
    } else if (overallScore >= 4) {
      summaryText = 'The candidate demonstrated basic technical knowledge but struggled with some key concepts. Their communication was adequate but could be improved.';
      recommendationsText = 'May be suitable for a junior position or with additional training. Consider a follow-up technical assessment.';
      summaryColor = colors.warning;
      recommendationIcon = '⚠';
    } else {
      summaryText = 'The candidate struggled with many of the technical questions and had difficulty communicating their thoughts clearly.';
      recommendationsText = 'Not recommended for this position at this time. The candidate may benefit from additional training or experience before reapplying.';
      summaryColor = colors.danger;
      recommendationIcon = '✗';
    }
    
    // Draw summary box
    drawRoundedRect(50, doc.y, doc.page.width - 100, 120, 5, '#F9FAFB');
    
    // Summary header with icon
    doc.fillColor(colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Interview Summary', 70, doc.y + 15);
    
    // Summary content
    doc.fillColor(colors.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text(summaryText, 70, doc.y + 15, { width: doc.page.width - 140 });
    
    doc.moveDown(7);
    
    // Draw recommendations box with color based on score
    let recommendationBoxColor;
    if (overallScore >= 8) recommendationBoxColor = '#F0FFF4'; // Green tint
    else if (overallScore >= 6) recommendationBoxColor = '#F0F9FF'; // Blue tint
    else if (overallScore >= 4) recommendationBoxColor = '#FFFBEB'; // Yellow tint
    else recommendationBoxColor = '#FFF5F5'; // Red tint
    
    drawRoundedRect(50, doc.y, doc.page.width - 100, 120, 5, recommendationBoxColor);
    
    // Recommendation header with icon
    doc.fillColor(summaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(`Recommendations ${recommendationIcon}`, 70, doc.y + 15);
    
    // Recommendation content
    doc.fillColor(colors.secondary)
       .fontSize(11)
       .font('Helvetica')
       .text(recommendationsText, 70, doc.y + 15, { width: doc.page.width - 140 });
    
    doc.moveDown(7);
    
    // Add hiring decision visual indicator
    drawRoundedRect(50, doc.y, doc.page.width - 100, 80, 5, '#F9FAFB');
    
    doc.fillColor(colors.primary)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Hiring Decision Guide', 70, doc.y + 15);
    
    // Draw decision gauge
    const decisionGaugeY = doc.y + 15;
    const decisionGaugeWidth = doc.page.width - 200;
    const decisionGaugeHeight = 30;
    const decisionGaugeRadius = decisionGaugeHeight / 2;
    
    // Draw background with segments
    doc.roundedRect(70, decisionGaugeY, decisionGaugeWidth, decisionGaugeHeight, decisionGaugeRadius).fill(colors.light);
    
    // Draw segments
    const segmentWidth = decisionGaugeWidth / 4;
    
    // Not Recommended segment (0-4)
    // Fix: Use rect() instead of roundedRect() with object parameter
    doc.rect(70, decisionGaugeY, segmentWidth, decisionGaugeHeight)
       .fill(colors.danger);
    
    // Consider for Junior segment (4-6)
    doc.rect(70 + segmentWidth, decisionGaugeY, segmentWidth, decisionGaugeHeight).fill(colors.warning);
    
    // Recommended segment (6-8)
    doc.rect(70 + segmentWidth * 2, decisionGaugeY, segmentWidth, decisionGaugeHeight).fill(colors.accent);
    
    // Highly Recommended segment (8-10)
    // Fix: Use rect() instead of roundedRect() with object parameter
    doc.rect(70 + segmentWidth * 3, decisionGaugeY, segmentWidth, decisionGaugeHeight)
       .fill(colors.success);
    
    // Add marker for this candidate
    const markerPosition = Math.max(0, Math.min(10, overallScore)) / 10 * decisionGaugeWidth;
    
    // Draw triangle marker
    doc.polygon(
      [70 + markerPosition, decisionGaugeY - 10],
      [70 + markerPosition - 7, decisionGaugeY - 20],
      [70 + markerPosition + 7, decisionGaugeY - 20]
    ).fill('black');
    
    // Add labels under the gauge
    doc.fillColor(colors.danger)
       .fontSize(8)
       .font('Helvetica')
       .text('Not Recommended', 70, decisionGaugeY + decisionGaugeHeight + 5, { width: segmentWidth, align: 'center' });
    
    doc.fillColor(colors.warning)
       .text('Consider for Junior', 70 + segmentWidth, decisionGaugeY + decisionGaugeHeight + 5, { width: segmentWidth, align: 'center' });
    
    doc.fillColor(colors.accent)
       .text('Recommended', 70 + segmentWidth * 2, decisionGaugeY + decisionGaugeHeight + 5, { width: segmentWidth, align: 'center' });
    
    doc.fillColor(colors.success)
       .text('Highly Recommended', 70 + segmentWidth * 3, decisionGaugeY + decisionGaugeHeight + 5, { width: segmentWidth, align: 'center' });
    
    doc.moveDown(5);
    
    // Add footer with generation date and InterviewPro branding
    doc.fillColor(colors.muted)
       .fontSize(8)
       .font('Helvetica')
       .text(`Report generated by InterviewPro on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { align: 'center' });
    
    // Add a disclaimer
    doc.moveDown(0.5);
    doc.fillColor(colors.muted)
       .fontSize(7)
       .font('Helvetica-Oblique')
       .text('This report is generated based on AI analysis and should be used as one of multiple factors in the hiring decision process.', 
             { align: 'center', width: doc.page.width - 100, indent: 50 });
    
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

/**
 * Get interview result
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const getInterviewResult = async (req, res, next) => {
  try {
    const { interviewService, responseService, feedbackService } = req.container.cradle;
    const { id } = req.params;
    
    // Get the interview details
    const interview = await interviewService.getInterviewById(id);
    
    // Get all responses for this interview
    const responses = await responseService.getResponsesByInterviewId(id);
    
    // Get or generate comprehensive feedback
    let feedback = interview.aiAnalysis;
    
    // If feedback doesn't exist yet, generate it
    if (!feedback) {
      feedback = await feedbackService.generateInterviewFeedback(id);
    }
    
    // Compile the result
    const result = {
      interview,
      responses,
      feedback,
      overallScore: feedback?.overallScore || 0,
      categoryScores: feedback?.categoryScores || {},
      strengths: feedback?.strengths || [],
      weaknesses: feedback?.weaknesses || [],
      suggestions: feedback?.suggestions || [],
      recommendation: feedback?.recommendation || ''
    };
    
    sendSuccess(res, 200, 'Interview result retrieved successfully', result);
  } catch (error) {
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
  getInterviewResult,
  generatePdfReport
};