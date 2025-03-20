// Update your pages/api/spreadsheet.js file with this code:
import Papa from 'papaparse';

export default async function handler(req, res) {
  try {
    // Google Sheets CSV URL
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQmRxuNq9aykwW-TKuta9Ks7BEacVORU04KJsoLglFsUzIZTWBHINVbhsDH2LcUg6AfpxCiUKrGDBtN/pub?gid=0&single=true&output=csv';
    
    // Fetch the CSV data
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    // Get the CSV text
    const csvData = await response.text();
    
    // Check if CSV data is empty
    if (!csvData || csvData.trim() === '') {
      return res.status(404).json({ error: 'Empty CSV data received', csvUrl });
    }
    
    // Parse CSV to JSON
    const parseResult = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    
    // Check for parsing errors
    if (parseResult.errors && parseResult.errors.length > 0) {
      return res.status(400).json({ 
        error: 'CSV parsing error', 
        details: parseResult.errors,
        sample: csvData.substring(0, 200) // Show sample of the CSV
      });
    }
    
    // Log column headers for debugging
    const headers = parseResult.meta.fields;
    console.log('CSV Headers:', headers);
    
    // Map the data to a consistent format with more logging
    const formattedParticipants = parseResult.data.map(row => {
      const wallet = row["NEAR Wallet"] || row["near_wallet"] || row["wallet"] || "";
      const handle = row["X Handle"] || row["x_handle"] || row["twitter"] || "";
      const points = row["Total Points"] || row["total_points"] || row["points"] || 0;
      
      return { wallet, handle, points };
    });
    
    // Log some data for debugging
    console.log('Total rows before filtering:', parseResult.data.length);
    console.log('Sample row (first):', parseResult.data[0]);
    
    // Filter out incomplete entries and sort by points
    const sortedParticipants = formattedParticipants
      .filter(p => p.wallet && p.points)
      .sort((a, b) => b.points - a.points);
    
    console.log('Filtered and sorted rows:', sortedParticipants.length);
    
    // Return the sorted data
    res.status(200).json(sortedParticipants);
  } catch (error) {
    console.error('Error fetching spreadsheet:', error);
    res.status(500).json({ 
      error: 'Failed to fetch spreadsheet data', 
      message: error.message,
      stack: error.stack
    });
  }
}
