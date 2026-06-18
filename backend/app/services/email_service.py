import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings
from app.models.report import Report, ReportStatus
from app.models.user import User

logger = logging.getLogger(__name__)

STATUS_LABELS = {
    ReportStatus.SUBMITTED: "Report Submitted",
    ReportStatus.UNDER_REVIEW: "Under Review",
    ReportStatus.ASSIGNED: "Assigned to Department",
    ReportStatus.IN_PROGRESS: "Action in Progress",
    ReportStatus.RESOLVED: "Resolved",
    ReportStatus.CLOSED: "Closed",
}


def _format_category(category: str) -> str:
    return category.replace("_", " ").title()


def _email_wrapper(title: str, body_html: str, accent: str = "#1B4332") -> str:
    return f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:{accent};padding:28px 32px;">
            <p style="margin:0;color:#95D5B2;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Republic of Malawi</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;">Dela Langa</h1>
            <p style="margin:4px 0 0;color:#B7E4C7;font-size:13px;">Community Development Management System</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px;color:#1B4332;font-size:20px;">{title}</h2>
            {body_html}
          </td>
        </tr>
        <tr>
          <td style="background:#f8faf9;padding:20px 32px;border-top:1px solid #e8ecea;">
            <p style="margin:0;color:#888;font-size:12px;text-align:center;">
              Every citizen has a voice. Every community issue has a path to resolution.<br>
              &copy; Dela Langa — District Commissioner&apos;s Office
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
"""


def _report_details_block(report: Report) -> str:
    category = _format_category(report.category.value if hasattr(report.category, "value") else str(report.category))
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8faf9;border-radius:12px;padding:4px;margin:16px 0;">
      <tr><td style="padding:12px 16px;">
        <p style="margin:0 0 8px;color:#666;font-size:12px;">REPORT NUMBER</p>
        <p style="margin:0 0 16px;color:#1B4332;font-size:18px;font-weight:bold;">{report.report_number}</p>
        <p style="margin:0 0 4px;color:#666;font-size:12px;">ISSUE</p>
        <p style="margin:0 0 12px;color:#333;font-size:15px;font-weight:bold;">{report.title}</p>
        <p style="margin:0 0 4px;color:#666;font-size:12px;">CATEGORY</p>
        <p style="margin:0 0 12px;color:#333;">{category}</p>
        <p style="margin:0 0 4px;color:#666;font-size:12px;">LOCATION</p>
        <p style="margin:0;color:#333;">{report.location}</p>
      </td></tr>
    </table>
    """


def _cta_button(url: str, label: str, color: str = "#2D6A4F") -> str:
    return f"""
    <p style="text-align:center;margin:24px 0 8px;">
      <a href="{url}" style="display:inline-block;background:{color};color:#ffffff;text-decoration:none;
        padding:14px 28px;border-radius:10px;font-weight:bold;font-size:14px;">
        {label}
      </a>
    </p>
    """


def send_email(to_email: str, subject: str, html_body: str, text_body: str) -> bool:
    if not to_email:
        logger.warning("Email skipped: no recipient address")
        return False

    if not settings.EMAIL_ENABLED:
        logger.info("[EMAIL DEMO] To: %s | Subject: %s", to_email, subject)
        logger.info("[EMAIL DEMO] Body: %s", text_body[:200])
        return True

    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.warning("Email skipped: SMTP not configured")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    try:
        if settings.SMTP_USE_SSL:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
            if settings.SMTP_USE_TLS:
                server.starttls()
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
        server.quit()
        logger.info("Email sent to %s: %s", to_email, subject)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
        return False


def send_report_received_email(citizen: User, report: Report) -> bool:
    track_url = f"{settings.FRONTEND_URL}/citizen/reports/{report.id}"
    body = f"""
    <p style="color:#444;line-height:1.6;margin:0 0 16px;">
      Dear <strong>{citizen.full_name}</strong>,<br><br>
      Your community report has been received by the District Commissioner&apos;s Office.
      You will receive email updates as your issue progresses.
    </p>
    {_report_details_block(report)}
    {_cta_button(track_url, "Track Your Report")}
    """
    html = _email_wrapper("Report Received", body)
    text = (
        f"Dear {citizen.full_name},\n\n"
        f"Your report {report.report_number} has been received.\n"
        f"Issue: {report.title}\n"
        f"Track: {track_url}\n"
    )
    return send_email(citizen.email, f"Report Received — {report.report_number}", html, text)


def send_status_update_email(
    citizen: User,
    report: Report,
    new_status: ReportStatus,
    old_status: str | None = None,
) -> bool:
    is_solved = new_status in (ReportStatus.RESOLVED, ReportStatus.CLOSED)
    label = STATUS_LABELS.get(new_status, new_status.value.replace("_", " ").title())

    if is_solved:
        accent = "#2D6A4F"
        title = "Your Issue Has Been Resolved"
        intro = (
            f"Great news, <strong>{citizen.full_name}</strong>! "
            f"The District Commissioner&apos;s Office has resolved your community report."
        )
        solved_url = f"{settings.FRONTEND_URL}/citizen/solved"
        cta = _cta_button(solved_url, "View Your Solved Issues", "#2D6A4F")
        subject = f"Issue Resolved — {report.report_number}"
    else:
        accent = "#1B4332"
        title = f"Status Update: {label}"
        intro = (
            f"Dear <strong>{citizen.full_name}</strong>,<br><br>"
            f"Your report status has been updated to <strong>{label}</strong>."
        )
        track_url = f"{settings.FRONTEND_URL}/citizen/reports/{report.id}"
        cta = _cta_button(track_url, "View Report Details")
        subject = f"Status Update — {report.report_number}"

    resolution_block = ""
    if is_solved and report.resolution_notes:
        resolution_block = f"""
        <div style="background:#ecfdf5;border-left:4px solid #2D6A4F;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 4px;color:#166534;font-size:12px;font-weight:bold;">RESOLUTION SUMMARY</p>
          <p style="margin:0;color:#15803d;">{report.resolution_notes}</p>
        </div>
        """

    status_line = ""
    if old_status:
        old_label = old_status.replace("_", " ").title()
        status_line = f"""
        <p style="color:#666;font-size:14px;margin:0 0 16px;">
          Previous status: <span style="text-decoration:line-through;">{old_label}</span>
          &rarr; <strong style="color:#1B4332;">{label}</strong>
        </p>
        """

    body = f"""
    <p style="color:#444;line-height:1.6;margin:0 0 16px;">{intro}</p>
    {status_line}
    {_report_details_block(report)}
    {resolution_block}
    {cta}
    """
    html = _email_wrapper(title, body, accent=accent)
    text = (
        f"Dear {citizen.full_name},\n\n"
        f"Report {report.report_number}: {report.title}\n"
        f"New status: {label}\n"
        + (f"Resolution: {report.resolution_notes}\n" if report.resolution_notes else "")
    )
    return send_email(citizen.email, subject, html, text)


def send_official_feedback_email(citizen: User, report: Report, message: str) -> bool:
    track_url = f"{settings.FRONTEND_URL}/citizen/reports/{report.id}"
    body = f"""
    <p style="color:#444;line-height:1.6;margin:0 0 16px;">
      Dear <strong>{citizen.full_name}</strong>,<br><br>
      The District Commissioner&apos;s Office has sent feedback on your report:
    </p>
    <div style="background:#fffbeb;border-left:4px solid #D4A017;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;color:#92400e;">{message}</p>
    </div>
    {_report_details_block(report)}
    {_cta_button(track_url, "View Full Report")}
    """
    html = _email_wrapper("Government Feedback on Your Report", body, accent="#92400e")
    text = (
        f"Dear {citizen.full_name},\n\n"
        f"Feedback on {report.report_number}:\n{message}\n\n"
        f"View: {track_url}\n"
    )
    return send_email(citizen.email, f"Government Feedback — {report.report_number}", html, text)
