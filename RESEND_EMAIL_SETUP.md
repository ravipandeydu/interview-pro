# Resend Email Service Setup Guide

This guide will help you set up Resend email service for your Node.js + Next.js application.

## Prerequisites

- A Resend account (sign up at [resend.com](https://resend.com))
- A verified domain (optional but recommended for production)

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up for an account
2. Verify your email address
3. Complete the onboarding process

## Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "Production API Key" or "Development API Key")
5. Select the appropriate permissions:
   - **Send emails**: Required for sending emails
   - **Domain management**: Optional, for managing domains
6. Copy the generated API key (it will only be shown once)

## Step 3: Configure Environment Variables

### Backend Configuration

Add the following environment variables to your backend `.env` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name
```

### Environment Variables Explanation

- `RESEND_API_KEY`: Your Resend API key from Step 2
- `FROM_EMAIL`: The email address that will appear as the sender
- `FROM_NAME`: The name that will appear as the sender

## Step 4: Domain Setup (Recommended for Production)

### Option A: Use Resend's Default Domain (Development)

For development and testing, you can use Resend's default domain:
- Set `FROM_EMAIL=onboarding@resend.dev`
- This allows you to send emails immediately without domain verification
- Limited to 100 emails per day

### Option B: Add Your Own Domain (Production)

1. In your Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the required DNS records to your domain provider:
   - **SPF Record**: Add to your DNS
   - **DKIM Record**: Add to your DNS
   - **DMARC Record**: Add to your DNS (optional but recommended)
5. Wait for DNS propagation (can take up to 48 hours)
6. Verify the domain in your Resend dashboard
7. Update `FROM_EMAIL` to use your verified domain (e.g., `noreply@yourdomain.com`)

## Step 5: Test Email Functionality

### Start the Backend Server

```bash
cd backend
npm run dev
```

### Test Registration Email

1. Go to your frontend application
2. Register a new user account
3. Check that you receive a welcome email

### Test Forgot Password Email

1. Go to the login page
2. Click "Forgot your password?"
3. Enter your email address
4. Check that you receive a password reset email

## Email Templates

The application includes the following email templates:

### Welcome Email
- Sent when a user registers
- Includes a verification link (if email verification is enabled)
- Contains a login button

### Password Reset Email
- Sent when a user requests a password reset
- Includes a secure reset link that expires in 10 minutes
- Contains clear instructions

### Email Verification
- Sent to verify user email addresses
- Includes a verification link
- Helps prevent spam and ensures deliverability

## Customization

### Modify Email Templates

Email templates are defined in `backend/src/services/email.service.js`. You can customize:

- HTML content and styling
- Email subject lines
- Sender information
- Template variables

### Add New Email Types

To add new email types:

1. Add a new function to `email.service.js`
2. Create the HTML template
3. Call the function from your controllers or services

## Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify the API key is correct
   - Check that it hasn't expired
   - Ensure it has the right permissions

2. **Emails Not Sending**
   - Check the server logs for error messages
   - Verify the `FROM_EMAIL` is correct
   - Ensure your domain is verified (if using custom domain)

3. **Emails Going to Spam**
   - Set up SPF, DKIM, and DMARC records
   - Use a verified domain
   - Avoid spam trigger words in subject lines

4. **Rate Limiting**
   - Resend has rate limits based on your plan
   - Check your dashboard for usage statistics
   - Consider upgrading your plan if needed

### Debug Mode

To enable debug logging, set the log level in your backend configuration:

```env
LOG_LEVEL=debug
```

This will show detailed email sending logs in your console.

## Production Considerations

### Security

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use different API keys for development and production

### Monitoring

- Monitor email delivery rates in the Resend dashboard
- Set up alerts for failed email deliveries
- Track email engagement metrics

### Scaling

- Consider your email volume and choose the appropriate Resend plan
- Implement email queuing for high-volume applications
- Use email templates for consistent branding

## Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: Available through their dashboard
- **Community**: Join the Resend Discord community

## Next Steps

1. Set up your Resend account and API key
2. Configure your environment variables
3. Test the email functionality
4. Customize email templates to match your brand
5. Set up domain verification for production
6. Monitor email delivery and engagement

Your email integration is now complete! Users will receive welcome emails upon registration and can reset their passwords via email.