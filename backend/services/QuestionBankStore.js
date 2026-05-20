const { getContainer } = require("../db/cosmos");

class QuestionBankStore {
  async container() {
    return getContainer("question_bank", "/pk");
  }

  async getById(id) {
    const c = await this.container();
    try {
      const { resource } = await c.item(id, "question_bank").read();
      return resource || null;
    } catch (error) {
      if (error.code === 404) {
        // Backward-compatible lookup for legacy docs with non-standard partition keys.
        const { resources } = await c.items.query({
          query: "SELECT TOP 1 * FROM c WHERE c.id = @id",
          parameters: [{ name: "@id", value: id }]
        }).fetchAll();
        return resources?.[0] || null;
      }
      throw error;
    }
  }

  async upsertById(id, patch, { merge = true } = {}) {
    const c = await this.container();
    let payload = { ...(patch || {}) };
    if (merge) {
      const existing = await this.getById(id);
      if (existing) payload = { ...existing, ...payload };
    }
    payload.id = id;
    payload.pk = "question_bank";
    if (!payload.created_at) payload.created_at = new Date().toISOString();
    payload.updated_at = new Date().toISOString();
    const { resource } = await c.items.upsert(payload);
    return resource;
  }

  async listListeningApproved(limit = 100) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP ${limit} c.id, c.title, c.topic, c.level, c.paper, c.subject, c.created_at, c.audio_segments
              FROM c
              WHERE c.pk = "question_bank" AND c.type = "listening_mission" AND c.is_approved = true`
    }).fetchAll();
    return resources || [];
  }

  async queryApprovedByTopicAndLevel(topic, level, limit = 50) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP ${limit} * FROM c
              WHERE c.pk = "question_bank" AND c.topic = @topic AND c.level = @level AND c.is_approved = true`,
      parameters: [
        { name: "@topic", value: topic },
        { name: "@level", value: level }
      ]
    }).fetchAll();
    return resources || [];
  }

  async queryByTopic(topic, limit = 20) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP ${limit} * FROM c
              WHERE c.pk = "question_bank" AND c.topic = @topic`,
      parameters: [{ name: "@topic", value: topic }]
    }).fetchAll();
    return resources || [];
  }

  /**
   * Approved rows matching any `topic` token (writing factory / genre slugs).
   * Mirrors legacy Firestore: question_bank where topic in (…) and is_approved.
   */
  async queryApprovedWritingByTopics(topicTerms, limit = 200) {
    const terms = (topicTerms || []).filter(Boolean).slice(0, 10);
    if (!terms.length) return [];
    const c = await this.container();
    const orParts = terms.map((_, i) => `c.topic = @t${i}`);
    const parameters = terms.map((t, i) => ({ name: `@t${i}`, value: t }));
    const top = Math.min(Math.max(Number(limit) || 200, 1), 500);
    const { resources } = await c.items.query({
      query: `SELECT TOP ${top} * FROM c
              WHERE c.pk = "question_bank" AND c.is_approved = true
              AND (${orParts.join(" OR ")})`,
      parameters
    }).fetchAll();
    return resources || [];
  }

  /** Personalized dashboard — strict meta match */
  async queryPersonalizedByMetaTopic(subject, metaTopic, syllabusLayer) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP 1 * FROM c
              WHERE c.pk = "question_bank" AND c.is_approved = true
              AND c.subject = @subj
              AND c.meta.topic = @mtopic
              AND c.meta.syllabus_layer = @layer`,
      parameters: [
        { name: "@subj", value: subject },
        { name: "@mtopic", value: metaTopic },
        { name: "@layer", value: syllabusLayer }
      ]
    }).fetchAll();
    return resources?.[0] || null;
  }

  /** Fallback: subject + meta topic without layer */
  async queryPersonalizedByMetaTopicLoose(subject, metaTopic) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP 1 * FROM c
              WHERE c.pk = "question_bank" AND c.is_approved = true
              AND c.subject = @subj
              AND c.meta.topic = @mtopic`,
      parameters: [
        { name: "@subj", value: subject },
        { name: "@mtopic", value: metaTopic }
      ]
    }).fetchAll();
    return resources?.[0] || null;
  }

  /** Legacy rows where `topic` is stored at root (no meta envelope). */
  async queryPersonalizedByRootTopic(subject, rootTopic) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP 1 * FROM c
              WHERE c.pk = "question_bank" AND c.is_approved = true
              AND c.subject = @subj
              AND c.topic = @topic`,
      parameters: [
        { name: "@subj", value: subject },
        { name: "@topic", value: rootTopic }
      ]
    }).fetchAll();
    return resources?.[0] || null;
  }

  async queryByTopicId(topicId, limit = 500) {
    const c = await this.container();
    const top = Math.min(Math.max(Number(limit) || 500, 1), 2000);
    const { resources } = await c.items.query({
      query: `SELECT TOP ${top} * FROM c
              WHERE c.pk = "question_bank" AND c.topic_id = @tid`,
      parameters: [{ name: "@tid", value: topicId }]
    }).fetchAll();
    return resources || [];
  }

  async queryQuestSearch({ subject, topic, topic_id, level, limit = 200 }) {
    const c = await this.container();
    const top = Math.min(Math.max(Number(limit) || 200, 1), 500);

    const hasFilter =
      !!(subject ||
        topic_id ||
        (topic && topic !== "All") ||
        (level != null && level !== "" && level !== "All"));

    if (!hasFilter) {
      const { resources } = await c.items.query({
        query: `SELECT TOP ${top} * FROM c WHERE c.pk = "question_bank"`
      }).fetchAll();
      return resources || [];
    }

    let cond = `c.pk = "question_bank"`;
    const parameters = [];

    if (subject) {
      cond += ` AND c.subject = @subject`;
      parameters.push({ name: "@subject", value: subject });
    }
    if (topic_id) {
      cond += ` AND c.topic_id = @topic_id`;
      parameters.push({ name: "@topic_id", value: topic_id });
    } else if (topic && topic !== "All") {
      cond += ` AND c.topic = @topic`;
      parameters.push({ name: "@topic", value: topic });
    }
    if (level != null && level !== "" && level !== "All") {
      const n = Number(level);
      if (!Number.isNaN(n)) {
        cond += ` AND c.level = @level`;
        parameters.push({ name: "@level", value: n });
      }
    }

    const { resources } = await c.items.query({
      query: `SELECT TOP ${top} * FROM c WHERE ${cond}`,
      parameters
    }).fetchAll();
    return resources || [];
  }

  async queryPending(limit = 50) {
    const c = await this.container();
    const top = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const { resources } = await c.items.query({
      query: `SELECT TOP ${top} * FROM c WHERE c.pk = "question_bank" AND c.is_approved = false`
    }).fetchAll();
    return resources || [];
  }

  async deleteById(id) {
    const c = await this.container();
    try {
      await c.item(String(id), "question_bank").delete();
      return true;
    } catch (error) {
      if (error.code === 404) return false;
      throw error;
    }
  }

  async deleteByIds(ids) {
    if (!ids?.length) return 0;
    const results = await Promise.all(ids.map((id) => this.deleteById(id)));
    return results.filter(Boolean).length;
  }

  /** Maths bank: topic_id + level IN (numeric or string label), approved only */
  async queryMathsByTopicLevels(topicId, levels, limit = 50) {
    if (!levels?.length) return [];
    const c = await this.container();
    const top = Math.min(Math.max(Number(limit) || 50, 1), 500);
    const lvParams = levels.map((lv, i) => ({ name: `@lv${i}`, value: lv }));
    const or = levels.map((_, i) => `c.level = @lv${i}`).join(" OR ");
    const { resources } = await c.items.query({
      query: `SELECT TOP ${top} * FROM c WHERE c.pk = "question_bank"
              AND c.topic_id = @tid AND c.is_approved = true AND (${or})`,
      parameters: [{ name: "@tid", value: topicId }, ...lvParams]
    }).fetchAll();
    return resources || [];
  }

  /** Recent-approved pool for de-duplication context (newest first, in-memory sort). */
  async queryMathsRecentByTopicNumericLevel(topicId, numericLevel, limit = 10) {
    const pool = await this.queryMathsByTopicLevels(topicId, [numericLevel], 120);
    const sorted = pool.sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    return sorted.slice(0, limit);
  }

  /** Speaking drills by criterion (pillar) */
  async querySpeakingDrillsByCriterion(criterion, limit = 100) {
    const c = await this.container();
    const { resources } = await c.items.query({
      query: `SELECT TOP ${limit} * FROM c
              WHERE c.pk = "question_bank" AND c.type = "speaking_drill" AND c.criterion = @criterion`,
      parameters: [{ name: "@criterion", value: criterion }]
    }).fetchAll();
    return resources || [];
  }
}

module.exports = new QuestionBankStore();
