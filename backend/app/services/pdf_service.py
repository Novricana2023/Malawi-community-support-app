import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

from app.models.report import Report


def generate_report_pdf(report: Report) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "Title",
        parent=styles["Heading1"],
        fontSize=22,
        textColor=colors.HexColor("#1B4332"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=colors.HexColor("#52796F"),
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "Section",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#1B4332"),
        spaceBefore=12,
        spaceAfter=6,
    )

    elements = []

    elements.append(Paragraph("DELA LANGA", title_style))
    elements.append(Paragraph("Community Development Management System — Republic of Malawi", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#2D6A4F")))
    elements.append(Spacer(1, 16))
    elements.append(Paragraph("OFFICIAL REPORT RECEIPT", heading_style))
    elements.append(Spacer(1, 8))

    citizen = report.citizen
    data = [
        ["Report Number:", report.report_number],
        ["Date Submitted:", report.created_at.strftime("%d %B %Y, %H:%M")],
        ["Current Status:", report.status.value.replace("_", " ").title()],
        ["Urgency Level:", report.urgency.value.title()],
        ["", ""],
        ["Citizen Name:", citizen.full_name if citizen else "N/A"],
        ["Citizen ID:", citizen.citizen_id if citizen else "N/A"],
        ["Email:", citizen.email if citizen else "N/A"],
        ["Phone:", citizen.phone or "N/A"],
        ["District:", citizen.district or "N/A"],
        ["Area/Village:", citizen.area_village or "N/A"],
        ["", ""],
        ["Issue Category:", report.category.value.replace("_", " ").title()],
        ["Title:", report.title],
        ["Location:", report.location],
    ]

    if report.latitude and report.longitude:
        data.append(["GPS Coordinates:", f"{report.latitude:.6f}, {report.longitude:.6f}"])

    table = Table(data, colWidths=[5 * cm, 12 * cm])
    table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#1B4332")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 16))
    elements.append(Paragraph("Issue Description", heading_style))
    elements.append(Paragraph(report.description, styles["Normal"]))
    elements.append(Spacer(1, 24))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#95D5B2")))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        f"Generated on {datetime.utcnow().strftime('%d %B %Y at %H:%M UTC')} | "
        "Dela Langa — Every citizen has a voice. Every community issue has a path to resolution.",
        ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.grey),
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()


def generate_district_report_pdf(stats: dict, title: str = "District Development Report") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()

    elements = [
        Paragraph("DELA LANGA", ParagraphStyle("T", parent=styles["Heading1"], fontSize=22, textColor=colors.HexColor("#1B4332"))),
        Paragraph(title, styles["Heading2"]),
        Spacer(1, 16),
    ]

    summary_data = [
        ["Metric", "Value"],
        ["Total Reports", str(stats.get("total_reports", 0))],
        ["Resolved Issues", str(stats.get("resolved_issues", 0))],
        ["Pending Issues", str(stats.get("pending_issues", 0))],
        ["Emergency Cases", str(stats.get("emergency_cases", 0))],
        ["Average Resolution (days)", str(stats.get("avg_resolution_days", "N/A"))],
    ]
    table = Table(summary_data, colWidths=[8 * cm, 8 * cm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2D6A4F")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(table)

    if stats.get("by_category"):
        elements.append(Spacer(1, 20))
        elements.append(Paragraph("Issues by Category", styles["Heading3"]))
        cat_data = [["Category", "Count"]] + [[k, str(v)] for k, v in stats["by_category"].items()]
        cat_table = Table(cat_data, colWidths=[10 * cm, 6 * cm])
        cat_table.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(cat_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
