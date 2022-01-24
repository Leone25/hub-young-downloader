const { PDFDocument, StandardFonts, rgb } = PDFLib;

const warningAcceptInput = document.getElementById("warning-accept");
const warningAcceptLabel = document.getElementById("warning-accept-label");
const submit = document.getElementById("download");
const tokenInput = document.getElementById("token");
const tokenLabel = document.getElementById("token-label");
const volumeIdLabel = document.getElementById("volume-id-label");
const volumeIdInput = document.getElementById("volume-id");
submit.addEventListener("click", async (e) => {
    e.preventDefault();
    fieldError(!warningAcceptInput.checked, warningAcceptLabel);
    fieldError(!tokenInput.value, tokenLabel);
    fieldError(!volumeIdInput.value, volumeIdLabel);
    if (warningAcceptInput.checked && tokenInput.value && volumeIdInput.value) {
        await download();
    }
});


async function download() {

    // Check if token is copied with ""
    if (tokenInput.value.startsWith('"')) {
        tokenInput.value = tokenInput.value.slice(1);
    }
    if (tokenInput.value.endsWith('"')) {
        tokenInput.value = tokenInput.value.slice(0, tokenInput.value.length - 1);
    }

    let token = tokenInput.value;
    let volumeId = volumeIdInput.value;
    console.log(token);
    info("Obtaining volume info . . . ");

    let response = await fetch("https://ms-api.hubscuola.it/meyoung/publication/" + volumeId, { method: "GET", headers: { "Token-Session": token, "Content-Type": "application/json" } });
    const code = response.status;
    if (code === 500) {
        info("Volume ID not valid");
    } else if (code === 401) {
        info(`Token Session not valid, you may have copied it wrong or you don't own this book.`);
    } else {
        let result = await response.json();
        const title = result.title;
        console.log(result);
        info(`Downloading "${title}"`);
        preventExit(true);
        let pdfDoc = await PDFDocument.create();
        for (i = 0; i < result.pagesId.length; i++) {
            info(`${title}\nDownloading page ${i} of ${result.pagesId.length} - ${(i / result.pagesId.length * 100).toFixed(2)}%`);

            let pageInfo = await fetch(`https://ms-api.hubscuola.it/meyoung/publication/${volumeId}/page/${result.pagesId[i]}`, { method: "GET", headers: { "Token-Session": token, "Content-Type": "application/json" } }).then(res => res.json());
            let pageData = await fetch(pageInfo.renders.last().mediaUrl, { method: "GET", cache: "force-cache" }).then((res) => res.arrayBuffer());

            let { height, width, topCrop, leftCrop } = pageInfo.renders.last();

            let page = pdfDoc.addPage([width, height]);

            let pageImage = await pdfDoc.embedJpg(pageData);

            page.drawImage(pageImage, {
                x: leftCrop,
                y: height - pageImage.height - topCrop,
            });
        }
        info(`Generating file . . .`);
        pdfDoc.setTitle(title);
        let pdfBytes = await pdfDoc.save();
        let link = document.createElement('a');
        link.download = title + '.pdf';
        let blob = new Blob([pdfBytes.buffer], { type: 'text/plain' });
        link.href = URL.createObjectURL(blob);
        info(`Saving!`);
        link.click();
        URL.revokeObjectURL(link.href);
        preventExit(false);
    }

}

function info(text) {
    console.log(text);
    document.getElementById("result").innerText = text + "\n";
}

function preventExit(shoudlPrevent) {
    const fn = (e) => {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = '';
    };
    if (shoudlPrevent) {
        window.addEventListener('beforeunload', fn);
    } else {
        window.removeEventListener("beforeunload", fn);
    }
}

function fieldError(errorCondition, label) {
    function add() {
        label.classList.add("error");
        label.addEventListener("click", rm);
    }
    function rm() {
        label.classList.remove("error");
        label.removeEventListener("click", rm);
    }
    if (errorCondition) add();
    else label.classList.remove("error");
}

Array.prototype.last = function (q) {
    return this[this.length - 1 - (q || 0)];
};