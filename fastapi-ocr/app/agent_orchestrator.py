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
from .ocr_utils import save_pdf
from .generators.chart_generator import generate_chart
from .generators.report_generator import render_html_report

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

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

        # Initialize NEW Agents
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
                "Identify this document type (e.g., Invoice, Contract, Report, Email). Return ONLY the type name:\n{text}"
            ) | self.llm | StrOutputParser()
            return id_chain.invoke({"text": text[:500]})
        except:
            return "Document"

    def run(self, user_id: str, report_type: str, keyword: str = None, new_file_text: str = None):
        print(f"\n--- 🚀 Pipeline Started for User: {user_id} ---")

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
        # STEP 2: PARALLEL AGENT EXECUTION
        # =========================================================
        print("⚡ Running Analysis Agents in Parallel...")
        
        results = {}
        doc_identity = "Document"

        with concurrent.futures.ThreadPoolExecutor() as executor:
            # 1. Start Document ID Task
            f_id = executor.submit(self._identify_document, cleaned_text)
            
            # 2. Start Analytical Agents
            f_sum = executor.submit(self.summarizer.run, cleaned_text)
            f_key = executor.submit(self.keyword_agent.run, cleaned_text)
            f_dec = executor.submit(self.decision_agent.run, cleaned_text)
            f_trd = executor.submit(self.trend_agent.run, cleaned_text)
            f_rsk = executor.submit(self.risk_agent.run, cleaned_text)
            f_sen = executor.submit(self.sentiment_agent.run, cleaned_text)
            f_cog = executor.submit(self.cognitive_agent.run, cleaned_text)
            
            # 3. Chart Generation
            f_chart = None
            if len(cleaned_text) > 200:
                f_chart = executor.submit(self.data_extractor.run, cleaned_text, keyword or "Metrics")

            # 4. Gather Results
            try:
                doc_identity = f_id.result() 
            except Exception:
                pass

            results = {
                "summary": self._clean_llm_output(f_sum.result()),
                "keywords": f_key.result(),
                "decisions": self._clean_llm_output(f_dec.result()),
                "trends": f_trd.result(),
                "risks": self._clean_llm_output(f_rsk.result()),
                "sentiment": self._clean_llm_output(f_sen.result()),
                "cognitive": self._clean_llm_output(f_cog.result()),
                "chart_path": None
            }
            
            if f_chart:
                try:
                    chart_raw = f_chart.result()
                    if chart_raw and chart_raw.get("values"):
                        results["chart_path"] = os.path.abspath(generate_chart(chart_raw))
                except Exception:
                    pass

        print("✔ All Agents Finished.")

        # =========================================================
        # STEP 3: FORMAT & GENERATE REPORT
        # =========================================================
        print("📝 Formatting Final Report...")
        
        report_text = "" # FIX: Initialize variable to avoid 'undefined' errors
        
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

        # FIX: Ensure "report" key exists for the API response
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
            "report": report_text, # <--- CRITICAL FIX for 'report is undefined'
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