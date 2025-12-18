import os
import uuid
import asyncio
import base64
import datetime
import logging
import re
import matplotlib.pyplot as plt
import matplotlib
import markdown
from jinja2 import Environment, FileSystemLoader, BaseLoader
from weasyprint import HTML
from concurrent.futures import ThreadPoolExecutor
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# --- 1. ROBUST IMPORT FOR LLM ---
try:
    from .llm_loader import load_llm
except ImportError:
    load_llm = lambda: None # Fallback if file is missing

# --- LOGGING SETUP ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- SAFE IMPORTS (NLP/RAG) ---
try:
    from .nlp_pipeline import NLP_Pipeline
    from .rag_engine import RAGEngine
except ImportError:
    logger.warning("⚠️ NLP/RAG modules not found. Running in standalone mode.")
    NLP_Pipeline = None
    RAGEngine = None

# Force non-interactive backend for server speed
matplotlib.use('Agg')

# --- DEFAULT TEMPLATE (Fallback) ---
DEFAULT_HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ report_title }}</title>
    <style>
        @page { size: A4; margin: 2.5cm; }
        body { font-family: Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; }
        .header-wrapper { border-bottom: 2px solid #0056b3; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; }
        .report-title { font-size: 24px; font-weight: 700; color: #0056b3; text-transform: uppercase; }
        .report-subtitle { font-size: 12px; color: #777; font-style: italic; }
        h1, h2 { color: #2c3e50; margin-top: 25px; }
        h2 { font-size: 14pt; color: #0056b3; border-bottom: 1px solid #eee; }
        .badge { padding: 2px 8px; border-radius: 4px; color: white; font-size: 10px; font-weight: bold; margin-right: 5px; }
        .high { background: #d9534f; } .medium { background: #f0ad4e; } .low { background: #5bc0de; }
        .chart-container { text-align: center; margin: 30px 0; border: 1px solid #eee; padding: 10px; }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="header-wrapper">
        <div>
            <div class="report-title">{{ report_title }}</div>
            <div class="report-subtitle">{{ report_subtitle }}</div>
        </div>
        <div>
            <div><strong>Date:</strong> {{ generation_date }}</div>
            <div><strong>Case ID:</strong> {{ ref_id }}</div>
        </div>
    </div>
    <div class="content-body">{{ narrative_html | safe }}</div>
    {% if chart_image %}
    <div class="chart-container">
        <img src="data:image/png;base64,{{ chart_image }}" alt="Chart">
    </div>
    {% endif %}
</body>
</html>
"""

class FormatAgent:
    def __init__(self, output_dir="static/reports"):
        self.output_dir = output_dir
        
        # --- 2. SAFE LLM LOADING ---
        try:
            self.llm = load_llm()
            if self.llm is None:
                raise ValueError("load_llm() returned None")
        except Exception as e:
            logger.critical(f"❌ CRITICAL ERROR: Could not load LLM. {e}")
            self.llm = None  # Handle gracefully later

        self.nlp = NLP_Pipeline() if NLP_Pipeline else None
        self.rag = RAGEngine() if RAGEngine else None
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)

    async def _run_nlp_async(self, text):
        if not self.nlp: return {"stats": "N/A", "data": {}}
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.nlp.analyze, text)

    async def _run_rag_async(self, query):
        if not self.rag: return "No historical context available."
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self.executor, self.rag.query, query)

    def _generate_chart_sync(self, data: dict, title: str) -> str:
        try:
            if not data or not isinstance(data, dict): return None
            filename = f"chart_{uuid.uuid4().hex[:8]}.png"
            filepath = os.path.join(self.output_dir, filename)
            
            labels = list(data.keys())[:8]
            values = list(data.values())[:8]
            if not labels: return None

            plt.style.use('ggplot')
            plt.figure(figsize=(10, 4))
            if len(labels) <= 5:
                plt.pie(values, labels=labels, autopct='%1.1f%%', startangle=90)
            else:
                plt.bar(labels, values, color='#0056b3', alpha=0.8)
            
            plt.title(title)
            plt.tight_layout()
            plt.savefig(filepath, dpi=100, bbox_inches='tight')
            plt.close()
            return filepath
        except Exception:
            return None

    def _post_process_html(self, html_content):
        replacements = [
            (r"(?i)\b(HIGH PRIORITY)\b", r'<span class="badge high">\1</span>'),
            (r"(?i)\b(MEDIUM PRIORITY)\b", r'<span class="badge medium">\1</span>'),
            (r"(?i)\b(LOW PRIORITY)\b", r'<span class="badge low">\1</span>'),
        ]
        for pattern, replacement in replacements:
            html_content = re.sub(pattern, replacement, html_content)
        return html_content

    def _render_pdf_sync(self, llm_text: str, chart_path: str, report_type: str) -> str:
        try:
            rtype = report_type.lower()
            subtitle = "Strategic Analysis"
            if "criminal" in rtype: subtitle = "Forensic Investigation Log"
            elif "interrogation" in rtype: subtitle = "Subject Interview Analysis"

            raw_html = markdown.markdown(llm_text, extensions=['extra', 'smarty'])
            clean_html = self._post_process_html(raw_html)

            chart_base64 = ""
            if chart_path and os.path.exists(chart_path):
                with open(chart_path, "rb") as img_file:
                    chart_base64 = base64.b64encode(img_file.read()).decode('utf-8')

            env = Environment(loader=BaseLoader())
            template = env.from_string(DEFAULT_HTML_TEMPLATE)

            final_html = template.render(
                report_title=f"{report_type}",
                report_subtitle=subtitle,
                ref_id=uuid.uuid4().hex[:12].upper(),
                generation_date=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                narrative_html=clean_html,
                chart_image=chart_base64
            )

            pdf_filename = f"Report_{uuid.uuid4().hex[:8]}.pdf"
            pdf_path = os.path.join(self.output_dir, pdf_filename)
            HTML(string=final_html).write_pdf(pdf_path)
            return pdf_path

        except Exception as e:
            logger.error(f"❌ PDF Gen Failed: {e}")
            return None

    def _get_template(self, report_type):
        return f"""
You are a specialized AI Analyst. Report Type: {report_type}

**DATA:**
- Summary: {{summary}}
- Trends: {{trends}}
- RAG Context: {{rag_context}}

Structure the response in Markdown with ## Headings and **Bold** keys.
Include a Risk Assessment and Strategic Recommendations (High/Medium/Low).
"""

    async def run_async(self, summary: str, keywords: list, trends: list, decisions: str, report_type: str):
        # --- 3. SAFETY CHECK: IS LLM LOADED? ---
        if not self.llm:
            logger.error("⛔ ABORTING: LLM not loaded.")
            return {
                "status": "error",
                "message": "Server Error: AI Model failed to initialize. Check API keys."
            }

        kw_str = ", ".join(keywords) if isinstance(keywords, list) else str(keywords or "")
        trends_str = "\n".join(trends) if isinstance(trends, list) else str(trends or "")
        summary = str(summary or "No summary provided.")

        # Parallel NLP/RAG
        nlp_task = self._run_nlp_async(summary)
        rag_task = self._run_rag_async(f"{summary} {kw_str[:50]}")
        nlp_result, rag_context = await asyncio.gather(nlp_task, rag_task)
        
        nlp_stats = nlp_result.get('summary_stats', "Analysis Pending")
        chart_data = nlp_result.get('numerical_data', {})
        
        if not chart_data and keywords and isinstance(keywords, list):
            chart_data = {k: 10 + len(k) for k in keywords[:6]} 

        # Chart Generation
        loop = asyncio.get_running_loop()
        chart_path = await loop.run_in_executor(
            self.executor, 
            self._generate_chart_sync, 
            chart_data, 
            "Key Metrics"
        )

        # LLM Generation
        template_str = self._get_template(report_type)
        prompt = PromptTemplate.from_template(template_str)
        
        # --- 4. SAFE CHAIN CONSTRUCTION ---
        try:
            chain = prompt | self.llm | StrOutputParser()
            llm_text = await chain.ainvoke({
                "summary": summary,
                "keywords": kw_str,
                "trends": trends_str,
                "decisions": decisions,
                "nlp_stats": nlp_stats,
                "rag_context": rag_context
            })
        except Exception as e:
            logger.error(f"❌ LLM Execution Failed: {e}")
            return {"status": "error", "message": f"AI Generation Failed: {str(e)}"}

        # PDF Rendering
        pdf_path = await loop.run_in_executor(
            self.executor,
            self._render_pdf_sync,
            llm_text,
            chart_path,
            report_type
        )

        return {
            "status": "success",
            "pdf_path": pdf_path,
            "report_text": llm_text
        }

    def run(self, *args, **kwargs):
        return asyncio.run(self.run_async(*args, **kwargs))

# import os
# import uuid
# import asyncio
# import base64
# import datetime
# import logging
# import re
# import matplotlib.pyplot as plt
# import matplotlib
# import markdown
# from jinja2 import Environment, FileSystemLoader, BaseLoader
# from weasyprint import HTML
# from concurrent.futures import ThreadPoolExecutor
# from .llm_loader import load_llm
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser

# # --- LOGGING SETUP ---
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # --- SAFE IMPORTS ---
# try:
#     from .nlp_pipeline import NLP_Pipeline
#     from .rag_engine import RAGEngine
# except ImportError:
#     logger.warning("⚠️ NLP/RAG modules not found. Running in standalone mode.")
#     NLP_Pipeline = None
#     RAGEngine = None

# # Force non-interactive backend for server speed
# matplotlib.use('Agg')

# # --- PROFESSIONAL REPORT TEMPLATE ---
# # Updated to support dynamic subtitles (report_subtitle)
# DEFAULT_HTML_TEMPLATE = """
# <!DOCTYPE html>
# <html lang="en">
# <head>
#     <meta charset="UTF-8">
#     <title>{{ report_title }}</title>
#     <style>
#         @page {
#             size: A4;
#             margin: 2.5cm;
#             @bottom-center {
#                 content: "Page " counter(page);
#                 font-family: 'Helvetica', sans-serif;
#                 font-size: 10px;
#                 color: #999;
#             }
#         }
#         body {
#             font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
#             color: #333;
#             line-height: 1.6;
#             font-size: 11pt;
#             max-width: 100%;
#         }
        
#         /* HEADER SECTION */
#         .header-wrapper {
#             border-bottom: 2px solid #0056b3;
#             padding-bottom: 15px;
#             margin-bottom: 30px;
#             display: flex;
#             justify-content: space-between;
#             align-items: flex-end;
#         }
#         .report-title {
#             font-size: 24px;
#             font-weight: 700;
#             color: #0056b3;
#             margin: 0;
#             text-transform: uppercase;
#         }
#         .report-subtitle {
#             font-size: 12px;
#             color: #777;
#             margin-top: 5px;
#             font-style: italic;
#         }
#         .meta-info {
#             font-size: 10px;
#             color: #666;
#             text-align: right;
#         }

#         /* TYPOGRAPHY */
#         h1, h2, h3 { color: #2c3e50; margin-top: 25px; margin-bottom: 10px; }
#         h1 { font-size: 18pt; border-bottom: 1px solid #eee; padding-bottom: 5px; }
#         h2 { font-size: 14pt; font-weight: 600; color: #0056b3; margin-top: 30px; }
#         h3 { font-size: 11pt; font-weight: 700; background: #f4f4f4; padding: 5px 10px; border-left: 4px solid #0056b3; }
        
#         /* CLEAN CONTENT */
#         p { margin-bottom: 12px; text-align: justify; }
#         strong { color: #000; font-weight: 700; }
#         ul { margin-bottom: 15px; padding-left: 20px; }
#         li { margin-bottom: 5px; }

#         /* PRIORITY BADGES */
#         .badge {
#             display: inline-block;
#             padding: 2px 8px;
#             border-radius: 4px;
#             font-size: 9px;
#             font-weight: bold;
#             text-transform: uppercase;
#             color: white;
#             margin-right: 5px;
#         }
#         .high { background-color: #d9534f; }   /* Red */
#         .medium { background-color: #f0ad4e; } /* Orange */
#         .low { background-color: #5bc0de; }    /* Blue */

#         /* VISUALS */
#         .chart-container {
#             margin: 30px 0;
#             padding: 20px;
#             background: #fcfcfc;
#             border: 1px solid #eef;
#             border-radius: 5px;
#             text-align: center;
#             page-break-inside: avoid;
#         }
#         .chart-container img {
#             max-width: 100%;
#             height: auto;
#         }
#         .caption { font-size: 9pt; color: #777; margin-top: 10px; font-style: italic; }
#     </style>
# </head>
# <body>
#     <div class="header-wrapper">
#         <div>
#             <div class="report-title">{{ report_title }}</div>
#             <div class="report-subtitle">{{ report_subtitle }}</div>
#         </div>
#         <div class="meta-info">
#             <div><strong>Date:</strong> {{ generation_date }}</div>
#             <div><strong>Case ID:</strong> {{ ref_id }}</div>
#         </div>
#     </div>

#     <div class="content-body">
#         {{ narrative_html | safe }}
#     </div>

#     {% if chart_image %}
#     <h2>Visual Analysis</h2>
#     <div class="chart-container">
#         <img src="data:image/png;base64,{{ chart_image }}" alt="Analysis Chart">
#         <div class="caption">Figure 1: Generated analysis based on processed data metrics.</div>
#     </div>
#     {% endif %}

#     <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 10px; font-size: 9px; color: #aaa; text-align: center;">
#         CONFIDENTIAL | Generated by Konvert HR AI System
#     </div>
# </body>
# </html>
# """

# class FormatAgent:
#     def __init__(self, output_dir="static/reports"):
#         self.llm = load_llm()
#         self.output_dir = output_dir
#         self.nlp = NLP_Pipeline() if NLP_Pipeline else None
#         self.rag = RAGEngine() if RAGEngine else None
#         self.executor = ThreadPoolExecutor(max_workers=4)
        
#         if not os.path.exists(self.output_dir):
#             os.makedirs(self.output_dir)

#     async def _run_nlp_async(self, text):
#         if not self.nlp: return {"stats": "N/A", "data": {}}
#         loop = asyncio.get_running_loop()
#         return await loop.run_in_executor(self.executor, self.nlp.analyze, text)

#     async def _run_rag_async(self, query):
#         if not self.rag: return "No historical context available."
#         loop = asyncio.get_running_loop()
#         return await loop.run_in_executor(self.executor, self.rag.query, query)

#     def _generate_chart_sync(self, data: dict, title: str) -> str:
#         try:
#             if not data or not isinstance(data, dict): return None
            
#             filename = f"chart_{uuid.uuid4().hex[:8]}.png"
#             filepath = os.path.join(self.output_dir, filename)
            
#             labels = list(data.keys())[:8]
#             values = list(data.values())[:8]
            
#             if not labels: return None

#             plt.style.use('ggplot')
#             plt.figure(figsize=(10, 4))
            
#             if len(labels) <= 5:
#                 colors = ['#0056b3', '#5bc0de', '#f0ad4e', '#d9534f', '#5cb85c']
#                 plt.pie(values, labels=labels, autopct='%1.1f%%', colors=colors[:len(labels)], startangle=90)
#             else:
#                 plt.bar(labels, values, color='#0056b3', alpha=0.8)
#                 plt.xticks(rotation=45, ha='right', fontsize=9)
#                 plt.grid(axis='y', alpha=0.3, linestyle='--')
            
#             plt.title(title, fontsize=12, color='#333')
#             plt.tight_layout()
#             plt.savefig(filepath, dpi=120, bbox_inches='tight')
#             plt.close()
#             return filepath
#         except Exception:
#             return None

#     def _post_process_html(self, html_content):
#         """Adds styling badges to specific keywords."""
#         replacements = [
#             (r"(?i)\b(HIGH PRIORITY)\b", r'<span class="badge high">\1</span>'),
#             (r"(?i)\b(MEDIUM PRIORITY)\b", r'<span class="badge medium">\1</span>'),
#             (r"(?i)\b(LOW PRIORITY)\b", r'<span class="badge low">\1</span>'),
#             (r"(?i)\b(CRITICAL)\b", r'<span class="badge high">\1</span>'),
#             (r"(?i)\b(CONFIRMED DECEPTION)\b", r'<span class="badge high">\1</span>'),
#         ]
#         for pattern, replacement in replacements:
#             html_content = re.sub(pattern, replacement, html_content)
#         return html_content

#     def _render_pdf_sync(self, llm_text: str, chart_path: str, report_type: str) -> str:
#         try:
#             # 1. Determine Subtitle based on Type
#             rtype = report_type.lower()
#             if "criminal" in rtype or "investigation" in rtype:
#                 subtitle = "Forensic Investigation & Evidence Log"
#             elif "interrogation" in rtype or "interview" in rtype:
#                 subtitle = "Subject Interview & Behavioral Analysis"
#             else:
#                 subtitle = "Executive Summary & Strategic Insights"

#             # 2. Convert Markdown -> HTML
#             raw_html = markdown.markdown(llm_text, extensions=['extra', 'smarty'])
#             clean_html = self._post_process_html(raw_html)

#             # 3. Handle Chart
#             chart_base64 = ""
#             if chart_path and os.path.exists(chart_path):
#                 with open(chart_path, "rb") as img_file:
#                     chart_base64 = base64.b64encode(img_file.read()).decode('utf-8')

#             # 4. Load Template
#             env = Environment(loader=BaseLoader())
#             template = env.from_string(DEFAULT_HTML_TEMPLATE)

#             # 5. Render
#             final_html = template.render(
#                 report_title=f"{report_type} Report",
#                 report_subtitle=subtitle,
#                 ref_id=uuid.uuid4().hex[:12].upper(),
#                 generation_date=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
#                 narrative_html=clean_html,
#                 chart_image=chart_base64
#             )

#             # 6. Write PDF
#             pdf_filename = f"{report_type.replace(' ','_')}_{uuid.uuid4().hex[:8]}.pdf"
#             pdf_path = os.path.join(self.output_dir, pdf_filename)
#             HTML(string=final_html).write_pdf(pdf_path)
            
#             return pdf_path

#         except Exception as e:
#             logger.error(f"❌ PDF Gen Failed: {e}")
#             return None

#     def _get_template(self, report_type):
#         """
#         Returns a specialized prompt based on the report category.
#         """
#         rtype = report_type.lower()

#         # --- TYPE 1: CRIMINAL / FORENSIC ---
#         if any(x in rtype for x in ["criminal", "investigation", "forensic", "case"]):
#             return f"""
# You are a **Senior Forensic Investigator**. Generate a strict **Criminal Investigation Report**.
# Use formal legal terminology. Avoid speculation. Focus on evidence and facts.

# **CASE DATA:**
# - **Incident Summary:** {{summary}}
# - **Evidence/Keywords:** {{keywords}}
# - **RAG Records:** {{rag_context}}

# ---
# # REPORT STRUCTURE (Strict Markdown)

# ## Incident Overview
# **Nature of Offense:** (e.g., Cybercrime, Fraud, Assault)
# **Timeline:** Reconstruct the sequence of events based on the summary.

# ## Evidence Log
# List key pieces of evidence or data points found.
# * **Item 1:** (Description)
# * **Item 2:** (Description)

# ## Suspect & Entity Profile
# Analyze the entities mentioned (People/Organizations). Use the RAG context to link them to past history if available.

# ## Investigative Findings
# Detailed analysis of the crime. Connect the evidence to the timeline.

# ## Recommended Charges / Next Steps
# 1. **HIGH PRIORITY** (Immediate legal or investigative action)
# 2. **MEDIUM PRIORITY** (Follow-up required)

# ---
# """

#         # --- TYPE 2: INTERROGATION / INTERVIEW ---
#         elif any(x in rtype for x in ["interrogation", "interview", "statement", "witness"]):
#             return f"""
# You are an **Expert Interrogator & Behavioral Analyst**. Generate a **Subject Interview Report**.
# Focus on the subject's statements, consistency, and hidden indicators of deception.

# **INTERVIEW DATA:**
# - **Statement Summary:** {{summary}}
# - **Sentiment/Tone:** {{nlp_stats}}
# - **Fact-Check (RAG):** {{rag_context}}

# ---
# # REPORT STRUCTURE (Strict Markdown)

# ## Subject Information
# **Interview Context:** (Setting/Reason for interview)

# ## Statement Summary
# Summarize what the subject claimed happened.

# ## Behavioral & Sentiment Analysis
# Analyze the tone of the subject. 
# * Is the sentiment consistent with the events described?
# * Are there signs of stress or deflection? (Use NLP stats)

# ## Inconsistencies & Deception Markers
# Compare the subject's statement with the Historical Facts (RAG Context).
# * **Statement:** (What they said) -> **Fact Check:** (Contradiction/Verification)

# ## Interrogator's Conclusion
# Provide a final verdict on the subject's credibility.
# **Verdict:** (Truthful / Inconclusive / Deceptive)

# ---
# """

#         # --- TYPE 3: STANDARD / ANALYSIS (Default) ---
#         else:
#             return f"""
# You are a **Strategic Data Analyst**. Generate a **Comprehensive Analysis Report**.
# Focus on trends, business impact, and strategic decision making.

# **DATA INPUTS:**
# - **Data Summary:** {{summary}}
# - **Key Metrics:** {{keywords}}
# - **Trends:** {{trends}}
# - **Historical Context:** {{rag_context}}

# ---
# # REPORT STRUCTURE (Strict Markdown)

# ## Executive Summary
# **What:** High-level overview.
# **Why:** Root cause or driver.
# **Impact:** Business/Operational outcome.

# ## Deep Dive Analysis
# Analyze the trends provided.
# * **Observation 1:** Detail
# * **Observation 2:** Detail

# ## Risk & Opportunity Assessment
# * **Operational Risk:** (Score 0-10) - Explanation
# * **Financial Opportunity:** Explanation

# ## Strategic Recommendations
# 1. **HIGH PRIORITY** (Action item)
# 2. **MEDIUM PRIORITY** (Action item)
# 3. **LOW PRIORITY** (Action item)

# ---
# """

#     async def run_async(self, summary: str, keywords: list, trends: list, decisions: str, report_type: str):
#         logger.info(f"🚀 Processing Report: {report_type}")
        
#         kw_str = ", ".join(keywords) if isinstance(keywords, list) else str(keywords or "")
#         trends_str = "\n".join(trends) if isinstance(trends, list) else str(trends or "")
#         summary = str(summary or "No summary provided.")

#         # 1. Run Analysis (Async)
#         nlp_task = self._run_nlp_async(summary)
#         rag_task = self._run_rag_async(f"{summary} {kw_str[:50]}")
        
#         nlp_result, rag_context = await asyncio.gather(nlp_task, rag_task)
#         nlp_stats = nlp_result.get('summary_stats', "Analysis Pending")
        
#         # Chart Data Logic
#         chart_data = nlp_result.get('numerical_data', {})
#         if not chart_data and keywords and isinstance(keywords, list):
#             # Fallback: Count frequency or relevance mock
#             chart_data = {k: 10 + len(k) for k in keywords[:6]} 

#         # 2. Generate Chart
#         loop = asyncio.get_running_loop()
#         chart_path = await loop.run_in_executor(
#             self.executor, 
#             self._generate_chart_sync, 
#             chart_data, 
#             f"{report_type} - Key Metrics"
#         )

#         # 3. Generate Content (LLM)
#         template_str = self._get_template(report_type)
#         prompt = PromptTemplate.from_template(template_str)
#         chain = prompt | self.llm | StrOutputParser()

#         try:
#             llm_text = await chain.ainvoke({
#                 "summary": summary,
#                 "keywords": kw_str,
#                 "trends": trends_str,
#                 "decisions": decisions,
#                 "nlp_stats": nlp_stats,
#                 "rag_context": rag_context
#             })
#         except AttributeError:
#             llm_text = chain.invoke({
#                 "summary": summary,
#                 "keywords": kw_str,
#                 "trends": trends_str,
#                 "decisions": decisions,
#                 "nlp_stats": nlp_stats,
#                 "rag_context": rag_context
#             })

#         # 4. Render PDF
#         pdf_path = await loop.run_in_executor(
#             self.executor,
#             self._render_pdf_sync,
#             llm_text,
#             chart_path,
#             report_type
#         )

#         return {
#             "status": "success",
#             "pdf_path": pdf_path,
#             "chart_path": chart_path,
#             "report_text": llm_text
#         }

#     def run(self, *args, **kwargs):
#         return asyncio.run(self.run_async(*args, **kwargs))

# from .llm_loader import load_llm
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser


# class FormatAgent:
#     def __init__(self):
#         self.llm = load_llm()

#     def run(
#         self,
#         summary: str,
#         keywords: list,
#         trends: list,
#         decisions: str,
#         report_type: str
#     ):
#         kw_str = ", ".join(keywords) if isinstance(keywords, list) else str(keywords)
#         trends_str = "\n".join(trends) if isinstance(trends, list) else str(trends)

#         template = """
# You are a **senior enterprise report architect**.

# Your task is to generate a **highly structured, clean, and professional report**
# that is suitable for:
# - Executives
# - Auditors
# - Financial / Legal reviewers
# - AI dashboards
# - PDF exports

# ---

# # STRICT OUTPUT RULES (MANDATORY)

# 1. Output **ONLY Markdown**
# 2. Use proper **headings (##, ###)**
# 3. Use **bold text** for labels, key metrics, and insights
# 4. Maintain **clear spacing between sections**
# 5. Use bullet points and numbered lists where applicable
# 6. Do NOT include emojis
# 7. Do NOT include explanations outside the report
# 8. The report must look **clean even without styling**

# ---

# # REPORT METADATA
# **Report Type:** {report_type}

# ---

# # CONTENT INPUT (DO NOT COPY RAW)
# - Summary: {summary}
# - Keywords: {keywords}
# - Trends: {trends}
# - Decisions: {decisions}

# ---

# # REQUIRED REPORT STRUCTURE (FOLLOW EXACTLY)

# ## TITLE
# Concise, professional title aligned with the report type.

# ---

# ## EXECUTIVE SUMMARY
# Write 1–2 short paragraphs summarizing the document at a strategic level.
# Focus on insights, scale, and implications.

# ---

# ## KEY FINDINGS
# Use bullet points.
# Each point must:
# - Start with a **bold heading**
# - Follow with a short explanation

# ---

# ## TRENDS & PATTERNS
# Use numbered points.
# Explain:
# - What is happening
# - Why it matters

# ---

# ## STRATEGIC RECOMMENDATIONS
# List actionable steps.
# Use **priority labels** such as:
# - **High Priority**
# - **Medium Priority**
# - **Low Priority**

# ---

# ## CONCLUSION
# Provide a clear, professional closing statement.
# Keep it short and forward-looking.

# ---

# # FINAL REPORT (MARKDOWN ONLY)
# """

#         prompt = PromptTemplate.from_template(template)
#         chain = prompt | self.llm | StrOutputParser()

#         try:
#             return chain.invoke({
#                 "report_type": report_type,
#                 "summary": summary,
#                 "keywords": kw_str,
#                 "trends": trends_str,
#                 "decisions": decisions
#             })
#         except Exception as e:
#             print(f"Formatter Error: {e}")
#             return "Error generating structured report."
