const { EmailClient } = require('@azure/communication-email');
const moment = require('moment');

// Initialize Azure Communication Services Email Client
const acsClient = process.env.AZURE_COMMUNICATION_CONNECTION_STRING
    ? new EmailClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING)
    : null;

const SENDER_ADDRESS = process.env.AZURE_SENDER_EMAIL || 'DoNotReply@ace-it.azurecomm.net';

/**
 * Optional local/dev path: send through any SMTP relay (e.g. Gmail app password) when ACS is not configured.
 * Set SMTP_HOST, SMTP_FROM (or SMTP_USER), and usually SMTP_USER + SMTP_PASS.
 */
async function trySendWeeklyReportViaSmtp(validRecipients, subject, htmlContent) {
    const host = process.env.SMTP_HOST;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!host || !from) return null;

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
            : undefined
    });

    const results = [];
    for (const toEmail of validRecipients) {
        const info = await transporter.sendMail({
            from,
            to: toEmail,
            subject,
            html: htmlContent
        });
        results.push({ email: toEmail, messageId: info.messageId, status: 'sent' });
    }
    return { success: true, deliveryMode: 'smtp', results };
}

/**
 * Generates the HTML content for the weekly report
 * @param {Object} data - Aggregated report data
 * @returns {string} HTML string
 */
const generateEmailHtml = (data) => {
    const {
        studentName, period, stats, mastery, mathAbility, aceSir,
        weeklyQuest, streakDays, level, xp, recentQuests, recentMock,
        subjectBreakdown, topMistakes, recommendedNextSteps
    } = data;

    // Helper: render level bar
    const renderLevelBar = (level) => {
        const pct = Math.min((level / 5) * 100, 100);
        const color = level >= 4 ? '#10b981' : level >= 3 ? '#f59e0b' : '#f43f5e';
        return `
            <div style="background-color: #e2e8f0; border-radius: 4px; height: 8px; overflow: hidden; margin-top: 4px;">
                <div style="width: ${pct}%; background-color: ${color}; height: 100%; border-radius: 4px;"></div>
            </div>
        `;
    };

    // Helper: render skills list
    const renderSkills = (skills, emptyMsg) => {
        if (!skills || skills.length === 0) {
            return `<div style="color: #64748b; font-style: italic; font-size: 13px;">${emptyMsg}</div>`;
        }
        return skills.map(skill => `
            <div style="background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin-bottom: 6px; font-size: 13px; color: #334155;">
                <span style="color: #10b981; font-weight: bold;">✓</span> ${typeof skill === 'string' ? skill : skill.name}
            </div>
        `).join('');
    };

    // Helper: render dream programs
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

    // Helper: render weekly quest badge
    const renderWeeklyQuest = () => {
        if (weeklyQuest?.completed) {
            return `<div style="display: inline-flex; align-items: center; gap: 6px; background-color: #10b98120; color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                <span>✓</span> Weekly Challenge Completed
            </div>`;
        }
        return `<div style="display: inline-flex; align-items: center; gap: 6px; background-color: #f1f5f9; color: #64748b; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            <span>○</span> Weekly Challenge Not Yet Completed
        </div>`;
    };

    // Helper: render recent quests
    const renderRecentQuests = () => {
        if (!recentQuests || recentQuests.length === 0) {
            return '<div style="color: #94a3b8; font-style: italic; font-size: 13px;">No quests completed this week.</div>';
        }
        return recentQuests.map(q => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9;">
                <div>
                    <div style="font-weight: 600; color: #1e293b; font-size: 13px;">${q.topic}</div>
                    <div style="color: #94a3b8; font-size: 11px; text-transform: uppercase;">${q.type || 'Quest'}</div>
                </div>
                ${q.score ? `<div style="font-weight: 800; color: #3b82f6; font-size: 14px;">${q.score}</div>` : ''}
            </div>
        `).join('');
    };

    // Helper: render subject pillars/strands
    const renderSubjectBreakdown = () => {
        const en = subjectBreakdown?.english;
        const math = subjectBreakdown?.maths;
        let html = '';

        if (en?.pillars?.length) {
            html += `<div style="margin-bottom: 16px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 8px;">English</div>
                ${en.pillars.map(p => `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569;">
                            <span>${p.name}</span>
                            <span style="font-weight: 700;">Lv ${p.level}</span>
                        </div>
                        ${renderLevelBar(p.level)}
                    </div>
                `).join('')}
            </div>`;
        }

        if (math?.strands?.length) {
            html += `<div>
                <div style="font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 8px;">Mathematics</div>
                ${math.strands.map(s => `
                    <div style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #475569;">
                            <span>${s.name}</span>
                            <span style="font-weight: 700;">Lv ${s.level}</span>
                        </div>
                        ${renderLevelBar(s.level)}
                    </div>
                `).join('')}
            </div>`;
        }

        return html || '<div style="color: #94a3b8; font-style: italic; font-size: 13px;">No subject data available yet.</div>';
    };

    // Helper: render recent mock
    const renderRecentMock = () => {
        if (!recentMock) return '';
        return `
            <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 14px; margin-top: 12px;">
                <div style="font-weight: 700; color: #0369a1; font-size: 13px; margin-bottom: 6px;">📝 Recent Mock Exam</div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${recentMock.paper}</div>
                        ${recentMock.level ? `<div style="color: #64748b; font-size: 12px;">Level: ${recentMock.level}</div>` : ''}
                    </div>
                    <div style="text-align: right;">
                        ${recentMock.percentage !== null ? `<div style="font-size: 20px; font-weight: 800; color: #0284c7;">${recentMock.percentage}%</div>` : ''}
                        ${recentMock.score !== null && recentMock.total !== null ? `<div style="font-size: 12px; color: #64748b;">${recentMock.score}/${recentMock.total}</div>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    // Helper: render top mistakes
    const renderMistakes = () => {
        if (!topMistakes || topMistakes.length === 0) {
            return '<div style="color: #94a3b8; font-style: italic; font-size: 13px;">No mistakes recorded this week. Great job!</div>';
        }
        return topMistakes.map(m => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #f43f5e; font-size: 12px;">●</span>
                <span style="font-size: 13px; color: #334155;">${m.term}</span>
                <span style="font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-left: auto;">${m.subject}</span>
            </div>
        `).join('');
    };

    // Helper: render recommended next steps
    const renderNextSteps = () => {
        if (!recommendedNextSteps || recommendedNextSteps.length === 0) {
            return '<div style="color: #94a3b8; font-style: italic; font-size: 13px;">Keep up the good work!</div>';
        }
        return recommendedNextSteps.map(step => `
            <div style="display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #3b82f6; font-size: 14px;">→</span>
                <span style="font-size: 13px; color: #334155;">${step}</span>
            </div>
        `).join('');
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
                    <div class="stat-card">
                        <span class="stat-value" style="color: #f59e0b;">Lv ${level}</span>
                        <span class="stat-label">Current Level</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value" style="color: #10b981;">${xp.toLocaleString()}</span>
                        <span class="stat-label">Total XP</span>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 12px;">
                    ${renderWeeklyQuest()}
                    ${streakDays > 0 ? `<div style="display: inline-flex; align-items: center; gap: 4px; margin-left: 8px; background-color: #fef3c7; color: #d97706; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                        🔥 ${streakDays} Day Streak
                    </div>` : ''}
                </div>
            </div>

            <!-- Recent Quests -->
            <div class="section">
                <div class="section-title">
                    <span>⚔️</span> Recent Quests
                </div>
                ${renderRecentQuests()}
            </div>

            <!-- Subject Breakdown -->
            <div class="section">
                <div class="section-title">
                    <span>📊</span> Subject Breakdown
                </div>
                ${renderSubjectBreakdown()}
                ${renderRecentMock()}
            </div>

            <!-- Progress Update (Legacy compatibility) -->
            <div class="section">
                <div class="stats-grid">
                    <div>
                         <div class="section-title" style="font-size: 14px; margin-bottom: 12px;">
                            <span style="color: #f59e0b;">●</span> English Focus Areas
                         </div>
                         ${renderSkills(mastery.recentSkills, "No new skills mastered this week.")}
                    </div>
                    <div>
                         <div class="section-title" style="font-size: 14px; margin-bottom: 12px;">
                            <span style="color: #06b6d4;">●</span> Math Focus Areas
                         </div>
                         ${renderSkills(mathAbility.recentTopics, "No new topics covered this week.")}
                    </div>
                </div>
            </div>

            <!-- Top Mistakes -->
            <div class="section">
                <div class="section-title">
                    <span>📝</span> Top Mistakes to Review
                </div>
                ${renderMistakes()}
            </div>

            <!-- Recommended Next Steps -->
            <div class="section">
                <div class="section-title">
                    <span>🎯</span> Recommended Next Steps
                </div>
                ${renderNextSteps()}
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
 * Sends the weekly report email to one or more recipients
 * @param {string[]} recipients - Array of recipient email addresses
 * @param {Object} reportData - Data to populate the template
 */
const sendWeeklyReport = async (recipients, reportData) => {
    try {
        const htmlContent = generateEmailHtml(reportData);

        // Validate recipients
        const toList = Array.isArray(recipients) ? recipients : [recipients];
        const validRecipients = toList.filter(r => r && typeof r === 'string' && r.includes('@'));
        if (validRecipients.length === 0) {
            throw new Error('No valid recipient email addresses provided');
        }

        const subject = `Weekly Progress Report: ${reportData.studentName} (${reportData.period})`;

        if (acsClient) {
            const results = [];
            for (const toEmail of validRecipients) {
                // ACS Email REST expects `content` with subject + html|plainText (not top-level htmlBody).
                const poller = await acsClient.beginSend({
                    senderAddress: SENDER_ADDRESS,
                    content: {
                        subject,
                        html: htmlContent
                    },
                    recipients: {
                        to: [{ address: toEmail }]
                    }
                });
                const result = await poller.pollUntilDone();
                console.log(`[EmailService] Message sent to ${toEmail}: ${result.id}`);
                results.push({ email: toEmail, messageId: result.id, status: 'sent' });
            }
            return { success: true, deliveryMode: 'azure', results };
        }

        const smtpOutcome = await trySendWeeklyReportViaSmtp(validRecipients, subject, htmlContent).catch((err) => {
            console.error('[EmailService] SMTP send failed:', err.message);
            return null;
        });
        if (smtpOutcome) return smtpOutcome;

        // No ACS and no SMTP — do not claim a real inbox delivery
        console.log('=====================================================');
        console.log(`[EmailService] 📧 SIMULATED SEND (no Azure Email client and no SMTP_HOST)`);
        console.log(`[EmailService] Recipients: ${validRecipients.join(', ')}`);
        console.log(`[EmailService] Subject: ${subject}`);
        console.log(`[EmailService] HTML Preview (First 800 chars):`);
        console.log(htmlContent.substring(0, 800) + '...');
        console.log('=====================================================');
        return {
            success: true,
            mock: true,
            deliveryMode: 'simulated',
            recipients: validRecipients,
            message:
                'Email was not sent: backend has no Azure Communication Email connection string and no SMTP_HOST. Add AZURE_COMMUNICATION_CONNECTION_STRING or SMTP settings in backend .env.'
        };

    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWeeklyReport
};
