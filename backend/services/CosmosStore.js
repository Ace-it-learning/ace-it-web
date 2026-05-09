const { getContainer } = require("../db/cosmos");

class CosmosStore {
    async container(id) {
        return getContainer(id, "/pk");
    }

    async getRoadmap(uid, subject = "english") {
        const c = await this.container("roadmap_plans");
        const key = `roadmap_${uid}_${subject}`;
        try {
            const { resource } = await c.item(key, uid).read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async upsertRoadmap(uid, subject = "english", payload = {}) {
        const c = await this.container("roadmap_plans");
        const key = `roadmap_${uid}_${subject}`;
        const doc = {
            id: key,
            pk: uid,
            uid,
            subject,
            payload,
            updatedAt: new Date().toISOString()
        };
        await c.items.upsert(doc);
        return doc;
    }

    async getPromoCode(code) {
        const c = await this.container("promo_codes");
        const id = String(code || "").toUpperCase();
        try {
            const { resource } = await c.item(id, "promo_codes").read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async incrementPromoCodeUsage(code) {
        const c = await this.container("promo_codes");
        const id = String(code || "").toUpperCase();
        const current = (await this.getPromoCode(id)) || { id, pk: "promo_codes", usedCount: 0, isActive: true };
        current.usedCount = Number(current.usedCount || 0) + 1;
        current.updatedAt = new Date().toISOString();
        await c.items.upsert(current);
    }

    async addExamSubmission(submission) {
        const c = await this.container("exam_submissions");
        const uid = submission.uid;
        const id = `exam_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const doc = {
            id,
            pk: uid,
            ...submission,
            timestamp: new Date().toISOString()
        };
        await c.items.upsert(doc);
        return doc;
    }

    async addExamAttempt(uid, payload = {}) {
        const c = await this.container("exam_attempts");
        const id = `attempt_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const doc = {
            id,
            pk: uid,
            uid,
            ...payload,
            timestamp: new Date().toISOString()
        };
        await c.items.upsert(doc);
        return doc;
    }

    async getLatestExamSubmission(uid, examId) {
        const c = await this.container("exam_submissions");
        const result = await c.items.query({
            query: "SELECT TOP 1 * FROM c WHERE c.pk = @uid AND c.examId = @examId ORDER BY c.timestamp DESC",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@examId", value: examId }
            ]
        }).fetchAll();
        return result.resources?.[0] || null;
    }

    async getApprovedIntegratedChallenges(limit = 200) {
        const c = await this.container("integrated_challenges");
        const top = Math.min(Math.max(Number(limit) || 200, 1), 1000);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = "integrated_challenges" AND c.status = "approved"`
        }).fetchAll();
        return result.resources || [];
    }

    async getIntegratedChallenges(limit = 2000) {
        const c = await this.container("integrated_challenges");
        const top = Math.min(Math.max(Number(limit) || 2000, 1), 5000);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = "integrated_challenges"`
        }).fetchAll();
        return result.resources || [];
    }

    async getMicroSkillLanding(topicId) {
        const c = await this.container("micro_skill_landing");
        try {
            const { resource } = await c.item(topicId, "micro_skill_landing").read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async getVoiceUsage(uid) {
        const c = await this.container("voice_usage");
        try {
            const { resource } = await c.item(`voice_${uid}`, uid).read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async incrementVoiceUsage(uid, dateKey) {
        const c = await this.container("voice_usage");
        const today = dateKey || new Date().toISOString().split("T")[0];
        const current = (await this.getVoiceUsage(uid)) || { id: `voice_${uid}`, pk: uid, uid, usage: {} };
        const usage = { ...(current.usage || {}) };
        usage[today] = Number(usage[today] || 0) + 1;
        await c.items.upsert({
            ...current,
            id: `voice_${uid}`,
            pk: uid,
            uid,
            usage,
            updatedAt: new Date().toISOString()
        });
        return usage[today];
    }

    async getPracticeHistoryIds(uid, limit = 2000) {
        const c = await this.container("practice_history");
        const top = Math.min(Math.max(Number(limit) || 2000, 1), 5000);
        const result = await c.items.query({
            query: `SELECT TOP ${top} c.question_id FROM c WHERE c.pk = @uid`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return (result.resources || []).map((r) => r.question_id).filter(Boolean);
    }

    async markPracticeHistory(uid, questionIds = []) {
        const c = await this.container("practice_history");
        const now = new Date().toISOString();
        await Promise.all((questionIds || []).map((qid) =>
            c.items.upsert({
                id: `history_${uid}_${qid}`,
                pk: uid,
                uid,
                question_id: qid,
                completed: true,
                timestamp: now
            })
        ));
    }

    async getTimelineSince(uid, isoDate) {
        const c = await this.container("timeline_events");
        const result = await c.items.query({
            query: "SELECT * FROM c WHERE c.pk = @uid AND c.date >= @date ORDER BY c.date DESC",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@date", value: isoDate }
            ]
        }).fetchAll();
        return result.resources || [];
    }

    async addResult(uid, type, payload = {}) {
        const c = await this.container("results");
        const id = `result_${uid}_${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const doc = {
            id,
            pk: uid,
            uid,
            type,
            ...payload,
            timestamp: new Date().toISOString()
        };
        await c.items.upsert(doc);
        return doc;
    }

    async listWritingExemplars(genre = "all", limit = 200) {
        const c = await this.container("writing_exemplars");
        const top = Math.min(Math.max(Number(limit) || 200, 1), 1000);
        if (genre && genre !== "all") {
            const result = await c.items.query({
                query: `SELECT TOP ${top} * FROM c WHERE c.pk = "writing_exemplars" AND c.genre = @genre ORDER BY c.created_at DESC`,
                parameters: [{ name: "@genre", value: genre }]
            }).fetchAll();
            return result.resources || [];
        }
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = "writing_exemplars" ORDER BY c.created_at DESC`
        }).fetchAll();
        return result.resources || [];
    }

    async getWritingExemplarById(id) {
        const c = await this.container("writing_exemplars");
        try {
            const { resource } = await c.item(id, "writing_exemplars").read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async getRecentVocabulary(uid, limit = 5) {
        const c = await this.container("vocabulary_items");
        const top = Math.min(Math.max(Number(limit) || 5, 1), 50);
        const result = await c.items.query({
            query: `SELECT TOP ${top} c.word, c.text, c.definition, c.createdAt
                    FROM c WHERE c.pk = @uid ORDER BY c.createdAt DESC`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return result.resources || [];
    }

    async getLearningContent(topicId) {
        const c = await this.container("learning_content");
        try {
            const { resource } = await c.item(topicId, "learning_content").read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async getUserProfileDoc(uid) {
        const c = await this.container("users");
        try {
            const { resource } = await c.item(`user_${uid}`, uid).read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async getUserStats(uid) {
        const c = await this.container("user_stats");
        try {
            const { resource } = await c.item(`stats_${uid}`, uid).read();
            return resource?.stats || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async upsertUserStats(uid, patch = {}, merge = true) {
        const c = await this.container("user_stats");
        const current = merge ? (await this.getUserStats(uid)) || {} : {};
        const stats = { ...current, ...(patch || {}) };
        await c.items.upsert({
            id: `stats_${uid}`,
            pk: uid,
            uid,
            stats,
            updatedAt: new Date().toISOString()
        });
        return stats;
    }

    async listQuestResults(uid, limit = 3) {
        const c = await this.container("quest_results");
        const top = Math.min(Math.max(Number(limit) || 3, 1), 50);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = @uid ORDER BY c.completedAt DESC`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return result.resources || [];
    }

    async listInventory(uid, limit = 100) {
        const c = await this.container("inventory_items");
        const top = Math.min(Math.max(Number(limit) || 100, 1), 500);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = @uid ORDER BY c.acquiredAt DESC`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return result.resources || [];
    }

    async addInventoryItem(uid, item = {}) {
        const c = await this.container("inventory_items");
        const id = item.inventoryId || `inv_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const doc = {
            id,
            pk: uid,
            uid,
            ...item,
            acquiredAt: item.acquiredAt || new Date().toISOString()
        };
        await c.items.upsert(doc);
        return doc;
    }

    async listTimeline(uid, limit = 2000) {
        const c = await this.container("timeline_events");
        const top = Math.min(Math.max(Number(limit) || 2000, 1), 5000);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = @uid ORDER BY c.date DESC`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return result.resources || [];
    }

    async getProgress(uid, subject) {
        const c = await this.container("user_progress");
        const id = `progress_${uid}_${subject}`;
        try {
            const { resource } = await c.item(id, uid).read();
            return resource?.payload || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async upsertProgress(uid, subject, patch = {}, merge = true) {
        const c = await this.container("user_progress");
        const id = `progress_${uid}_${subject}`;
        let payload = patch || {};
        if (merge) {
            const current = await this.getProgress(uid, subject);
            payload = { ...(current || {}), ...(patch || {}) };
        }
        await c.items.upsert({
            id,
            pk: uid,
            uid,
            subject,
            payload,
            updatedAt: new Date().toISOString()
        });
        return payload;
    }

    async addProgressSnapshot(uid, subject, snapshot = {}) {
        const c = await this.container("progress_snapshots");
        const id = `snap_${uid}_${subject}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await c.items.upsert({
            id,
            pk: uid,
            uid,
            subject,
            ...snapshot,
            timestamp: snapshot.timestamp || new Date().toISOString()
        });
    }

    async listProgressSnapshots(uid, subject, limit = 5) {
        const c = await this.container("progress_snapshots");
        const top = Math.min(Math.max(Number(limit) || 5, 1), 200);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = @uid AND c.subject = @subject ORDER BY c.timestamp DESC`,
            parameters: [
                { name: "@uid", value: uid },
                { name: "@subject", value: subject }
            ]
        }).fetchAll();
        return result.resources || [];
    }

    async clearProgress(uid, subject) {
        const c = await this.container("user_progress");
        const id = `progress_${uid}_${subject}`;
        try {
            await c.item(id, uid).delete();
        } catch (error) {
            if (error.code !== 404) throw error;
        }
    }

    async clearProgressSnapshots(uid, subject) {
        const c = await this.container("progress_snapshots");
        const rows = await c.items.query({
            query: "SELECT c.id, c.pk FROM c WHERE c.pk = @uid AND c.subject = @subject",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@subject", value: subject }
            ]
        }).fetchAll();
        await Promise.all((rows.resources || []).map((r) => c.item(r.id, r.pk).delete().catch(() => null)));
    }

    async saveChatMessage(uid, agentId, message = {}) {
        const c = await this.container("chat_messages");
        const id = `chat_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const role = (message.role === "assistant" || message.role === "model") ? "model" : "user";
        await c.items.upsert({
            id,
            pk: uid,
            uid,
            agentId,
            role,
            content: message.content || "",
            metadata: { ...message, content: undefined },
            createdAt: new Date().toISOString()
        });
        return id;
    }

    async getChatHistory(uid, agentId) {
        const c = await this.container("chat_messages");
        const result = await c.items.query({
            query: "SELECT c.role, c.content, c.createdAt FROM c WHERE c.pk = @uid AND c.agentId = @agentId ORDER BY c.createdAt ASC",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@agentId", value: agentId }
            ]
        }).fetchAll();
        return result.resources || [];
    }

    async clearChatHistory(uid, agentId) {
        const c = await this.container("chat_messages");
        const rows = await c.items.query({
            query: "SELECT c.id, c.pk FROM c WHERE c.pk = @uid AND c.agentId = @agentId",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@agentId", value: agentId }
            ]
        }).fetchAll();
        await Promise.all((rows.resources || []).map((r) => c.item(r.id, r.pk).delete().catch(() => null)));
        return rows.resources?.length || 0;
    }

    async addTimelineEvent(uid, event = {}) {
        const c = await this.container("timeline_events");
        const id = `timeline_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await c.items.upsert({
            id,
            pk: uid,
            uid,
            ...event,
            date: event.date || new Date().toISOString()
        });
        return id;
    }

    async saveQuestResult(uid, payload = {}) {
        const c = await this.container("quest_results");
        const resultId = payload.resultId || `quest_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        await c.items.upsert({
            id: resultId,
            pk: uid,
            uid,
            ...payload,
            resultId,
            completedAt: payload.completedAt || new Date().toISOString()
        });
        return resultId;
    }

    async addTutorCompletionEvent(uid, payload = {}) {
        const c = await this.container("tutor_completion_events");
        const completedAt = payload.completedAt || new Date().toISOString();
        const sourceId = payload.sourceId || payload.resultId || payload.mockId || `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const type = payload.type || "quest_completed";
        const eventId = payload.eventId || `tutor_event_${uid}_${type}_${sourceId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
        const doc = {
            id: eventId,
            pk: uid,
            uid,
            type,
            status: payload.status || "pending",
            completedAt,
            summarizedAt: payload.summarizedAt || null,
            createdAt: payload.createdAt || new Date().toISOString(),
            payload: payload.payload || {}
        };
        await c.items.upsert(doc);
        return doc;
    }

    async listPendingTutorCompletionEvents(uid, limit = 10) {
        const c = await this.container("tutor_completion_events");
        const top = Math.min(Math.max(Number(limit) || 10, 1), 25);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = @uid AND c.status = "pending" ORDER BY c.completedAt ASC`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return result.resources || [];
    }

    async markTutorCompletionEventsSummarized(uid, eventIds = []) {
        const c = await this.container("tutor_completion_events");
        const ids = Array.isArray(eventIds) ? eventIds.filter(Boolean) : [];
        const summarizedAt = new Date().toISOString();
        const updated = [];
        for (const eventId of ids) {
            try {
                const { resource } = await c.item(eventId, uid).read();
                if (!resource) continue;
                const next = {
                    ...resource,
                    status: "summarized",
                    summarizedAt,
                    updatedAt: summarizedAt
                };
                await c.items.upsert(next);
                updated.push(eventId);
            } catch (error) {
                if (error.code !== 404) throw error;
            }
        }
        return { updated, summarizedAt };
    }

    async getQuestResult(uid, resultId) {
        const c = await this.container("quest_results");
        try {
            const { resource } = await c.item(resultId, uid).read();
            return resource || null;
        } catch (error) {
            if (error.code === 404) return null;
            throw error;
        }
    }

    async listNotebook(uid, limit = 200) {
        const c = await this.container("notebook_items");
        const top = Math.min(Math.max(Number(limit) || 200, 1), 2000);
        const result = await c.items.query({
            query: `SELECT TOP ${top} * FROM c WHERE c.pk = @uid ORDER BY c.created_at DESC`,
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return result.resources || [];
    }

    async addNotebookItem(uid, payload = {}) {
        const c = await this.container("notebook_items");
        const id = payload.id || `notebook_${uid}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const now = new Date().toISOString();
        await c.items.upsert({
            id,
            pk: uid,
            uid,
            ...payload,
            created_at: payload.created_at || now,
            timestamp: payload.timestamp || now
        });
        return id;
    }

    async updateUserProfile(uid, patch = {}) {
        const c = await this.container("users");
        const existing = (await this.getUserProfileDoc(uid)) || { id: `user_${uid}`, pk: uid, uid, profile: {} };
        const profile = { ...(existing.profile || {}), ...(patch || {}) };
        await c.items.upsert({
            ...existing,
            id: `user_${uid}`,
            pk: uid,
            uid,
            profile,
            updatedAt: new Date().toISOString()
        });
        return profile;
    }

    async purgeByPk(containerName, uid) {
        const c = await this.container(containerName);
        const rows = await c.items.query({
            query: "SELECT c.id, c.pk FROM c WHERE c.pk = @uid",
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        await Promise.all((rows.resources || []).map((r) => c.item(r.id, r.pk).delete().catch(() => null)));
        return rows.resources?.length || 0;
    }
}

module.exports = new CosmosStore();
