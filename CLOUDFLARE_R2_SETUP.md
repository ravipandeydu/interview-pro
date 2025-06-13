# Cloudflare R2 Setup Guide

This guide will help you set up Cloudflare R2 for file storage in your Node.js application.

## Prerequisites

- A Cloudflare account
- Access to Cloudflare R2 (may require a paid plan)

## Step 1: Create an R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage** in the sidebar
3. Click **Create bucket**
4. Choose a unique bucket name (e.g., `my-app-uploads`)
5. Select your preferred location
6. Click **Create bucket**

## Step 2: Generate API Tokens

1. In the R2 dashboard, click **Manage R2 API tokens**
2. Click **Create API token**
3. Give your token a name (e.g., `My App Upload Token`)
4. Set permissions:
   - **Object:Edit** for your bucket
   - **Object:Read** for your bucket (if you want to read files)
5. Click **Create API token**
6. Copy the **Access Key ID** and **Secret Access Key**

## Step 3: Set Up Custom Domain (Optional but Recommended)

1. In your bucket settings, go to **Settings** > **Custom Domains**
2. Click **Connect Domain**
3. Enter your custom domain (e.g., `cdn.yourdomain.com`)
4. Follow the DNS setup instructions
5. Wait for the domain to be verified

## Step 4: Configure Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_PUBLIC_URL=https://your-custom-domain.com
```

### Finding Your Account ID and Endpoint

1. Your **Account ID** can be found in the right sidebar of your Cloudflare dashboard
2. Your **Endpoint** will be: `https://your-account-id.r2.cloudflarestorage.com`
3. If you set up a custom domain, use that for **CLOUDFLARE_R2_PUBLIC_URL**
4. If you don't have a custom domain, you can use the R2.dev subdomain: `https://pub-your-bucket-id.r2.dev`

## Step 5: Test the Configuration

1. Restart your application
2. Try uploading an avatar through the profile page
3. Check your R2 bucket to see if the file was uploaded
4. Verify that the avatar displays correctly in the UI

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Check that your API token has the correct permissions
   - Verify that the bucket name is correct
   - Ensure the endpoint URL is correct

2. **CORS Issues**
   - If you're accessing files directly from the browser, you may need to configure CORS settings in your R2 bucket
   - Go to your bucket settings and add CORS rules if needed

3. **Files Not Accessible**
   - Make sure your custom domain is properly configured
   - Check that the bucket allows public access for the files you want to be publicly accessible

### Security Best Practices

1. **Use Environment Variables**: Never commit your API keys to version control
2. **Limit Token Permissions**: Only grant the minimum permissions needed
3. **Use Custom Domains**: This gives you more control over your URLs
4. **Enable Access Logs**: Monitor who is accessing your files
5. **Set Up Lifecycle Rules**: Automatically delete old or unused files

## Cost Considerations

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015 per GB per month
- **Class A Operations** (writes): $4.50 per million requests
- **Class B Operations** (reads): $0.36 per million requests
- **Egress**: Free (this is a major advantage over AWS S3)

## Migration from Local Storage

If you were previously using local file storage:

1. The application will now store new uploads in R2
2. Existing local files will continue to work until you migrate them
3. To migrate existing files, you'll need to:
   - Upload them to R2
   - Update the database records with the new URLs
   - Remove the old local files

## Support

For more information, refer to:
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS SDK for JavaScript v3 Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)