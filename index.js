import sqlite3 from "sqlite3";
import AdmZip from "adm-zip";
import PDFMerger from "pdf-merger-js";
import fetch from "node-fetch";
import fsExtra from "fs-extra";
import fs from "fs/promises";
import yargs from "yargs";
import PromptSync from "prompt-sync";

let data;
let volumeId;
let token;
let platform;
let title;

const prompt = PromptSync({ sigint: true });

const argv = yargs(process.argv)
    .option("platform", {
        alias: "p",
        description:
            'Platform to download from, either "hubyoung" or "hubkids"',
        type: "string",
    })
    .option("volumeId", {
        alias: "v",
        description: "Volume ID of the book to download",
        type: "string",
    })
    .option("token", {
        alias: "t",
        description: "Token of the user",
        type: "string",
    })
    .option("file", {
        alias: "f",
        description: "The output file (defaults to book name)",
        type: "string",
    })
	.option("noCleanUp", {
		alias: "n",
		description: "Don't clean up the temp folder after merging",
		type: "boolean",
		default: false
	})
    .help()
    .alias("help", "h").argv;

async function initialize() {
    volumeId = argv.volumeId;
    token = argv.token;
    platform = argv.platform;

    await fsExtra.ensureDir("temp");

	// make sure folder is empty
	await fs.readdir("temp").then(async files => {
		for (const file of files) {
			await fsExtra.remove(`temp/${file}`);
		}
	});

    while (!platform) {
        platform = prompt(
            "Input the platform (either 'hubyoung' or 'hubkids'): "
        );
        if (platform !== "hubyoung" && platform !== "hubkids") {
            console.log(
                "Invalid platform, please input either 'hubyoung' or 'hubkids'"
            );
            platform = null;
        }
    }
    platform = platform === "hubyoung" ? "young" : "kids";
    while (!volumeId) volumeId = prompt("Input the volume ID: ");
    while (!token) token = prompt("Input the token: ");

    let response = await fetch("https://ms-api.hubscuola.it/me" + platform + "/publication/" + volumeId, { method: "GET", headers: { "Token-Session": token, "Content-Type": "application/json" } });
    const code = response.status;
    if (code === 500) {
        console.log("Volume ID not valid");
    } else if (code === 401) {
        console.log("Token Session not valid, you may have copied it wrong or you don't own this book.");
    } else {
        let result = await response.json();
        title = result.title;
        console.log(`Downloading "${title}"...`);
    }
}

async function downloadZip() {
    const zipFilePath = "temp/data.zip";
    return new Promise(async (resolve, reject) => {
        var res = await fetch(
            `https://ms-mms.hubscuola.it/downloadPackage/${volumeId}/publication.zip?tokenId=${token}`,
            { headers: { "Token-Session": token } }
        );
        if (res.status !== 200) {
            console.error("API error:", res.status);
            reject(res.status);
        }
        await fsExtra.writeFile(zipFilePath, Buffer.from(await res.arrayBuffer()), (err) => {
            if (err) {
                console.error(err);
                reject(err);
            }

            console.log("Downloaded chapters...");
            resolve();
        });
    });
}

function extractZip() {
    const zipFilePath = "temp/data.zip";
    const extractDir = "temp/extracted-files";
    const zip = new AdmZip(zipFilePath);

    zip.extractAllTo(extractDir);

    console.log("Extracted chapters...");
}

async function connectDb() {
    return new Promise((resolve, rejects) => {
        let db = new sqlite3.Database(
            "./temp/extracted-files/publication/publication.db",
            (err) => {
                if (err) {
                    console.error(err.message);
					rejects(err);
                }
            }
        );
        db.get(
            "SELECT offline_value FROM offline_tbl WHERE offline_path=?",
            [`meyoung/publication/${volumeId}`],
            (err, row) => {
                if (err) {
                    console.error(err);
                    reject();
                }
                if (!row) {
                    reject();
                }
                data = JSON.parse(row.offline_value).indexContents.chapters;
                console.log("Fetched chapters");
                resolve();
            }
        );
        db.close();
    });
}

async function extractPages() {
    for (const chapter of data) {
        const url = `https://ms-mms.hubscuola.it/public/${volumeId}/${chapter.chapterId}.zip?tokenId=${token}&app=v2`;
        var res = await fetch(url, {
            headers: { "Token-Session": token },
        }).then((res) => res.arrayBuffer());
        const zip = new AdmZip(Buffer.from(res));
        await zip.extractAllTo(`temp/build`);
    }
    console.log("Extracted pages...");
}

async function mergePages() {
    const merger = new PDFMerger();
    console.log("Merging pages...");
    for (const chapter of data) {
        let base = `./temp/build/${chapter.chapterId}`;
        const files = fsExtra.readdirSync(base);
        for (const file of files) {
            if (file.includes(".pdf")) {
                await merger.add(`${base}/${file}`);
            }
        }
    }
    merger.save(`${title}.pdf`);
    if (!argv.noCleanUp) fsExtra.removeSync("temp");
    console.log("Book saved");
}

await initialize();
await downloadZip();
extractZip();
await connectDb();
await extractPages();
await mergePages();