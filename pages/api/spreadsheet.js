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
    
    // Log raw CSV data for debugging (first 500 chars)
    console.log('Raw CSV data (sample):', csvData.substring(0, 500));
    
    // Parse CSV to JSON
    const parseResult = Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim() // Trim whitespace from headers
    });
    
    // Check for parsing errors
    if (parseResult.errors && parseResult.errors.length > 0) {
      return res.status(400).json({ 
        error: 'CSV parsing error', 
        details: parseResult.errors,
        sample: csvData.substring(0, 200)
      });
    }
    
    // Log column headers and data for debugging
    const headers = parseResult.meta.fields;
    console.log('CSV Headers:', headers);
    console.log('Raw data sample:', parseResult.data.slice(0, 2));
    
    // Map the data to our format using the exact column names from your sheet
    const formattedParticipants = parseResult.data.map(row => {
      // Use the exact column names you provided
      const wallet = row["Near Wallet Address"] || "";
      const handle = row["X User Name"] || "";
      const points = parseInt(row["Points"]) || 0;
      
      return { wallet, handle, points };
    });
    
    // Log formatted data for debugging
    console.log('Formatted data sample:', formattedParticipants.slice(0, 2));
    
    // Filter out incomplete entries and sort by points
    const filteredParticipants = formattedParticipants.filter(p => p.wallet && p.points);
    console.log('Filtered entries count:', filteredParticipants.length);
    
    const sortedParticipants = filteredParticipants.sort((a, b) => b.points - a.points);
    
    // Return the sorted data
    res.status(200).json(sortedParticipants);
  } catch (error) {
    console.error('Error fetching spreadsheet:', error);
    res.status(500).json({ 
      error: 'Failed to fetch spreadsheet data', 
      message: error.message
    });
  }
}
