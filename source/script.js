var { PDFDocument, StandardFonts, rgb } = PDFLib;

async function download() {
    let token = document.getElementById("token").value;
    let volumeId = document.getElementById("volume-id").value;

    info("Obtaining volume info . . . ");

    let response = await fetch("https://ms-api.hubscuola.it/meyoung/publication/" + volumeId, {method:"GET", headers:{"Token-Session":token, "Content-Type": "application/json"}});

    let result = await response.json();

    console.log(result);
    
    info(`Downloading "${result.title}"`);

    let pdfDoc = await PDFDocument.create();

    for (i = 0; i < result.pagesId.length; i++) {
        info(`Downloading page ${i} of ${result.pagesId.length} - ${(i/result.pagesId.length*100).toFixed(2)}%`);
        
        let pageInfo = await fetch(`https://ms-api.hubscuola.it/meyoung/publication/${volumeId}/page/${result.pagesId[i]}`, {method:"GET", headers:{"Token-Session":token, "Content-Type": "application/json"}}).then(res => res.json());
        let pageData = await fetch(pageInfo.renders.last().mediaUrl, {method:"GET", cache:"force-cache"}).then((res) => res.arrayBuffer());

        let {height, width, topCrop, leftCrop} = pageInfo.renders.last();

        let page = pdfDoc.addPage([width, height]);

        let pageImage = await pdfDoc.embedJpg(pageData);

        page.drawImage(pageImage, {
            x: leftCrop,
            y: height - pageImage.height - topCrop,
        });
    }

    info(`Generating file . . .`);

    pdfDoc.setTitle(result.title);

    let pdfBytes = await pdfDoc.save();

    let link = document.createElement('a');
    link.download = result.title + '.pdf';

    let blob = new Blob([pdfBytes.buffer], {type: 'text/plain'});

    link.href = URL.createObjectURL(blob);
    
    info(`Saving!`);

    link.click();

    URL.revokeObjectURL(link.href);
}

function info(text) {
    console.log(text);
    document.getElementById("result").innerText = text + "\n";
}

Array.prototype.last = function(q) {
    return this[this.length - 1 - (q||0)];
}