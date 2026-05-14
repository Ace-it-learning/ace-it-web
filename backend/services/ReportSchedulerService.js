const cron = require('node-cron');
const ParentReportService = require('./ParentReportService');
const UserProfileService = require('./UserProfileService');
const CosmosStore = require('./CosmosStore');

const WEEKLY_REPORT_CRON = '0 9 * * 1';
const WEEKLY_REPORT_TIMEZONE = 'Asia/Hong_Kong';
const PROCESSING_STALE_AFTER_MS = 12 * 60 * 60 * 1000;

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

        console.log(`[ReportScheduler] Starting weekly cron: ${WEEKLY_REPORT_CRON} (${WEEKLY_REPORT_TIMEZONE})`);
        this.task = cron.schedule(WEEKLY_REPORT_CRON, async () => {
            await this.runWeeklyReports({ source: 'scheduled' });
        }, {
            scheduled: true,
            timezone: WEEKLY_REPORT_TIMEZONE
        });
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
    async runWeeklyReports(options = {}) {
        const { dryRun = false, source = 'manual' } = options;
        if (this.isRunning) {
            console.log('[ReportScheduler] Already running, skipping');
            return { skipped: true, reason: 'already_running', status: this.getStatus() };
        }

        this.isRunning = true;
        this.lastRun = new Date().toISOString();
        const weekId = this._getWeekId();
        const period = this._getReportPeriod();
        console.log(`\n[ReportScheduler] ════════════════════════════════════════`);
        console.log(`[ReportScheduler] Weekly Report Batch Starting`);
        console.log(`[ReportScheduler] Week ID: ${weekId}`);
        console.log(`[ReportScheduler] Time: ${this.lastRun}`);
        console.log(`[ReportScheduler] Source: ${source}${dryRun ? ' (dry run)' : ''}`);
        console.log(`[ReportScheduler] ════════════════════════════════════════\n`);

        const stats = {
            weekId,
            period,
            source,
            dryRun,
            startedAt: this.lastRun,
            completedAt: null,
            totalUsers: 0,
            eligible: 0,
            sent: 0,
            dryRunEligible: 0,
            skippedAlreadySent: 0,
            skippedInProgress: 0,
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
                const existingReport = await CosmosStore.getReportLog(uid, weekId);
                if (existingReport?.status === 'sent') {
                    stats.skippedAlreadySent++;
                    console.log(`[ReportScheduler] Skipping ${uid} — already sent for ${weekId}`);
                    continue;
                }
                if (existingReport?.status === 'processing' && !this._isStaleProcessingLog(existingReport)) {
                    stats.skippedInProgress++;
                    console.log(`[ReportScheduler] Skipping ${uid} — report already processing for ${weekId}`);
                    continue;
                }

                stats.eligible++;
                const selfEmail = profile.send_copy_to_self ? (profile.email || null) : null;
                const recipients = selfEmail ? [parentEmail, selfEmail] : [parentEmail];

                if (dryRun) {
                    stats.dryRunEligible++;
                    continue;
                }

                const reservation = await CosmosStore.reserveReportSend(uid, {
                    weekId,
                    recipients,
                    source,
                    periodStart: period.start,
                    periodEnd: period.end,
                    allowProcessingRetry: existingReport?.status === 'processing'
                });
                if (!reservation.reserved) {
                    if (reservation.log?.status === 'sent') {
                        stats.skippedAlreadySent++;
                    } else {
                        stats.skippedInProgress++;
                    }
                    continue;
                }

                try {
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
                            recipients: result.recipients || result.results?.map(r => r.email) || recipients,
                            provider: result.mock ? 'mock' : 'azure_communication_email',
                            source,
                            periodStart: period.start,
                            periodEnd: period.end,
                            reportData: { studentName: profile.nickname || profile.displayName || 'Student' }
                        });
                        console.log(`[ReportScheduler] ✅ Sent to ${uid} (${parentEmail})`);
                    } else {
                        stats.failed++;
                        stats.errors.push({ uid, error: result.error || 'Unknown error' });
                        await CosmosStore.logReportSent(uid, {
                            weekId,
                            status: 'failed',
                            recipients,
                            source,
                            periodStart: period.start,
                            periodEnd: period.end,
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
                        recipients,
                        source,
                        periodStart: period.start,
                        periodEnd: period.end,
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
            stats.completedAt = new Date().toISOString();
            this.lastRunStats = stats;
            console.log(`\n[ReportScheduler] ════════════════════════════════════════`);
            console.log(`[ReportScheduler] Batch Complete`);
            console.log(`[ReportScheduler] Total Users: ${stats.totalUsers}`);
            console.log(`[ReportScheduler] Eligible: ${stats.eligible}`);
            console.log(`[ReportScheduler] Sent: ${stats.sent}`);
            if (dryRun) console.log(`[ReportScheduler] Dry-run eligible: ${stats.dryRunEligible}`);
            console.log(`[ReportScheduler] Skipped (already sent): ${stats.skippedAlreadySent}`);
            console.log(`[ReportScheduler] Skipped (in progress): ${stats.skippedInProgress}`);
            console.log(`[ReportScheduler] Skipped (not enabled): ${stats.skippedNotEnabled}`);
            console.log(`[ReportScheduler] Skipped (no email): ${stats.skippedNoEmail}`);
            console.log(`[ReportScheduler] Failed: ${stats.failed}`);
            console.log(`[ReportScheduler] ════════════════════════════════════════\n`);
        }

        return stats;
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

    _getWeekId(date = new Date()) {
        const hktDate = this._getHongKongDate(date);
        const day = hktDate.getUTCDay() || 7;
        hktDate.setUTCDate(hktDate.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(hktDate.getUTCFullYear(), 0, 1));
        const weekNum = Math.ceil((((hktDate - yearStart) / 86400000) + 1) / 7);
        return `${hktDate.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    }

    _getReportPeriod(date = new Date()) {
        const endDate = this._getHongKongDate(date);
        const startDate = new Date(endDate);
        startDate.setUTCDate(endDate.getUTCDate() - 6);
        return {
            start: startDate.toISOString().slice(0, 10),
            end: endDate.toISOString().slice(0, 10)
        };
    }

    _getHongKongDate(date) {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: WEEKLY_REPORT_TIMEZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});
        return new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
    }

    _isStaleProcessingLog(log) {
        const updatedAt = log.updatedAt || log.sentAt || log.startedAt;
        if (!updatedAt) return true;
        return Date.now() - new Date(updatedAt).getTime() > PROCESSING_STALE_AFTER_MS;
    }

    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getStatus() {
        return {
            enabled: !!this.task,
            isRunning: this.isRunning,
            lastRun: this.lastRun,
            lastRunStats: this.lastRunStats,
            schedule: WEEKLY_REPORT_CRON,
            timezone: WEEKLY_REPORT_TIMEZONE,
            nextRun: this.task ? 'Every Monday 9:00 AM HKT' : 'Not scheduled'
        };
    }
}

module.exports = new ReportSchedulerService();
