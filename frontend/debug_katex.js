
import katex from 'katex';

const testMath = `ACB ＆ = (1/2) AOB`;

try {
    katex.renderToString(testMath, { throwOnError: true });
    console.log("KATEX: SUCCESS");
} catch (e) {
    console.log("KATEX ERROR:", e.message);
}
