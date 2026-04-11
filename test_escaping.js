const testReplace = (slashes) => {
    const input = "foo";
    const result = input.replace("foo", slashes);
    console.log(`Input: ${slashes.length} slashes in memory string`);
    console.log(`Result: "${result}" (Length: ${result.length})`);
    return result.length;
}

console.log("--- Testing 2 memory slashes ---");
testReplace("\\\\");

console.log("--- Testing 4 memory slashes ---");
testReplace("\\\\\\\\");

console.log("--- Testing 8 memory slashes ---");
testReplace("\\\\\\\\\\\\\\\\");
