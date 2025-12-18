import axios from "axios";

/**
 * Call FastAPI /agentic-report endpoint
 * @param {string} userId - The ID of the user requesting the report
 * @param {string} reportType - Type of report (e.g. "Financial Audit")
 * @param {string|null} keyword - Optional keyword to search existing DB records
 * @param {string|null} newFileText - Optional text from a newly uploaded file
 * @returns {Promise<Object>} - JSON response from FastAPI containing analysis
 */
export async function generateAgenticReport(userId, reportType, keyword = null, newFileText = null) {
  try {
    // UPDATED PAYLOAD: Matches the Python Orchestrator's expectations
    // It distinguishes between searching history ('keyword') and analyzing new content ('new_file_text')
    const payload = {
      user_id: userId,
      report_type: reportType,
      keyword: keyword,        // Used by Python to search MongoDB context
      new_file_text: newFileText // Used by Python to merge new data with historical data
    };

    // Using Port 5000 as explicitly requested
    const response = await axios.post(
      "http://127.0.0.1:5000/agentic-report", 
      payload,
      {
        headers: { "Content-Type": "application/json" },
        // Increased timeout to 5 minutes for complex Agentic Analysis + Chart Generation
        timeout: 0
      }
    );

    // Check if response is successful
    if (!response.data) {
      throw new Error("No response from Agentic Report service");
    }

    return response.data;
  } catch (error) {
    console.error("Error calling Agentic Report service:", error.message);
    
    // Better error handling for connection refused (server down)
    if (error.code === 'ECONNREFUSED') {
       throw new Error("Python AI Service is unreachable at http://127.0.0.1:5000. Is the server running?");
    }
    
    throw new Error(error.response?.data?.error || error.message || "Agentic report failed");
  }
}