const nodemailer = require('nodemailer');
const moment = require('moment');

// Initialize Transporter
// NOTE: For Production, use environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp.example.com' with host/port options
    auth: {
        user: process.env.EMAIL_USER || 'aceit.tutor.demo@gmail.com',
        pass: process.env.EMAIL_PASS || 'demo_password_placeholder'
    }
});

/**
 * Generates the HTML content for the weekly report
 * @param {Object} data - Aggregated report data
 * @returns {string} HTML string
 */
const generateEmailHtml = (data) => {
    const { studentName, period, stats, mastery, mathAbility, aceSir } = data;

    // Helper to render skills list
    const renderSkills = (skills, emptyMsg) => {
        if (!skills || skills.length === 0) {
            return `<div style="color: #64748b; font-style: italic; font-size: 13px;">${emptyMsg}</div>`;
        }
        return skills.map(skill => `
            <div style="background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; color: #334155;">
                <span style="color: #10b981; font-weight: bold;">✓ Learned:</span> ${skill}
            </div>
        `).join('');
    };

    // Helper to render dream programs
    const renderDreamPrograms = (programs) => {
        if (!programs || programs.length === 0) return '<div style="color: #94a3b8; font-style: italic;">No dream programs set yet.</div>';

        return programs.slice(0, 3).map((p, i) => {
            const gap = p.mean ? (p.mean - aceSir.estimatedBest5) : 0;
            const statusColor = gap <= 0 ? '#10b981' : gap <= 4 ? '#f59e0b' : '#f43f5e';
            const statusText = gap <= 0 ? 'On Track' : `Gap: ${gap}`;

            return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                <div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 14px;">${p.university} ${p.code}</div>
                    <div style="color: #64748b; font-size: 12px;">${p.name}</div>
                </div>
                <div style="background-color: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                    ${statusText}
                </div>
            </div>`;
        }).join('');
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); margin-top: 20px; margin-bottom: 20px; }
            .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px 24px; text-align: center; }
            .logo { font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; }
            .logo span { color: #f97316; }
            .hero { padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0; }
            .hero h1 { margin: 0 0 8px; font-size: 20px; color: #0f172a; }
            .hero p { margin: 0; color: #64748b; font-size: 14px; }
            .section { padding: 24px; border-bottom: 1px solid #f1f5f9; }
            .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
            .stat-card { background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #cbd5e1; }
            .stat-value { font-size: 24px; font-weight: 800; color: #0f172a; display: block; line-height: 1.2; }
            .stat-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
            .footer { background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8; }
            .ace-advisor { background-color: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin-top: 16px; }
            .ace-advisor-title { color: #c2410c; font-weight: 700; font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">Ace <span>It!</span></div>
                <div style="color: #94a3b8; font-size: 12px; margin-top: 4px; font-weight: 500;">AI PERSONAL TUTOR FOR HKDSE</div>
            </div>

            <!-- Hero -->
            <div class="hero">
                <h1>Weekly Progress Report</h1>
                <p><strong>Student:</strong> ${studentName} &bull; <strong>Period:</strong> ${period}</p>
            </div>

            <!-- Main Stats -->
            <div class="section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value" style="color: #3b82f6;">${stats.totalTimeFormatted}</span>
                        <span class="stat-label">Study Time</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value" style="color: #8b5cf6;">${stats.sessionsCount}</span>
                        <span class="stat-label">Active Sessions</span>
                    </div>
                </div>
            </div>

            <!-- Progress Update -->
            <div class="section">
                <div class="stats-grid">
                    <!-- English -->
                    <div>
                         <div class="section-title" style="font-size: 14px; margin-bottom: 12px;">
                            <span style="color: #f59e0b;">●</span> English Mastery
                         </div>
                         ${renderSkills(mastery.recentSkills, "No new skills mastered this week.")}
                    </div>
                    <!-- Math -->
                    <div>
                         <div class="section-title" style="font-size: 14px; margin-bottom: 12px;">
                            <span style="color: #06b6d4;">●</span> Math Ability
                         </div>
                         ${renderSkills(mathAbility.recentTopics, "No new topics covered this week.")}
                    </div>
                </div>
            </div>

            <!-- Ace Sir Strategic Corner -->
            <div class="section">
                <div class="section-title">
                    <span>🎓</span> Ace Sir's Strategic Corner
                </div>
                <p style="font-size: 14px; color: #475569; margin-bottom: 16px;">
                    Here is a snapshot of ${studentName}'s university planning progress based on current performance.
                </p>
                
                <div class="ace-advisor">
                    <div class="ace-advisor-title">🎯 Dream Goal Tracker</div>
                    ${renderDreamPrograms(aceSir.dreamPrograms)}
                    
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #fed7aa; display: flex; justify-content: space-between; align-items: baseline;">
                        <span style="font-size: 13px; color: #7c2d12; font-weight: 600;">Estimated Best 5:</span>
                        <span style="font-size: 18px; font-weight: 800; color: #ea580c;">${aceSir.estimatedBest5} <span style="font-size: 12px; font-weight: normal; color: #9a3412;">pts</span></span>
                    </div>
                </div>

                <div style="margin-top: 16px; font-size: 13px; color: #475569; background-color: #f8fafc; padding: 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <strong>💡 Strategies for Next Week:</strong> ${aceSir.recommendation}
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>This report was automatically generated by Ace It! AI Tutor.</p>
                <p>&copy; ${new Date().getFullYear()} Ace It! Learning. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Sends the weekly report email
 * @param {string} toEmail - Recipient email
 * @param {Object} reportData - Data to populate the template
 */
const sendWeeklyReport = async (toEmail, reportData) => {
    try {
        const htmlContent = generateEmailHtml(reportData);

        // If no real credentials, just log it (Dev Mode)
        if (!process.env.EMAIL_USER && !process.env.EMAIL_PASS) {
            console.log('=====================================================');
            console.log(`[EmailService] 📧 SKIPPING SEND (No Credentials)`);
            console.log(`[EmailService] To: ${toEmail}`);
            console.log(`[EmailService] Subject: Weekly Progress Report: ${reportData.studentName}`);
            console.log(`[EmailService] HTML Preview (First 500 chars):`);
            console.log(htmlContent.substring(0, 500) + '...');
            console.log('=====================================================');
            return { success: true, mock: true };
        }

        // Real Send
        const info = await transporter.sendMail({
            from: '"Ace It! AI Tutor" <no-reply@aceit.com>',
            to: toEmail,
            subject: `Weekly Progress Report: ${reportData.studentName} (${reportData.period})`,
            html: htmlContent
        });

        console.log(`[EmailService] Message sent: ${info.messageId}`);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWeeklyReport
};
