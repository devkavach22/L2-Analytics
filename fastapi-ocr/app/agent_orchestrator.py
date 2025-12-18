import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

# Import Agents
from .tools.summarizer_agent import SummarizerAgent
from .tools.keyword_agent import KeywordAgent
from .tools.trend_agent import TrendAgent
from .tools.decision_agent import DecisionAgent
from .tools.formatter_agent import FormatAgent
from .tools.data_extraction_agent import DataExtractionAgent
from .tools.collection_analyzer import CollectionAnalyzer
from .tools.llm_loader import load_llm 
from .nlp_pipeline import clean_text
from .ocr_utils import save_pdf
from .generators.chart_generator import generate_chart
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

load_dotenv()

class AgenticReportPipeline:
    def __init__(self):
        self.mongo_url = os.getenv("MONGO_URL")
        self.client = MongoClient(self.mongo_url)
        self.db = self.client[os.getenv("MONGO_DB_NAME")]
        # Force correct collection name
        self.collection = self.db["ocrrecords"] 

        self.llm = load_llm() 
        self.collection_analyzer = CollectionAnalyzer(self.collection)
        self.summarizer = SummarizerAgent()
        self.keyword_agent = KeywordAgent()
        self.trend_agent = TrendAgent()
        self.decision_agent = DecisionAgent()
        self.format_agent = FormatAgent()
        self.data_extractor = DataExtractionAgent()

    def _get_user_query(self, user_id):
        try:
            return {"$in": [user_id, ObjectId(user_id)]}
        except:
            return user_id

    def _clean_llm_output(self, output):
        """SAFETY HELPER: Ensures we never pass an AIMessage object to the PDF generator"""
        if hasattr(output, 'content'): 
            return output.content
        return str(output)

    def run(self, user_id: str, report_type: str, keyword: str = None, new_file_text: str = None):
        print(f"\n--- 🚀 Pipeline Started for User: {user_id} ---")

        # 1. ROBUST DATA FETCHING
        current_text = new_file_text or ""
        user_query = self._get_user_query(user_id)

        # Fallback to DB
        if not current_text:
            print("⚠ Checking DB for latest file...")
            last_record = self.collection.find_one({"userId": user_query}, sort=[("_id", -1)])
            if last_record and "extractedText" in last_record:
                current_text = last_record["extractedText"]
                print(f"✔ Found text in DB: {last_record.get('fileName')}")
            else:
                print("❌ No text found in DB.")

        # History Context
        history_text = ""
        if keyword:
            cursor = self.collection.find({"userId": user_query, "extractedText": {"$regex": keyword, "$options": "i"}})
            docs = list(cursor)
            if docs: history_text = "\n".join([d.get('extractedText', '') for d in docs])

        full_context = f"{current_text}\n{history_text}"
        if len(full_context.strip()) < 5:
             return {"success": False, "error": "No text available for analysis."}

        # 2. ANALYSIS
        cleaned_text = clean_text(full_context)[:12000]
        print("🧠 Identifying Document...")
        
        try:
            id_chain = PromptTemplate.from_template("Identify this document type: {text}") | self.llm | StrOutputParser()
            doc_identity = id_chain.invoke({"text": cleaned_text[:500]})
        except: 
            doc_identity = "Document"

        context_text = f"[TYPE: {doc_identity}]\n{cleaned_text}"
        
        print("🤖 Running Agents...")
        summary = self.summarizer.run(context_text)
        keywords = self.keyword_agent.run(context_text)
        decisions = self.decision_agent.run(context_text)
        trends = self.trend_agent.run(context_text)

        # Chart
        chart_path = None
        if len(cleaned_text) > 200:
             chart_data = self.data_extractor.run(context_text, focus=keyword or "Metrics")
             chart_path = generate_chart(chart_data)

        # 3. FORMAT & SAVE
        print("📝 Formatting...")
        raw_report = self.format_agent.run(
            summary=summary,
            keywords=keywords,
            trends=trends,
            decisions=decisions,
            report_type=report_type
        )
        
        # FINAL SAFETY CHECK: Convert to string before saving
        final_report_str = self._clean_llm_output(raw_report)

        safe_name = f"{user_id}_{keyword if keyword else 'report'}"[:15]
        download_link = save_pdf(final_report_str, safe_name, report_type, image_path=chart_path)

        return {
            "success": True,
            "collection_insight": {"context_desc": self._clean_llm_output(doc_identity)},
            "summary": self._clean_llm_output(summary),
            "final_report_text": final_report_str,
            "download_link": download_link
        }