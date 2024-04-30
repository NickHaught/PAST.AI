import { PDFDetail, ProcessedPagesResponse } from "./fileTypes";

export const mergeScanResultsIntoPDFDetail = (
    pdfDetail: PDFDetail,
    processedResponse: ProcessedPagesResponse
): PDFDetail => {
    // Map each page in the existing PDFDetail
    const updatedPages = pdfDetail.pages.map(page => {
        // Find the corresponding processed page
        const processedPage = processedResponse.processed_pages.find(p => p.page_id === page.id);
        console.log("processedPage", processedPage)
        if (processedPage) {
            // Update json_output with new scan results
            return {
                ...page,
                scanned: true, // Mark the page as scanned if there's a processed entry
                json_output: processedPage.json_output // Set the entire json_output object from the processed page
            };
        }
        return page; // Return the original page if no processed data is found
    });

    // Return the updated PDFDetail with updated pages
    console.log("updatedPages", updatedPages)
    return {
        ...pdfDetail,
        pages: updatedPages
    };
};