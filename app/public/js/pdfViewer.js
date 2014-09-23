//
// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
//
var url = '/CReference.pdf';
url = '/pdf' + location.search;

//
// Disable workers to avoid yet another cross-origin issue (workers need
// the URL of the script to be loaded, and dynamically loading a cross-origin
// script does not work).
//
// PDFJS.disableWorker = true;

//
// If pdf.js must be execute via eval or pdf.worker.js is located at the
// different location that pdf.js, specify workerSrc.
//
// PDFJS.workerSrc = '../../build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.0,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
            pageRendering = false;
            if (pageNumPending !== null) {
                // New page rendering is pending
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    // Update page counters
    document.getElementById('page_num').textContent = pageNum;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}
document.getElementById('next').addEventListener('click', onNextPage);

/**
 * Zoom in page.
 */
function onZoomIn() {
    if (scale > 10) {
        return;
    }
    scale *= 1.2;
    queueRenderPage(pageNum);
}
document.getElementById('zoomIn').addEventListener('click', onZoomIn);

/**
 * Zoom out page.
 */
function onZoomOut() {
    if (scale < 0.1) {
        return;
    }
    scale /= 1.2;
    queueRenderPage(pageNum);
}
document.getElementById('zoomOut').addEventListener('click', onZoomOut);

/**
 * Set viewer for PDF show
 */
document.body.addEventListener('contextmenu', function(e) {
    e.stopPropagation();
    e.preventDefault();
    return false;
}, true);

/**
 * Asynchronously downloads PDF.
 */
PDFJS.getDocument(url).then(function (pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
});