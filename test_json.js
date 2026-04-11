const s = "{\\\"a\\\": \\\"\\\\\\\\t\\\"}";
console.log("Literal JSON string in JS code:", s);
const obj = JSON.parse(s);
console.log("JS Object Value:", obj.a);
console.log("JS Object Length:", obj.a.length);
if (obj.a.length === 2 && obj.a === "\\t") {
    console.log("SUCCESS: Quadruple backslash in JSON results in literal \\ + t in JS!");
} else {
    console.log("FAILURE: Parsing did not give literal backslash + t.");
}
