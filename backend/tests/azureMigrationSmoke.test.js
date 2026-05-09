const assert = require("assert");

const runtime = require("../config/runtime");
const { createRepositories } = require("../repositories");

function run() {
    assert.ok(typeof runtime.DATA_PROVIDER === "string");
    assert.ok(typeof runtime.STORAGE_PROVIDER === "string");

    const repos = createRepositories();
    assert.ok(repos.userRepo, "userRepo should be defined");
    assert.ok(repos.chatRepo, "chatRepo should be defined");
    assert.ok(repos.usageRepo, "usageRepo should be defined");

    console.log("[azureMigrationSmoke] basic repository wiring OK");
}

if (require.main === module) {
    run();
}

module.exports = { run };
