const LabService = require('../services/LabService');
const assert = require('assert');

function testNormalization() {
  console.log("Starting LabService.normalizeLessonContent tests...");

  // Test Case 1: Standard arrays
  const input1 = {
    key_points: ["Point 1", "Point 2"],
    suggested_next_steps: ["Step 1", "Step 2"],
    examples: [{ text: "Ex", explanation: "Expl" }],
    interactive_tasks: [{ id: "q1", question: "Q" }]
  };
  const out1 = LabService.normalizeLessonContent(JSON.parse(JSON.stringify(input1)));
  assert(Array.isArray(out1.key_points) && out1.key_points.length === 2, "Test 1 failed: key_points should be array");
  assert(Array.isArray(out1.suggested_next_steps) && out1.suggested_next_steps.length === 2, "Test 1 failed: suggested_next_steps should be array");

  // Test Case 2: String inputs (malformed AI response)
  const input2 = {
    key_points: "Single point string",
    suggested_next_steps: "Single step string"
  };
  const out2 = LabService.normalizeLessonContent(JSON.parse(JSON.stringify(input2)));
  assert(Array.isArray(out2.key_points) && out2.key_points.length === 1, "Test 2 failed: key_points string should become array");
  assert(out2.key_points[0] === "Single point string", "Test 2 failed: value mismatch");
  assert(Array.isArray(out2.suggested_next_steps) && out2.suggested_next_steps.length === 1, "Test 2 failed: suggested_next_steps string should become array");

  // Test Case 3: Missing inputs
  const input3 = {};
  const out3 = LabService.normalizeLessonContent(JSON.parse(JSON.stringify(input3)));
  assert(Array.isArray(out3.key_points) && out3.key_points.length === 0, "Test 3 failed: missing key_points should become empty array");
  assert(Array.isArray(out3.suggested_next_steps) && out3.suggested_next_steps.length === 0, "Test 3 failed: missing suggested_next_steps should become empty array");

  // Test Case 4: Null/Undefined items
  const input4 = {
    key_points: ["Valid", null, "  ", ""],
    suggested_next_steps: ["Valid step", undefined]
  };
  const out4 = LabService.normalizeLessonContent(JSON.parse(JSON.stringify(input4)));
  assert(out4.key_points.length === 1 && out4.key_points[0] === "Valid", "Test 4 failed: should filter invalid strings");
  assert(out4.suggested_next_steps.length === 1 && out4.suggested_next_steps[0] === "Valid step", "Test 4 failed: should filter invalid steps");

  console.log("✅ All tests passed!");
}

try {
  testNormalization();
} catch (err) {
  console.error("❌ Test failed:");
  console.error(err);
  process.exit(1);
}
