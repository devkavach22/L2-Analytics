// /auth-backend/search/unifiedSearchPipeline.js
import elasticClient from "../services/elasticsearchClient.js";

export default async function unifiedSearchPipeline(query, userId) {
  try {
    const q = query.trim();
    if (!q) return { success: true, query, total: 0, results: [] };

    const response = await elasticClient.search({
      index: "universal_index",
      body: {
        query: {
          bool: {
            filter: [{ term: { userId: userId.toString() } }],
            should: [
              // 1. Search File Names & Metadata
              {
                multi_match: {
                  query: q,
                  fields: ["name^3", "flatData.*", "flatMeta.*"],
                  fuzziness: "AUTO",
                  operator: "or"
                }
              },
              // 2. Search Inside Pages (Nested)
              {
                nested: {
                  path: "file_pages",
                  query: {
                    multi_match: {
                      query: q,
                      fields: ["file_pages.text"],
                      fuzziness: "AUTO"
                    }
                  },
                  inner_hits: {
                    size: 3, 
                    highlight: {
                      fields: { "file_pages.text": {} },
                      pre_tags: ["<strong>"],
                      post_tags: ["</strong>"],
                      fragment_size: 150, // Length of the snippet (the "line")
                      number_of_fragments: 1
                    }
                  }
                }
              }
            ],
            minimum_should_match: 1
          }
        },
        highlight: {
          fields: { "name": {}, "flatData.*": {}, "flatMeta.*": {} }
        },
        _source: ["name", "folderName", "docType", "flatData", "flatMeta", "createdAt"]
      }
    });

    const processedResults = response.hits.hits.map((hit) => {
      const source = hit._source;
      
      // Process Page Matches
      let pageMatches = [];
      if (hit.inner_hits && hit.inner_hits.file_pages) {
        pageMatches = hit.inner_hits.file_pages.hits.hits.map(inner => {
          // If highlight exists, use it. If not (rare), take a substring.
          const snippet = inner.highlight && inner.highlight["file_pages.text"] 
            ? inner.highlight["file_pages.text"][0] 
            : (inner._source.text || "").substring(0, 100) + "...";

          return {
            pageNumber: inner._source.pageNumber,
            snippet: snippet.trim() // This acts as the "Line" context
          };
        });
      }

      // Process Metadata Matches
      let metaMatches = [];
      if (hit.highlight) {
        for (const [key, val] of Object.entries(hit.highlight)) {
          if (key !== "file_pages.text") {
            metaMatches.push({ field: key, value: val[0] });
          }
        }
      }

      return {
        id: hit._id,
        fileName: source.name,
        folderName: source.folderName || "Root",
        docType: source.docType,
        createdAt: source.createdAt,
        locations: [
          ...pageMatches.map(p => ({
            type: "content",
            description: `Found on Page ${p.pageNumber}`,
            snippet: p.snippet
          })),
          ...metaMatches.map(m => ({
            type: "metadata",
            description: `Found in ${m.field}`,
            snippet: m.value
          }))
        ]
      };
    });

    return {
      success: true,
      query,
      total: processedResults.length,
      results: processedResults
    };

  } catch (err) {
    console.error("Search Error:", err);
    return { success: false, query, total: 0, results: [], error: err.message };
  }
}