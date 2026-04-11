const admin = require('firebase-admin');
const UserProfileService = require('./UserProfileService');
const EmailService = require('./EmailService');
const moment = require('moment');

class ParentReportService {
    constructor() {
        this.db = admin.firestore();
    }

    /**
     * Generate and send a weekly report for a specific user.
     * @param {string} uid User ID
     * @param {string} parentEmail Email to send to
     */
    async generateAndSendReport(uid, parentEmail) {
        try {
            console.log(`[ParentReportService] Generating report for ${uid}...`);
            const profile = await UserProfileService.getProfile(uid);
            if (!profile) throw new Error("User profile not found");

            const sevenDaysAgo = admin.firestore.Timestamp.fromDate(moment().subtract(7, 'days').toDate());

            // 1. Fetch Timeline Events (Last 7 Days)
            const timelineSnap = await this.db.collection('users').doc(uid).collection('timeline')
                .where('date', '>=', sevenDaysAgo)
                .orderBy('date', 'desc')
                .get();

            const events = timelineSnap.docs.map(d => d.data());

            // 2. Aggregate Stats
            const stats = {
                totalTimeFormatted: "0h 0m",
                sessionsCount: 0,
                totalXP: 0
            };

            let totalMinutes = 0;
            events.forEach(e => {
                if (e.xp) stats.totalXP += e.xp;
                if (e.type === 'practice' || e.type === 'milestone') stats.sessionsCount++;
                
                // If we store duration in e.duration (minutes)
                if (e.duration) totalMinutes += e.duration;
            });

            // Fallback: If no duration recorded, estimate from sessions (e.g. 15 mins per session)
            if (totalMinutes === 0 && stats.sessionsCount > 0) {
                totalMinutes = stats.sessionsCount * 15;
            }

            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            stats.totalTimeFormatted = `${h}h ${m}m`;

            // 3. mastery & mathAbility
            const mastery = { recentSkills: [] };
            const mathAbility = { recentTopics: [] };

            events.slice(0, 10).forEach(e => {
                if (e.subject === 'english' || e.type === 'practice') {
                    if (e.title && !mastery.recentSkills.includes(e.title) && mastery.recentSkills.length < 3) {
                        mastery.recentSkills.push(e.title);
                    }
                } else if (e.subject === 'maths' || e.subject === 'math') {
                    if (e.title && !mathAbility.recentTopics.includes(e.title) && mathAbility.recentTopics.length < 3) {
                        mathAbility.recentTopics.push(e.title);
                    }
                }
            });

            // 4. Ace Sir Advice
            // Simple heuristic for now: look at their lowest level skill in progress
            const enProgress = await UserProfileService.getSkillMap(uid, 'english');
            const mathProgress = await UserProfileService.getMathSkillMap(uid);

            let lowestSkill = "General Foundation";
            if (enProgress?.microSkills) {
                const sorted = Object.entries(enProgress.microSkills).sort((a,b) => (a[1].level || 1) - (b[1].level || 1));
                if (sorted[0]) lowestSkill = UserProfileService.getSkillName(sorted[0][0], 'english');
            }

            const aceSir = {
                dreamPrograms: profile.dreamPrograms || [],
                estimatedBest5: Math.round((profile.level || 1) * 4), // Rough estimation: Level * 4 subjects? 
                // Wait, Best 5 is usually 20-35 points. If level 5, 5*5=25 points.
                recommendation: `Focus on mastering ${lowestSkill} next week. Consistent daily practice in this area will significantly boost the overall projected score.`
            };

            const reportData = {
                studentName: profile.nickname || profile.displayName || "Student",
                period: `${moment().subtract(7, 'days').format('MMM D')} - ${moment().format('MMM D, YYYY')}`,
                stats,
                mastery,
                mathAbility,
                aceSir
            };

            // 5. Send Report
            const result = await EmailService.sendWeeklyReport(parentEmail, reportData);
            
            if (result.success) {
                await this.db.collection('users').doc(uid).update({
                    parent_last_report_sent: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            return result;

        } catch (error) {
            console.error(`[ParentReportService] Error generating report for ${uid}:`, error);
            throw error;
        }
    }
}

module.exports = new ParentReportService();
