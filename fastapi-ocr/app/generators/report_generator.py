# app/report_generator.py

import os
import pdfkit
from jinja2 import Environment, FileSystemLoader

# -------------------------------------------------
# PATH CONFIG
# -------------------------------------------------
BASE_DIR = os.path.dirname(__file__)
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
OUTPUT_DIR = os.path.join(BASE_DIR, "static", "outputs")

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# -------------------------------------------------
# ORIGINAL LOGIC (PRESERVED)
# -------------------------------------------------
def render_html_report(data: dict, report_type: str, user_id: str):
    """
    Renders HTML template and converts to PDF.
    """
    report_lower = report_type.lower()

    # ORIGINAL MAPPING (UNCHANGED)
    if "security" in report_lower:
        template_name = "report_security.html"
    elif "technical" in report_lower or "deep dive" in report_lower:
        template_name = "report_ai_modern.html"
    elif "market" in report_lower:
        template_name = "report_finance.html"
    elif "executive" in report_lower:
        template_name = "report_corporate.html"

    # -------------------------------------------------
    # NEW LAW-ENFORCEMENT REPORT TEMPLATES (ADDED)
    # -------------------------------------------------
    elif report_lower == "master_criminal_profile":
        template_name = "report_master_profile.html"
    elif report_lower == "fir_case_analysis":
        template_name = "report_fir_case.html"
    elif report_lower == "interrogation_intelligence":
        template_name = "report_interrogation.html"
    elif report_lower == "custody_movement":
        template_name = "report_custody.html"
    elif report_lower == "gang_network":
        template_name = "report_gang_network.html"
    elif report_lower == "court_ready_summary":
        template_name = "report_court_ready.html"
    else:
        template_name = "report_corporate.html"

    # -------------------------------------------------
    # TEMPLATE LOAD
    # -------------------------------------------------
    try:
        template = env.get_template(template_name)
    except Exception:
        template = env.get_template("report_corporate.html")

    # Safe list rendering
    trends_html = "<ul>" + "".join(
        [f"<li>{t}</li>" for t in data.get("trends", [])]
    ) + "</ul>"

    html_content = template.render(
        title=data.get("title", report_type.title()),
        executive_summary=data.get("executive_summary", ""),
        summary=data.get("summary", ""),
        identity=data.get("identity", ""),
        history=data.get("history", ""),
        associates=data.get("associates", ""),
        risk=data.get("risk", ""),
        legal_status=data.get("legal_status", ""),
        overview=data.get("overview", ""),
        timeline=data.get("timeline", ""),
        charges=data.get("charges", ""),
        evidence=data.get("evidence", ""),
        gaps=data.get("gaps", ""),
        statements=data.get("statements", ""),
        inconsistencies=data.get("inconsistencies", ""),
        behavior=data.get("behavior", ""),
        leads=data.get("leads", ""),
        transfers=data.get("transfers", ""),
        compliance=data.get("compliance", ""),
        anomalies=data.get("anomalies", ""),
        individuals=data.get("individuals", ""),
        relationships=data.get("relationships", ""),
        confidence=data.get("confidence", ""),
        observations=data.get("observations", ""),
        trends=trends_html,
        chart_path=data.get("chart_path", "")
    )

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filename = f"{user_id}_{report_type}.pdf"
    output_path = os.path.join(OUTPUT_DIR, filename)

    try:
        pdfkit.from_string(
            html_content,
            output_path,
            options={"enable-local-file-access": ""}
        )
        return output_path
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return ""


# import os
# import pdfkit
# from jinja2 import Environment, FileSystemLoader

# TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), 'templates')
# OUTPUT_DIR = "static/outputs"

# env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

# def render_html_report(data: dict, report_type: str, user_id: str):
#     """
#     Renders HTML template and converts to PDF.
#     """
#     report_lower = report_type.lower()
    
#     # MAPPING: Report Type -> Template
#     if "security" in report_lower: 
#         template_name = "report_security.html"
#     elif "technical" in report_lower or "deep dive" in report_lower: 
#         template_name = "report_ai_modern.html" # Use Modern for Tech Deep Dive
#     elif "market" in report_lower: 
#         template_name = "report_finance.html"   # Use Finance for Market Analysis
#     elif "executive" in report_lower: 
#         template_name = "report_corporate.html" # Default Corporate for Exec Summary
#     else:
#         template_name = "report_corporate.html"

#     try:
#         template = env.get_template(template_name)
#     except:
#         template = env.get_template("report_corporate.html")

#     # Safe List Conversion
#     trends_html = "<ul>" + "".join([f"<li>{t}</li>" for t in data.get('trends', [])]) + "</ul>"

#     # Render
#     html_content = template.render(
#         title=f"{report_type.title()} Report",
#         summary=data.get('summary', 'No summary.'),
#         keywords=", ".join(data.get('keywords', [])),
#         trends=trends_html,
#         risks=data.get('risks', ''),
#         sentiment=data.get('sentiment', ''),
#         cognitive=data.get('cognitive', ''),
#         decisions=data.get('decisions', ''),
#         chart_path=data.get('chart_path', '')
#     )

#     # Save
#     os.makedirs(OUTPUT_DIR, exist_ok=True)
#     filename = f"{user_id}_{report_type.replace(' ', '_')}.pdf"
#     output_path = os.path.join(OUTPUT_DIR, filename)

#     try:
#         pdfkit.from_string(html_content, output_path, options={"enable-local-file-access": ""})
#         return output_path
#     except Exception as e:
#         print(f"❌ PDF Gen Error: {e}")
#         return ""