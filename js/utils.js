// Utility functions for the Travel Business Case app

/**
 * Converts URLs in text to clickable HTML links
 * @param {string} text - The text containing URLs
 * @param {boolean} openInNewTab - Whether to open links in a new tab (default: true)
 * @returns {string} HTML string with clickable links
 */
function linkifyText(text, openInNewTab = true) {
    if (!text) return '';
    
    // Escape HTML to prevent XSS
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };
    
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
    
    // Split text by newlines to preserve formatting
    const lines = text.split('\n');
    
    const processedLines = lines.map(line => {
        // Check if line contains a URL
        if (urlRegex.test(line)) {
            // Reset regex lastIndex
            urlRegex.lastIndex = 0;
            
            // Replace URLs with clickable links
            return line.replace(urlRegex, (url) => {
                const target = openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
                const displayUrl = url.length > 50 ? url.substring(0, 47) + '...' : url;
                return `<a href="${url}"${target} style="color: #3b82f6; text-decoration: underline; word-break: break-all;">${escapeHtml(displayUrl)}</a>`;
            });
        }
        return escapeHtml(line);
    });
    
    // Join lines with <br> tags
    return processedLines.join('<br>');
}

/**
 * Converts URLs in text to plain text with line breaks (for plain text exports)
 * @param {string} text - The text containing URLs
 * @returns {string} Plain text with preserved formatting
 */
function linkifyPlainText(text) {
    if (!text) return '';
    return text; // Keep as is for plain text exports
}

/**
 * Extracts all URLs from text
 * @param {string} text - The text to extract URLs from
 * @returns {Array<string>} Array of URLs found in the text
 */
function extractUrls(text) {
    if (!text) return [];
    
    const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
    const matches = text.match(urlRegex);
    
    return matches || [];
}

/**
 * Checks if text contains any URLs
 * @param {string} text - The text to check
 * @returns {boolean} True if text contains URLs
 */
function containsUrls(text) {
    if (!text) return false;
    
    const urlRegex = /(https?:\/\/[^\s<>"]+)/gi;
    return urlRegex.test(text);
}

// Made with Bob
