import os
import concurrent.futures
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Existing Agents
from .tools.summarizer_agent import SummarizerAgent
from .tools.keyword_agent import KeywordAgent
from .tools.trend_agent import TrendAgent
from .tools.decision_agent import DecisionAgent
from .tools.formatter_agent import FormatAgent
from .tools.data_extraction_agent import DataExtractionAgent
from .tools.collection_analyzer import CollectionAnalyzer

# NEW Agents
from .tools.risk_analysis_agent import RiskAnalysisAgent
from .tools.cognitive_analysis import CognitiveAgent
from .tools.sentiment_agent import SentimentAgent

from .tools.llm_loader import load_llm 
from .nlp_pipeline import clean_text
from .generators.chart_generator import generate_chart
from .generators.report_generator import render_html_report

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

# --- LAW ENFORCEMENT PROMPTS (SINGLE FILE) ---
LE_PROMPTS = {
    "criminal_profile": """
    Based on the provided text, create a Master Criminal Profile.
    Input Text: {text}
    Risk Analysis: {risks}
    
    Output Structure:
    1. Executive Summary
    2. Identity Details (Name, Age, Address)
    3. Criminal History / Allegations
    4. Modus Operandi (MO)
    5. Psych/Risk Assessment
    6. Associates mentioned
    """,
    "fir_analysis": """
    Analyze this FIR/Legal Document.
    Input Text: {text}
    
    Output Structure:
    1. Case Details (FIR No, Station, Date)
    2. Accused & Complainant
    3. Acts & Sections (IPC/CrPC)
    4. Timeline of Events
    5. Evidence/Witnesses Mentioned
    6. Investigative Leads
    """,
    "interrogation": """
    Analyze this Interrogation Transcript.
    Input Text: {text}
    Sentiment: {sentiment}

    Output Structure:
    1. Subject Information
    2. Summary of Statement
    3. Key Admissions vs Denials
    4. Inconsistencies Detected
    5. Behavioral Analysis
    6. Actionable Intelligence
    """,
    "custody": """
    Generate a Custody Movement Report.
    Input Text: {text}

    Output Structure:
    1. Inmate Details
    2. Movement History (Dates & Locations)
    3. Medical/Conduct Notes
    4. Upcoming Hearings
    """
}

class AgenticReportPipeline:
    def __init__(self):
        self.mongo_url = os.getenv("MONGO_URL")
        self.client = MongoClient(self.mongo_url)
        self.db = self.client[os.getenv("MONGO_DB_NAME")]
        self.collection = self.db["ocrrecords"] 

        self.llm = load_llm() 
        
        # Initialize Agents
        self.collection_analyzer = CollectionAnalyzer(self.collection)
        self.summarizer = SummarizerAgent()
        self.keyword_agent = KeywordAgent()
        self.trend_agent = TrendAgent()
        self.decision_agent = DecisionAgent()
        self.format_agent = FormatAgent()
        self.data_extractor = DataExtractionAgent()

        # Initialize Specialized Agents
        self.risk_agent = RiskAnalysisAgent()
        self.cognitive_agent = CognitiveAgent()
        self.sentiment_agent = SentimentAgent()

    def _get_user_query(self, user_id):
        try:
            return {"$in": [user_id, ObjectId(user_id)]}
        except:
            return user_id

    def _clean_llm_output(self, output):
        if hasattr(output, 'content'): 
            return output.content
        return str(output)

    def _identify_document(self, text):
        """Helper to run identification in a thread"""
        try:
            id_chain = PromptTemplate.from_template(
                "Identify this document type (e.g., FIR, Invoice, Contract). Return ONLY the type name:\n{text}"
            ) | self.llm | StrOutputParser()
            return id_chain.invoke({"text": text[:500]})
        except:
            return "Document"

    def _get_active_agents(self, report_type):
        """
        SPEED OPTIMIZATION: Returns a set of agents required for the report.
        This prevents running unnecessary agents.
        """
        rt = report_type.lower()
        active = {"summary", "keywords", "decision"} # Defaults

        # Trigger specialized agents based on keywords
        if any(x in rt for x in ["financial", "market", "sales", "trend"]):
            active.add("trends")
            active.add("chart")
        
        if any(x in rt for x in ["risk", "audit", "compliance", "legal", "fir", "criminal", "case"]):
            active.add("risks")
        
        if any(x in rt for x in ["psych", "sentiment", "hr", "interrogation", "interview"]):
            active.add("sentiment")
            active.add("cognitive")
        
        if any(x in rt for x in ["custody", "prison", "gang"]):
            active.add("risks")
            active.add("keywords")

        if any(x in rt for x in ["comprehensive", "full", "detailed"]):
            active.update({"trends", "risks", "sentiment", "cognitive", "chart"})

        return active

    def run(self, user_id: str, report_type: str, keyword: str = None, new_file_text: str = None):
        print(f"\n--- 🚀 Pipeline Started for User: {user_id} ---")
        print(f"📋 Report Type Requested: {report_type}")

        # =========================================================
        # STEP 1: DATA FETCHING
        # =========================================================
        current_text = new_file_text or ""
        user_query = self._get_user_query(user_id)

        if not current_text:
            last_record = self.collection.find_one({"userId": user_query}, sort=[("_id", -1)])
            if last_record and "extractedText" in last_record:
                current_text = last_record["extractedText"]
                print(f"✔ Found text in DB: {last_record.get('fileName')}")
            else:
                return {"success": False, "error": "No text available for analysis."}

        # Context History
        history_text = ""
        if keyword:
            cursor = self.collection.find(
                {"userId": user_query, "extractedText": {"$regex": keyword, "$options": "i"}}
            ).limit(5)
            docs = list(cursor)
            if docs: 
                history_text = "\n".join([d.get('extractedText', '')[:2000] for d in docs])

        full_context = f"{current_text}\n{history_text}"
        cleaned_text = clean_text(full_context)[:12000]
        
        # =========================================================
        # STEP 2: OPTIMIZED PARALLEL AGENT EXECUTION
        # =========================================================
        
        # KEY OPTIMIZATION: Only activate needed agents
        active_agents = self._get_active_agents(report_type)
        print(f"⚡ Activating specific agents: {active_agents}")

        results = {
            "summary": "",
            "keywords": [],
            "decisions": "Not requested.",
            "trends": "Not requested.",
            "risks": "Not requested.",
            "sentiment": "Not requested.",
            "cognitive": "Not requested.",
            "chart_path": None
        }
        
        doc_identity = "Document"

        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {}

            # Always run ID
            futures[executor.submit(self._identify_document, cleaned_text)] = "identity"

            # Conditionally run agents
            if "summary" in active_agents:
                futures[executor.submit(self.summarizer.run, cleaned_text)] = "summary"
            
            if "keywords" in active_agents:
                futures[executor.submit(self.keyword_agent.run, cleaned_text)] = "keywords"

            if "decision" in active_agents:
                futures[executor.submit(self.decision_agent.run, cleaned_text)] = "decisions"

            if "trends" in active_agents:
                futures[executor.submit(self.trend_agent.run, cleaned_text)] = "trends"

            if "risks" in active_agents:
                futures[executor.submit(self.risk_agent.run, cleaned_text)] = "risks"

            if "sentiment" in active_agents:
                futures[executor.submit(self.sentiment_agent.run, cleaned_text)] = "sentiment"

            if "cognitive" in active_agents:
                futures[executor.submit(self.cognitive_agent.run, cleaned_text)] = "cognitive"

            if "chart" in active_agents and len(cleaned_text) > 200:
                futures[executor.submit(self.data_extractor.run, cleaned_text, keyword or "Metrics")] = "chart_data"

            # Gather Results
            for future in concurrent.futures.as_completed(futures):
                task_type = futures[future]
                try:
                    res = future.result()
                    
                    if task_type == "identity":
                        doc_identity = res
                    elif task_type == "chart_data":
                        if res and res.get("values"):
                            results["chart_path"] = os.path.abspath(generate_chart(res))
                    else:
                        if isinstance(res, list):
                            results[task_type] = res
                        else:
                            results[task_type] = self._clean_llm_output(res)
                except Exception as e:
                    print(f"⚠ Agent {task_type} failed: {e}")

        print("✔ Agents Finished.")

        # =========================================================
        # STEP 3: FORMAT & GENERATE REPORT
        # =========================================================
        print("📝 Formatting Final Report...")
        
        # Check for Specialized Law Enforcement Requests
        rt = report_type.lower()
        specialized_template = None
        
        if "profile" in rt or "criminal" in rt:
            specialized_template = LE_PROMPTS["criminal_profile"]
        elif "fir" in rt or "case" in rt:
            specialized_template = LE_PROMPTS["fir_analysis"]
        elif "interrogation" in rt:
            specialized_template = LE_PROMPTS["interrogation"]
        elif "custody" in rt:
            specialized_template = LE_PROMPTS["custody"]

        if specialized_template:
            # Run specialized formatting
            prompt = PromptTemplate.from_template(specialized_template)
            chain = prompt | self.llm | StrOutputParser()
            report_text = chain.invoke({
                "text": cleaned_text,
                "risks": results["risks"],
                "sentiment": results["sentiment"]
            })
        else:
            # Run standard formatting
            try:
                raw_report = self.format_agent.run(
                    summary=results["summary"],
                    keywords=results["keywords"],
                    trends=results["trends"],
                    decisions=results["decisions"],
                    report_type=report_type
                )
                report_text = self._clean_llm_output(raw_report)
            except Exception as e:
                print(f"⚠ Formatting failed: {e}")
                report_text = results["summary"]

        results["report"] = report_text 
        results["final_report_text"] = report_text

        # Generate HTML/PDF
        download_link = render_html_report(results, report_type, user_id)

        return {
            "success": True,
            "collection_insight": {"context_desc": self._clean_llm_output(doc_identity)},
            "summary": results["summary"],
            "keywords": results["keywords"],
            "trends": results["trends"],
            "decisions": results["decisions"],
            "risks": results["risks"],
            "sentiment": results["sentiment"],
            "cognitive": results["cognitive"],
            "final_report_text": report_text, 
            "report": report_text,
            "download_link": download_link
        }

# import os
# from pymongo import MongoClient
# from bson import ObjectId
# from dotenv import load_dotenv

# # Import Agents
# from .tools.summarizer_agent import SummarizerAgent
# from .tools.keyword_agent import KeywordAgent
# from .tools.trend_agent import TrendAgent
# from .tools.decision_agent import DecisionAgent
# from .tools.formatter_agent import FormatAgent
# from .tools.data_extraction_agent import DataExtractionAgent
# from .tools.collection_analyzer import CollectionAnalyzer
# from .tools.llm_loader import load_llm 
# from .nlp_pipeline import clean_text
# from .ocr_utils import save_pdf
# from .generators.chart_generator import generate_chart
# from langchain_core.prompts import PromptTemplate
# from langchain_core.output_parsers import StrOutputParser

# load_dotenv()

# class AgenticReportPipeline:
#     def __init__(self):
#         self.mongo_url = os.getenv("MONGO_URL")
#         self.client = MongoClient(self.mongo_url)
#         self.db = self.client[os.getenv("MONGO_DB_NAME")]
#         # Force correct collection name
#         self.collection = self.db["ocrrecords"] 

#         self.llm = load_llm() 
#         self.collection_analyzer = CollectionAnalyzer(self.collection)
#         self.summarizer = SummarizerAgent()
#         self.keyword_agent = KeywordAgent()
#         self.trend_agent = TrendAgent()
#         self.decision_agent = DecisionAgent()
#         self.format_agent = FormatAgent()
#         self.data_extractor = DataExtractionAgent()

#     def _get_user_query(self, user_id):
#         try:
#             return {"$in": [user_id, ObjectId(user_id)]}
#         except:
#             return user_id

#     def _clean_llm_output(self, output):
#         """SAFETY HELPER: Ensures we never pass an AIMessage object to the PDF generator"""
#         if hasattr(output, 'content'): 
#             return output.content
#         return str(output)

#     def run(self, user_id: str, report_type: str, keyword: str = None, new_file_text: str = None):
#         print(f"\n--- 🚀 Pipeline Started for User: {user_id} ---")

#         # 1. ROBUST DATA FETCHING
#         current_text = new_file_text or ""
#         user_query = self._get_user_query(user_id)

#         # Fallback to DB
#         if not current_text:
#             print("⚠ Checking DB for latest file...")
#             last_record = self.collection.find_one({"userId": user_query}, sort=[("_id", -1)])
#             if last_record and "extractedText" in last_record:
#                 current_text = last_record["extractedText"]
#                 print(f"✔ Found text in DB: {last_record.get('fileName')}")
#             else:
#                 print("❌ No text found in DB.")

#         # History Context
#         history_text = ""
#         if keyword:
#             cursor = self.collection.find({"userId": user_query, "extractedText": {"$regex": keyword, "$options": "i"}})
#             docs = list(cursor)
#             if docs: history_text = "\n".join([d.get('extractedText', '') for d in docs])

#         full_context = f"{current_text}\n{history_text}"
#         if len(full_context.strip()) < 5:
#              return {"success": False, "error": "No text available for analysis."}

#         # 2. ANALYSIS
#         cleaned_text = clean_text(full_context)[:12000]
#         print("🧠 Identifying Document...")
        
#         try:
#             id_chain = PromptTemplate.from_template("Identify this document type: {text}") | self.llm | StrOutputParser()
#             doc_identity = id_chain.invoke({"text": cleaned_text[:500]})
#         except: 
#             doc_identity = "Document"

#         context_text = f"[TYPE: {doc_identity}]\n{cleaned_text}"
        
#         print("🤖 Running Agents...")
#         summary = self.summarizer.run(context_text)
#         keywords = self.keyword_agent.run(context_text)
#         decisions = self.decision_agent.run(context_text)
#         trends = self.trend_agent.run(context_text)

#         # Chart
#         chart_path = None
#         if len(cleaned_text) > 200:
#              chart_data = self.data_extractor.run(context_text, focus=keyword or "Metrics")
#              chart_path = generate_chart(chart_data)

#         # 3. FORMAT & SAVE
#         print("📝 Formatting...")
#         raw_report = self.format_agent.run(
#             summary=summary,
#             keywords=keywords,
#             trends=trends,
#             decisions=decisions,
#             report_type=report_type
#         )
        
#         # FINAL SAFETY CHECK: Convert to string before saving
#         final_report_str = self._clean_llm_output(raw_report)

#         safe_name = f"{user_id}_{keyword if keyword else 'report'}"[:15]
#         download_link = save_pdf(final_report_str, safe_name, report_type, image_path=chart_path)

#         return {
#             "success": True,
#             "collection_insight": {"context_desc": self._clean_llm_output(doc_identity)},
#             "summary": self._clean_llm_output(summary),
#             "final_report_text": final_report_str,
#             "download_link": download_link
#         }