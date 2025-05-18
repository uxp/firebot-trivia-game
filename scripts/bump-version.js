#!/usr/bin/env node

const path = require('path');
const { writeFileSync, readFileSync, readFile, existsSync } = require('fs');
const {inc} = require("semver");

const {Command} = require('commander');
const program = new Command()

function fatal(msg) {
    console.error();
    console.error('    ' + msg);
    console.error();
    process.exit(1);
}

function bump(root, type) {
    const packagePath = path.resolve(root, "./package.json");
    if (!existsSync(packagePath)) {
        throw new Error("Unable to locate package.json");
    }
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    const version = packageJson.version;
    if (!version) {
        throw new Error("No version found in package.json")
    }

    const newVersion = inc(packageJson.version, type);
    if (!newVersion) {
        throw new Error(`Unable to bump version number from ${version} using ${type}`);
    }
    packageJson.version = newVersion;
    writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');

    // Bump Script version with package string
    const mainPath = path.resolve(root, "./src/main.ts");
    if (!existsSync(mainPath)) {
        throw new Error("Unable to locate src/main.ts");
    }
    const mainData = readFileSync(mainPath, "utf-8");
    const mainFile = mainData.replace(`version: "${version}",`, `version: "${newVersion}",`);
    writeFileSync(mainPath, mainFile);

    return newVersion;
}

program
    .usage("[options] <version>")
    .description("Bumps version number.")
    .argument("<version>", "semver version or type (major, premajor, minor, preminor, patch, prepatch, prerelease, or release)")
    .option('-d', '--dir <dir>', 'determine the directory to use as the root')
    .parse(process.argv);

if (program.args.length !== 1) program.help();

let info = undefined;
try {
    const dir = program.dir || path.resolve(__dirname, '../');
    const version = program.args.shift();

    info = bump(dir, version);
} catch (e) {
    fatal(e.message);
}

console.log('Version bumped to "' + info + '".');