const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');

// POST /api/scrape endpoint
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;

    // Check if a URL was provided
    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    // Use fetch to get the HTML content of the page
    const response = await fetch(url);
    const html = await response.text();

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Find the page title and all the links
    const pageTitle = $('title').text();
    const links = [];
    $('a').each((i, link) => {
      links.push($(link).attr('href'));
    });

    // Send the scraped data back as a JSON response
    res.status(200).json({
      title: pageTitle,
      links: links
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Failed to scrape the URL.' });
  }
});

module.exports = router;