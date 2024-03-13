import yargs from 'yargs';
import fetch from "node-fetch";
import { writeFileSync } from "fs";
import PromptSync from 'prompt-sync';

const prompt = PromptSync({ sigint: true });

const argv = yargs(process.argv)
  .option('platform', {
	alias: 'p',
	description: 'Platform to download from, either "hubyoung" or "hubkids"',
	type: 'string',
  })
  .option('volumeId', {
    alias: 'v',
    description: 'Volume ID of the book to download',
    type: 'string',
  })
  .option('container', {
    alias: 'c',
    description: 'Container for the book (either Kids or Young)',
    type: 'string',
  })
  .option('token', {
    alias: 't',
    description: 'Token of the user',
    type: 'string',
  })
  .option('file', {
    alias: 'f',
    description: 'The output file (defaults to book name)',
    type: 'string',
  })
  .help()
  .alias('help', 'h').argv;

(async () => {

    let volumeId = argv.volumeId;
    let token = argv.token;
	let platform = argv.platform;

	while (!platform) {
		platform = prompt("Input the platform (either 'hubyoung' or 'hubkids'): ");
		if (platform !== 'hubyoung' && platform !== 'hubkids') {
			console.log("Invalid platform, please input either 'hubyoung' or 'hubkids'");
			platform = null;
		}
	}
	platform = platform === 'hubyoung' ? 'young' : 'kids';
    while (!volumeId)
        volumeId = prompt("Input the volume ID: ");
    while (!token)
        token = prompt("Input the token: ");

    console.log("Obtaining volume info . . . ");

    let response = await fetch("https://ms-api.hubscuola.it/me" + platform + "/publication/" + volumeId, { method: "GET", headers: { "Token-Session": token, "Content-Type": "application/json" } });
    const code = response.status;
    if (code === 500) {
        console.log("Volume ID not valid");
    } else if (code === 401) {
        console.log("Token Session not valid, you may have copied it wrong or you don't own this book.");
    } else {
        let result = await response.json();
        const title = result.title;
        console.log(`Downloading "${title}"\nObtaining access token . . .`);
        let auth = await fetch(`https://ms-pdf.hubscuola.it/i/d/${volumeId}/auth`, { 
            method: "POST", 
            body: JSON.stringify({jwt: result.jwt, origin: `https://${platform}.hubscuola.it/viewer/${volumeId}?page=1`}), 
            headers: { 
                "PSPDFKit-Platform": "web", 
                "PSPDFKit-Version": "protocol=3, client=2020.6.0, client-git=63c8a36705"
            } 
        }).then(res => res.json());
        console.log(`Downloading PDF (may take a couple of seconds) . . .`);
        let pdf = await fetch(`https://ms-pdf.hubscuola.it/i/d/${volumeId}/h/${auth.layerHandle}/pdf?token=${auth.token}`).then(res => res.arrayBuffer());
        writeFileSync(argv.file || (title + '.pdf'), Buffer.from(pdf));
        console.log(`Saving!`);
    }
})();
