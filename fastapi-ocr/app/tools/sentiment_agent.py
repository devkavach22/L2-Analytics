# app/tools/sentiment_agent.py
from textblob import TextBlob
from .llm_loader import load_llm
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

class SentimentAgent:
    def __init__(self):
        self.llm = load_llm()

    def run(self, text: str):
        # 1. NLP Exact Score
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity # -1.0 to 1.0
        
        label = "Neutral"
        if polarity > 0.1: label = "Positive"
        elif polarity < -0.1: label = "Negative"

        # 2. LLM Context
        prompt = PromptTemplate.from_template("""
        The document has a sentiment score of {score} ({label}). 
        Briefly explain why based on the text below:
        {text}
        """)
        
        chain = prompt | self.llm | StrOutputParser()
        analysis = chain.invoke({"text": text[:1500], "score": polarity, "label": label})

        return {
            "score": round(polarity, 2),
            "label": label,
            "analysis": analysis
        }