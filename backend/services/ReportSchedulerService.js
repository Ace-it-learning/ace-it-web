const cron = require('node-cron');
const ParentReportService = require('./ParentReportService');
const UserProfileService = require('./UserProfileService');
const CosmosStore = require('./CosmosStore');

/**
 * ReportSchedulerService
 * Manages the automated weekly sending of parent progress reports.
 * Runs every Monday at 9:00 AM HKT (Asia/Hong_Kong timezone).
 *
 * Deduplication: Uses report_logs container keyed by uid + weekId.
 * Only sends once per user per week.
 */
class ReportSchedulerService {
    constructor() {
        this.task = null;
        this.isRunning = false;
        this.lastRun = null;
        this.lastRunStats = null;
    }

    /**
     * Start the weekly cron job.
     * Schedule: "0 9 * * 1" = At 09:00 on Monday
     */
    start() {
        if (this.task) {
            console.log('[ReportScheduler] Already running');
            return;
        }

        console.log('[ReportScheduler] Starting weekly cron: Every Monday at 9:00 AM HKT');
        this.task = cron.schedule('0 9 * * 1', async () => {
            await this.runWeeklyReports();
        }, {
            scheduled: true,
            timezone: 'Asia/Hong_Kong'
        });

        // Also run immediately on startup in dev for testing (comment out in prod)
        if (process.env.NODE_ENV !== 'production') {
            console.log('[ReportScheduler] Dev mode: scheduling immediate test run in 5s...');
            setTimeout(() => this.runWeeklyReports(), 5000);
        }
    }

    /**
     * Stop the cron job.
     */
    stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
            console.log('[ReportScheduler] Stopped');
        }
    }

    /**
     * Main batch runner: fetches all premium users with parent reports enabled,
     * filters out those already sent this week, and sends reports.
     */
    async runWeeklyReports() {
        if (this.isRunning) {
            console.log('[ReportScheduler] Already running, skipping');
            return;
        }

        this.isRunning = true;
        this.lastRun = new Date().toISOString();
        const weekId = this._getWeekId();
        console.log(`\n[ReportScheduler] ════════════════════════════════════════`);
        console.log(`[ReportScheduler] Weekly Report Batch Starting`);
        console.log(`[ReportScheduler] Week ID: ${weekId}`);
        console.log(`[ReportScheduler] Time: ${this.lastRun}`);
        console.log(`[ReportScheduler] ════════════════════════════════════════\n`);

        const stats = {
            totalUsers: 0,
            eligible: 0,
            sent: 0,
            skippedAlreadySent: 0,
            skippedNoEmail: 0,
            skippedNotEnabled: 0,
            failed: 0,
            errors: []
        };

        try {
            // Fetch all users from Cosmos DB users container
            const users = await this._fetchAllPremiumUsers();
            stats.totalUsers = users.length;
            console.log(`[ReportScheduler] Fetched ${users.length} premium users`);

            for (const user of users) {
                const uid = user.uid;
                const profile = user.profile || {};

                // Check if parent reports are enabled
                if (!profile.parent_report_enabled) {
                    stats.skippedNotEnabled++;
                    continue;
                }

                // Check if parent email is set
                const parentEmail = profile.parent_email;
                if (!parentEmail || !parentEmail.includes('@')) {
                    stats.skippedNoEmail++;
                    continue;
                }

                // Deduplication: check if already sent this week
                const alreadySent = await CosmosStore.wasReportSentThisWeek(uid, weekId);
                if (alreadySent) {
                    stats.skippedAlreadySent++;
                    console.log(`[ReportScheduler] Skipping ${uid} — already sent for ${weekId}`);
                    continue;
                }

                stats.eligible++;

                try {
                    const selfEmail = profile.send_copy_to_self ? (profile.email || null) : null;
                    const result = await ParentReportService.generateAndSendReport(
                        uid,
                        parentEmail,
                        selfEmail
                    );

                    if (result.success) {
                        stats.sent++;
                        await CosmosStore.logReportSent(uid, {
                            weekId,
                            status: 'sent',
                            recipients: result.recipients || result.results?.map(r => r.email) || [parentEmail],
                            provider: result.provider || result.results?.[0]?.status || 'unknown',
                            reportData: { studentName: profile.nickname || profile.displayName || 'Student' }
                        });
                        console.log(`[ReportScheduler] ✅ Sent to ${uid} (${parentEmail})`);
                    } else {
                        stats.failed++;
                        stats.errors.push({ uid, error: result.error || 'Unknown error' });
                        await CosmosStore.logReportSent(uid, {
                            weekId,
                            status: 'failed',
                            recipients: [parentEmail],
                            error: result.error || 'Unknown error'
                        });
                        console.log(`[ReportScheduler] ❌ Failed for ${uid}: ${result.error}`);
                    }
                } catch (err) {
                    stats.failed++;
                    stats.errors.push({ uid, error: err.message });
                    await CosmosStore.logReportSent(uid, {
                        weekId,
                        status: 'failed',
                        recipients: [parentEmail],
                        error: err.message
                    });
                    console.error(`[ReportScheduler] ❌ Exception for ${uid}:`, err.message);
                }

                // Small delay between sends to avoid rate limiting
                await this._delay(500);
            }
        } catch (err) {
            console.error('[ReportScheduler] Batch error:', err);
            stats.errors.push({ uid: 'BATCH', error: err.message });
        } finally {
            this.isRunning = false;
            this.lastRunStats = stats;
            console.log(`\n[ReportScheduler] ════════════════════════════════════════`);
            console.log(`[ReportScheduler] Batch Complete`);
            console.log(`[ReportScheduler] Total Users: ${stats.totalUsers}`);
            console.log(`[ReportScheduler] Eligible: ${stats.eligible}`);
            console.log(`[ReportScheduler] Sent: ${stats.sent}`);
            console.log(`[ReportScheduler] Skipped (already sent): ${stats.skippedAlreadySent}`);
            console.log(`[ReportScheduler] Skipped (not enabled): ${stats.skippedNotEnabled}`);
            console.log(`[ReportScheduler] Skipped (no email): ${stats.skippedNoEmail}`);
            console.log(`[ReportScheduler] Failed: ${stats.failed}`);
            console.log(`[ReportScheduler] ════════════════════════════════════════\n`);
        }
    }

    /**
     * Fetch all premium-tier users from Cosmos DB.
     * Progress Report is a Premium feature.
     */
    async _fetchAllPremiumUsers() {
        try {
            const c = await CosmosStore.container('users');
            // Query users with premium subscription tier
            const result = await c.items.query({
                query: 'SELECT c.id, c.pk, c.uid, c.profile FROM c WHERE c.profile.subscription_tier = @tier',
                parameters: [{ name: '@tier', value: 'premium' }]
            }).fetchAll();
            return result.resources || [];
        } catch (err) {
            console.error('[ReportScheduler] Failed to fetch users:', err);
            return [];
        }
    }

    _getWeekId() {
        const now = new Date();
        const year = now.getFullYear();
        const start = new Date(year, 0, 1);
        const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
        const weekNum = Math.ceil((days + start.getDay() + 1) / 7);
        return `${year}-W${String(weekNum).padStart(2, '0')}`;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            lastRunStats: this.lastRunStats,
            nextRun: this.task ? 'Every Monday 9:00 AM HKT' : 'Not scheduled'
        };
    }
}

module.exports = new ReportSchedulerService();
