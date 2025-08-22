import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import os
from datetime import datetime
import logging

# Email Configuration
EMAIL_USER = "iinsaftest@gmail.com"
EMAIL_PASS = "clst vane mhrt tcio"
EMAIL_SERVICE = "gmail"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self):
        self.email_user = EMAIL_USER
        self.email_pass = EMAIL_PASS
        self.smtp_server = SMTP_SERVER
        self.smtp_port = SMTP_PORT
        
    def create_connection(self):
        """Create SMTP connection"""
        try:
            # Create SSL context
            context = ssl.create_default_context()
            
            # Create SMTP connection
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls(context=context)
            
            # Login to the server
            server.login(self.email_user, self.email_pass)
            
            logger.info("SMTP connection established successfully")
            return server
            
        except Exception as e:
            logger.error(f"Failed to create SMTP connection: {str(e)}")
            raise e
    
    def send_simple_email(self, to_email, subject, body, is_html=False):
        """Send a simple email"""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = self.email_user
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add body
            if is_html:
                part = MIMEText(body, "html")
            else:
                part = MIMEText(body, "plain")
            
            message.attach(part)
            
            # Create connection and send
            server = self.create_connection()
            server.send_message(message)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False
    
    def send_welcome_email(self, to_email, username):
        """Send welcome email to new user"""
        subject = "Welcome to WhatsApp Analytics Dashboard"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 28px;">Welcome to WhatsApp Analytics</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been successfully created</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #25D366; margin-top: 0;">Hi {username}!</h2>
                    
                    <p>Welcome to the WhatsApp Analytics Dashboard! We're excited to have you on board.</p>
                    
                    <p>Your account has been successfully created and you can now:</p>
                    
                    <ul style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #25D366;">
                        <li>📊 Access detailed analytics and insights</li>
                        <li>📈 View message statistics and trends</li>
                        <li>👥 Analyze group performance</li>
                        <li>📱 Monitor WhatsApp group activities</li>
                        <li>📋 Generate comprehensive reports</li>
                    </ul>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1976d2; margin-top: 0;">Getting Started</h3>
                        <p>To get started with your dashboard:</p>
                        <ol>
                            <li>Log in to your account</li>
                            <li>Explore the dashboard overview</li>
                            <li>Upload your WhatsApp data</li>
                            <li>Start analyzing your insights</li>
                        </ol>
                    </div>
                    
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    
                    <p style="margin-top: 30px;">
                        <strong>Best regards,</strong><br>
                        WhatsApp Analytics Team
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                    <p>This email was sent from WhatsApp Analytics Dashboard</p>
                    <p>© 2025 WhatsApp Analytics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_simple_email(to_email, subject, html_body, is_html=True)
    
    def send_notification_email(self, to_email, subject, message, notification_type="info"):
        """Send notification email"""
        # Color mapping for different notification types
        colors = {
            "success": "#28a745",
            "warning": "#ffc107", 
            "error": "#dc3545",
            "info": "#17a2b8"
        }
        
        color = colors.get(notification_type, "#17a2b8")
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, {color} 0%, {color}dd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">WhatsApp Analytics Notification</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">{subject}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                    <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid {color};">
                        {message}
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 14px;">
                        This is an automated notification from WhatsApp Analytics Dashboard.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                    <p>© 2025 WhatsApp Analytics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_simple_email(to_email, subject, html_body, is_html=True)
    
    def send_test_email(self, to_email="rahulverma9466105@gmail.com"):
        """Send test email"""
        subject = "Test Email from WhatsApp Analytics Dashboard"
        body = f"""
        Hi there!
        
        This is a test email from the WhatsApp Analytics Dashboard.
        
        Email Details:
        - From: {self.email_user}
        - To: {to_email}
        - Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        - Service: {EMAIL_SERVICE}
        
        If you're receiving this email, it means the SMTP configuration is working correctly!
        
        Best regards,
        WhatsApp Analytics Team
        """
        
        return self.send_simple_email(to_email, subject, body)
    
    def send_user_registration_notification(self, to_email, username):
        """Send notification when new user registers"""
        subject = "New User Registration - WhatsApp Analytics"
        message = f"""
        <h3 style="color: #25D366; margin-top: 0;">New User Registration</h3>
        <p>A new user has registered for the WhatsApp Analytics Dashboard:</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Username:</strong> {username}</p>
            <p><strong>Email:</strong> {to_email}</p>
            <p><strong>Registration Time:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <p>The user account has been created successfully and they can now access the dashboard.</p>
        """
        
        return self.send_notification_email(to_email, subject, message, "success")

# Global email sender instance
email_sender = EmailSender()

# Convenience functions
def send_welcome_email(to_email, username):
    """Send welcome email to new user"""
    return email_sender.send_welcome_email(to_email, username)

def send_notification_email(to_email, subject, message, notification_type="info"):
    """Send notification email"""
    return email_sender.send_notification_email(to_email, subject, message, notification_type)



def send_user_registration_notification(to_email, username):
    """Send notification when new user registers"""
    return email_sender.send_user_registration_notification(to_email, username)

def send_new_post_notification_to_all_emails(post_data):
    """Send notification to all emails in email.csv when a new post is sent"""
    return send_new_post_notification_to_all(post_data)

def test_new_post_notification():
    """Test function to send a sample new post notification to all emails"""
    test_post_data = {
        'title': 'Test Post - WhatsApp Analytics',
        'sent_date': '2025-01-20',
        'sent_time': '14:30:00',
        'assembly_name': 'TarnTaran G1',
        'group_count': 25,
        'username': 'test_user',
        'post_id': 'TEST_12345',
        'message': 'This is a test message to verify the email notification system is working correctly.',
        'media_files': 'Image, Audio',
        'groups_reached': 24,
        'delivery_time': '2 minutes'
    }
    
    logger.info("Sending test new post notification to all emails...")
    result = send_new_post_notification_to_all_emails(test_post_data)
    
    if result:
        logger.info("Test new post notification sent successfully!")
    else:
        logger.error("Failed to send test new post notification")
    
    return result

def send_post_scheduled_notification(user_email, username, post_data):
    """Send notification when a post is scheduled successfully"""
    subject = "Post Scheduled Successfully - WhatsApp Analytics"
    
    # Format scheduled date and time
    scheduled_datetime = f"{post_data['scheduled_date']} at {post_data['scheduled_time']}"
    
    message = f"""
    <h3 style="color: #25D366; margin-top: 0;">Post Scheduled Successfully!</h3>
    <p>Hi {username}, your post has been scheduled successfully. Here are the details:</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Post Title:</strong> {post_data['title']}</p>
        <p><strong>Scheduled Date & Time:</strong> {scheduled_datetime}</p>
        <p><strong>Assembly:</strong> {post_data['assembly_name']}</p>
        <p><strong>Target Groups:</strong> {post_data['group_count']} groups</p>
        <p><strong>Message:</strong> {post_data['message_preview']}</p>
        <p><strong>Media Files:</strong> {post_data['media_files']}</p>
    </div>
    
    <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <h4 style="color: #1976d2; margin-top: 0;">What happens next?</h4>
        <ul>
            <li>Your post will be automatically sent to the selected WhatsApp groups</li>
            <li>You can track the status from your dashboard</li>
            <li>You'll receive a notification when the post is completed</li>
        </ul>
    </div>
    
    <p>Thank you for using WhatsApp Analytics Dashboard!</p>
    """
    
    return email_sender.send_notification_email(user_email, subject, message, "success")

def send_admin_post_notification(admin_email, post_data):
    """Send notification to admin when a new post is scheduled"""
    subject = "New Post Scheduled - WhatsApp Analytics"
    
    scheduled_datetime = f"{post_data['scheduled_date']} at {post_data['scheduled_time']}"
    
    message = f"""
    <h3 style="color: #25D366; margin-top: 0;">New Post Scheduled</h3>
    <p>A new post has been scheduled by a user in the system:</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>User:</strong> {post_data['username']} ({post_data['user_email']})</p>
        <p><strong>Post Title:</strong> {post_data['title']}</p>
        <p><strong>Scheduled Date & Time:</strong> {scheduled_datetime}</p>
        <p><strong>Assembly:</strong> {post_data['assembly_name']}</p>
        <p><strong>Target Groups:</strong> {post_data['group_count']} groups</p>
        <p><strong>Post ID:</strong> {post_data['post_id']}</p>
        <p><strong>Media Files:</strong> {post_data['media_files']}</p>
    </div>
    
    <p>You can monitor this post from the admin dashboard and track its progress.</p>
    """
    
    return email_sender.send_notification_email(admin_email, subject, message, "info")

def send_post_status_notification(user_email, username, post_data, status):
    """Send notification when post status changes"""
    status_configs = {
        'completed': {
            'subject': 'Post Completed Successfully - WhatsApp Analytics',
            'color': '#28a745',
            'title': 'Post Completed Successfully!',
            'message': f'Hi {username}, your scheduled post has been completed successfully.',
            'status_text': 'COMPLETED',
            'additional_info': 'Your post has been successfully sent to all target WhatsApp groups.',
            'notification_type': 'success'
        },
        'failed': {
            'subject': 'Post Failed - WhatsApp Analytics',
            'color': '#dc3545',
            'title': 'Post Failed',
            'message': f'Hi {username}, your scheduled post has failed to send.',
            'status_text': 'FAILED',
            'additional_info': 'Please contact support if you need assistance with this issue.',
            'notification_type': 'error'
        },
        'cancelled': {
            'subject': 'Post Cancelled - WhatsApp Analytics',
            'color': '#ffc107',
            'title': 'Post Cancelled',
            'message': f'Hi {username}, your scheduled post has been cancelled.',
            'status_text': 'CANCELLED',
            'additional_info': 'You can create a new post if needed.',
            'notification_type': 'warning'
        }
    }
    
    config = status_configs.get(status)
    if not config:
        return False
    
    message = f"""
    <h3 style="color: {config['color']}; margin-top: 0;">{config['title']}</h3>
    <p>{config['message']}</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>Post Title:</strong> {post_data['title']}</p>
        <p><strong>Assembly:</strong> {post_data['assembly_name']}</p>
        <p><strong>Completed At:</strong> {post_data.get('completed_at', 'N/A')}</p>
        <p><strong>Status:</strong> <span style="color: {config['color']}; font-weight: bold;">{config['status_text']}</span></p>
        <p><strong>Admin Notes:</strong> {post_data.get('admin_notes', 'No additional notes')}</p>
    </div>
    
    <p>{config['additional_info']}</p>
    """
    
    return email_sender.send_notification_email(user_email, config['subject'], message, config['notification_type'])

def send_admin_post_failed_notification(admin_email, post_data):
    """Send notification to admin when a post fails"""
    subject = f"Post Failed - {post_data['title']}"
    
    message = f"""
    <h3 style="color: #dc3545; margin-top: 0;">Post Failed</h3>
    <p>A scheduled post has failed to send:</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p><strong>User:</strong> {post_data['username']} ({post_data['user_email']})</p>
        <p><strong>Post Title:</strong> {post_data['title']}</p>
        <p><strong>Post ID:</strong> {post_data['post_id']}</p>
        <p><strong>Assembly:</strong> {post_data['assembly_name']}</p>
        <p><strong>Admin Notes:</strong> {post_data.get('admin_notes', 'No additional notes')}</p>
    </div>
    
    <p>Please review and take necessary action.</p>
    """
    
    return email_sender.send_notification_email(admin_email, subject, message, "error")

def send_login_alert_email(username, role, login_time, ip_address=None):
    """Send an alert email when a user or admin logs in"""
    to_email = "rahul9466727218verma@gmail.com"
    subject = f"Login Alert: {username} ({role}) logged in"
    message = f"""
    <h3 style='color: #1976d2; margin-top: 0;'>Login Alert</h3>
    <p>User <strong>{username}</strong> with role <strong>{role}</strong> has logged in to the WhatsApp Analytics Dashboard.</p>
    <div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;'>
        <p><strong>Username:</strong> {username}</p>
        <p><strong>Role:</strong> {role}</p>
        <p><strong>Login Time:</strong> {login_time}</p>
        {f'<p><strong>IP Address:</strong> {ip_address}</p>' if ip_address else ''}
    </div>
    <p>This is an automated alert for security purposes.</p>
    """
    return email_sender.send_notification_email(to_email, subject, message, "info")

def get_all_emails_from_csv():
    """Read all email addresses from email.csv file"""
    try:
        emails = []
        with open('email.csv', 'r') as file:
            for line in file:
                email = line.strip()
                if email and '@' in email:  # Basic email validation
                    emails.append(email)
        logger.info(f"Loaded {len(emails)} email addresses from email.csv")
        return emails
    except FileNotFoundError:
        logger.error("email.csv file not found")
        return []
    except Exception as e:
        logger.error(f"Error reading email.csv: {str(e)}")
        return []

def send_new_post_notification_to_all(post_data):
    """Send notification to all emails in email.csv when a new post is sent"""
    emails = get_all_emails_from_csv()
    
    if not emails:
        logger.warning("No email addresses found in email.csv")
        return False
    
    subject = f"New Post Sent: {post_data.get('title', 'Untitled Post')}"
    
    # Format the post details
    sent_datetime = f"{post_data.get('sent_date', 'N/A')} at {post_data.get('sent_time', 'N/A')}"
    message_preview = post_data.get('message', '')[:100] + "..." if len(post_data.get('message', '')) > 100 else post_data.get('message', '')
    
    message = f"""
    <h3 style="color: #25D366; margin-top: 0;">New Post Sent Successfully!</h3>
    <p>A new post has been sent to WhatsApp groups. Here are the details:</p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #25D366; margin-top: 0;">Post Information</h4>
        <p><strong>Title:</strong> {post_data.get('title', 'Untitled Post')}</p>
        <p><strong>Sent Date & Time:</strong> {sent_datetime}</p>
        <p><strong>Assembly:</strong> {post_data.get('assembly_name', 'N/A')}</p>
        <p><strong>Target Groups:</strong> {post_data.get('group_count', 0)} groups</p>
        <p><strong>Sent By:</strong> {post_data.get('username', 'Unknown User')}</p>
        <p><strong>Post ID:</strong> {post_data.get('post_id', 'N/A')}</p>
    </div>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #1976d2; margin-top: 0;">Message Preview</h4>
        <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #25D366;">
            <p style="margin: 0; font-style: italic;">{message_preview}</p>
        </div>
    </div>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #856404; margin-top: 0;">Media Files</h4>
        <p><strong>Attached Files:</strong> {post_data.get('media_files', 'No media files')}</p>
    </div>
    
    <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #155724; margin-top: 0;">Delivery Status</h4>
        <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">SENT SUCCESSFULLY</span></p>
        <p><strong>Groups Reached:</strong> {post_data.get('groups_reached', 0)} out of {post_data.get('group_count', 0)}</p>
        <p><strong>Delivery Time:</strong> {post_data.get('delivery_time', 'N/A')}</p>
    </div>
    
    <p style="margin-top: 30px; color: #666; font-size: 14px;">
        This is an automated notification from WhatsApp Analytics Dashboard.
        You can view detailed analytics and reports from your dashboard.
    </p>
    """
    
    # Send to all emails
    success_count = 0
    failed_count = 0
    
    for email in emails:
        try:
            result = email_sender.send_notification_email(email, subject, message, "success")
            if result:
                success_count += 1
                logger.info(f"New post notification sent successfully to {email}")
            else:
                failed_count += 1
                logger.error(f"Failed to send new post notification to {email}")
        except Exception as e:
            failed_count += 1
            logger.error(f"Exception while sending new post notification to {email}: {str(e)}")
    
    logger.info(f"New post notification sent to {success_count} emails, failed for {failed_count} emails")
    return success_count > 0

def send_post_sent_notification_to_all(post_data):
    """Alternative function name for sending post sent notifications to all emails"""
    return send_new_post_notification_to_all(post_data)
