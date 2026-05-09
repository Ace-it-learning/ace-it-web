const express = require("express");
const { getContainer } = require("../db/cosmos");
const { isAzureStorage } = require("../config/runtime");
const { createUploadSasUrl } = require("../storage/blobStorage");
const { requireResolvedUid } = require("../middleware/requireResolvedUid");

const router = express.Router();

async function getDeviceTrialsContainer() {
    return getContainer("device_trials", "/pk");
}

async function getNotebookContainer() {
    return getContainer("notebook_items", "/pk");
}

async function getMockSubmissionsContainer() {
    return getContainer("mock_submissions", "/pk");
}

async function getMockExamsContainer() {
    return getContainer("mock_exams_cache", "/pk");
}

async function getMockExamQuestionsContainer() {
    return getContainer("mock_exam_questions_cache", "/pk");
}

router.get("/data/device-trials/:visitorId", async (req, res) => {
    const { visitorId } = req.params;
    if (!visitorId) return res.status(400).json({ error: "Missing visitorId" });

    try {
        const container = await getDeviceTrialsContainer();
        try {
            const { resource } = await container.item(`trial_${visitorId}`, visitorId).read();
            if (!resource) return res.json({ count: 0, uids: [] });
            return res.json({
                count: resource.count || 0,
                uids: resource.uids || [],
                last_signup: resource.last_signup || null
            });
        } catch (e) {
            if (e.code === 404) return res.json({ count: 0, uids: [] });
            throw e;
        }
    } catch (error) {
        console.error("[dataRoutes] device-trials GET failed:", error);
        return res.status(500).json({ error: "Failed to get device trial" });
    }
});

router.post("/data/device-trials/:visitorId/increment", async (req, res) => {
    const { visitorId } = req.params;
    const { uid } = req.body || {};
    if (!visitorId || !uid) return res.status(400).json({ error: "Missing visitorId or uid" });

    try {
        const container = await getDeviceTrialsContainer();
        let current = { count: 0, uids: [] };
        try {
            const read = await container.item(`trial_${visitorId}`, visitorId).read();
            if (read.resource) current = read.resource;
        } catch (e) {
            if (e.code !== 404) throw e;
        }
        const uids = Array.from(new Set([...(current.uids || []), uid]));
        await container.items.upsert({
            id: `trial_${visitorId}`,
            pk: visitorId,
            visitor_id: visitorId,
            count: Number(current.count || 0) + 1,
            uids,
            last_signup: new Date().toISOString()
        });
        return res.json({ success: true });
    } catch (error) {
        console.error("[dataRoutes] device-trials increment failed:", error);
        return res.status(500).json({ error: "Failed to increment trial" });
    }
});

router.get("/data/notebook/:uid", requireResolvedUid, async (req, res) => {
    const { uid } = req.params;
    try {
        const container = await getNotebookContainer();
        const result = await container.items.query({
            query: "SELECT c.item_id, c.payload, c.created_at FROM c WHERE c.pk = @uid ORDER BY c.created_at DESC",
            parameters: [{ name: "@uid", value: uid }]
        }).fetchAll();
        return res.json((result.resources || []).map((r) => ({ id: r.item_id, ...(r.payload || {}), timestamp: r.created_at })));
    } catch (error) {
        console.error("[dataRoutes] notebook GET failed:", error);
        return res.status(500).json({ error: "Failed to fetch notebook" });
    }
});

router.post("/data/notebook/:uid", requireResolvedUid, async (req, res) => {
    const { uid } = req.params;
    const item = req.body || {};
    const itemId = item.id || `n_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    try {
        const container = await getNotebookContainer();
        await container.items.upsert({
            id: `notebook_${uid}_${itemId}`,
            pk: uid,
            uid,
            item_id: itemId,
            payload: { ...item, reviewStatus: item.reviewStatus || "new" },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        return res.json({ id: itemId });
    } catch (error) {
        console.error("[dataRoutes] notebook POST failed:", error);
        return res.status(500).json({ error: "Failed to save notebook item" });
    }
});

router.delete("/data/notebook/:uid/:itemId", requireResolvedUid, async (req, res) => {
    const { uid, itemId } = req.params;
    try {
        const container = await getNotebookContainer();
        await container.item(`notebook_${uid}_${itemId}`, uid).delete();
        return res.json({ success: true });
    } catch (error) {
        console.error("[dataRoutes] notebook DELETE failed:", error);
        return res.status(500).json({ error: "Failed to delete notebook item" });
    }
});

router.patch("/data/notebook/:uid/:itemId", requireResolvedUid, async (req, res) => {
    const { uid, itemId } = req.params;
    const patch = req.body || {};
    try {
        const container = await getNotebookContainer();
        let current = {};
        try {
            const read = await container.item(`notebook_${uid}_${itemId}`, uid).read();
            if (read.resource) current = read.resource;
        } catch (e) {
            if (e.code !== 404) throw e;
        }
        await container.items.upsert({
            ...current,
            id: `notebook_${uid}_${itemId}`,
            pk: uid,
            uid,
            item_id: itemId,
            payload: { ...(current.payload || {}), ...(patch || {}) },
            updated_at: new Date().toISOString(),
            created_at: current.created_at || new Date().toISOString()
        });
        return res.json({ success: true });
    } catch (error) {
        console.error("[dataRoutes] notebook PATCH failed:", error);
        return res.status(500).json({ error: "Failed to update notebook item" });
    }
});

router.get("/data/exam-submission/:examId", requireResolvedUid, async (req, res) => {
    const { examId } = req.params;
    const uid = req.query.uid;
    if (!uid || !examId) return res.status(400).json({ error: "Missing uid or examId" });
    try {
        const container = await getMockSubmissionsContainer();
        const result = await container.items.query({
            query: "SELECT TOP 1 c.payload FROM c WHERE c.pk = @uid AND c.exam_id = @examId ORDER BY c.created_at DESC",
            parameters: [
                { name: "@uid", value: uid },
                { name: "@examId", value: examId }
            ]
        }).fetchAll();
        return res.json(result.resources?.[0]?.payload || null);
    } catch (error) {
        console.error("[dataRoutes] exam-submission GET failed:", error);
        return res.status(500).json({ error: "Failed to fetch exam submission" });
    }
});

router.get("/data/review/:examId", requireResolvedUid, async (req, res) => {
    const { examId } = req.params;
    if (!examId) return res.status(400).json({ error: "Missing examId" });
    try {
        const exams = await getMockExamsContainer();
        const questionsContainer = await getMockExamQuestionsContainer();
        const examResult = await exams.items.query({
            query: "SELECT TOP 1 c.payload FROM c WHERE c.exam_id = @examId",
            parameters: [{ name: "@examId", value: examId }]
        }).fetchAll();
        const questionsResult = await questionsContainer.items.query({
            query: "SELECT c.payload FROM c WHERE c.exam_id = @examId",
            parameters: [{ name: "@examId", value: examId }]
        }).fetchAll();
        return res.json({
            examData: examResult.resources?.[0]?.payload || null,
            questions: (questionsResult.resources || []).map((q) => q.payload).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        });
    } catch (error) {
        console.error("[dataRoutes] review GET failed:", error);
        return res.status(500).json({ error: "Failed to fetch review data" });
    }
});

router.post("/data/uploads/sas", requireResolvedUid, async (req, res) => {
    const { folder = "uploads", filename, contentType = "application/octet-stream" } = req.body || {};
    if (!filename) return res.status(400).json({ error: "Missing filename" });

    try {
        if (!isAzureStorage()) {
            return res.status(400).json({ error: "Azure storage is not enabled" });
        }
        const containerName = process.env.AZURE_BLOB_CONTAINER || "aceit-assets";
        const blobName = `${folder}/${Date.now()}_${filename}`;
        const sas = await createUploadSasUrl({ containerName, blobName, contentType });
        return res.json({ ...sas, blobName, containerName });
    } catch (error) {
        console.error("[dataRoutes] uploads/sas failed:", error);
        return res.status(500).json({ error: "Failed to create upload URL" });
    }
});

module.exports = router;
