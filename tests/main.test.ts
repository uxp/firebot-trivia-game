import triviaScript from "../src/main";

test("main default export is the custom script", () => {
    expect(triviaScript).not.toBeUndefined();
    expect(triviaScript.run).not.toBeUndefined();
    expect(triviaScript.getScriptManifest).not.toBeUndefined();
    expect(triviaScript.getScriptManifest()).not.toBeUndefined();
    expect(triviaScript.getDefaultParameters).not.toBeUndefined();
    expect(triviaScript.getDefaultParameters()).not.toBeUndefined();
});
