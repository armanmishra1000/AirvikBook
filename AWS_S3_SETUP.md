# AWS S3 Setup Guide for AirVikBook Hotel Management System

## Overview
This guide will help you set up AWS S3 for file storage in your Hotel Management System. AWS S3 provides scalable, secure, and cost-effective cloud storage for your hotel's images, documents, and other files.

## AWS Free Tier Benefits
- **5 GB of storage** (Standard storage class)
- **20,000 GET requests** per month
- **2,000 PUT requests** per month
- **15 GB of data transfer out** per month
- **Valid for 12 months** from account creation

## Step 1: Create AWS Account

1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Fill in your details and verify your email
4. Add a credit card (required, but won't be charged during free tier)
5. Complete the account setup

## Step 2: Create S3 Bucket

1. **Login to AWS Console**
   - Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
   - Sign in with your AWS account

2. **Create Bucket**
   - Click "Create bucket"
   - Enter bucket name: `airvikbook-uploads-[your-unique-suffix]`
   - Choose region: `us-east-1` (or your preferred region)
   - Keep default settings for now

3. **Configure Bucket Settings**
   ```
   Bucket name: airvikbook-uploads-[your-unique-suffix]
   Region: us-east-1
   Block Public Access: Uncheck "Block all public access"
   Bucket Versioning: Disabled
   Tags: Add tags for organization (optional)
   ```

4. **Configure CORS (Cross-Origin Resource Sharing)**
   - Go to your bucket → Permissions → CORS
   - Add this CORS configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"]
     }
   ]
   ```

## Step 3: Create IAM User for S3 Access

1. **Go to IAM Console**
   - Navigate to [IAM Console](https://console.aws.amazon.com/iam/)
   - Click "Users" → "Create user"

2. **Create User**
   ```
   User name: airvikbook-s3-user
   Access type: Programmatic access
   ```

3. **Attach Permissions**
   - Click "Attach existing policies directly"
   - Search for "AmazonS3FullAccess"
   - Select it and continue

4. **Review and Create**
   - Review the settings
   - Click "Create user"

5. **Save Credentials**
   - **IMPORTANT**: Download the CSV file with Access Key ID and Secret Access Key
   - Store these securely - you won't be able to see the Secret Access Key again

## Step 4: Configure Environment Variables

1. **Copy Environment File**
   ```bash
   cp env.example.txt .env
   ```

2. **Update .env with AWS Credentials**
   ```env
   # Storage Configuration
   STORAGE_TYPE=s3
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your-access-key-id-from-iam-user
   AWS_SECRET_ACCESS_KEY=your-secret-access-key-from-iam-user
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=airvikbook-uploads-[your-unique-suffix]
   ```

## Step 5: Test S3 Integration

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Test Upload (Optional)**
   - Start your backend server
   - Try uploading a profile picture
   - Check if it appears in your S3 bucket

## Step 6: Security Best Practices

### 1. Bucket Policy (Optional but Recommended)
Add this bucket policy to restrict access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 2. IAM Policy (More Secure)
Instead of full S3 access, create a custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

## Step 7: Cost Monitoring

1. **Set Up Billing Alerts**
   - Go to [AWS Billing Console](https://console.aws.amazon.com/billing/)
   - Set up billing alerts to avoid unexpected charges
   - Recommended: Set alert at $5, $10, $20

2. **Monitor Usage**
   - Check S3 usage in AWS Console
   - Monitor data transfer costs
   - Review monthly billing reports

## Step 8: Backup Strategy

### 1. Enable Versioning (Optional)
- Go to bucket → Properties → Bucket Versioning
- Enable versioning for file recovery

### 2. Lifecycle Rules (Optional)
- Go to bucket → Management → Lifecycle
- Set rules to move old files to cheaper storage classes
- Example: Move files older than 30 days to IA (Infrequent Access)

## Troubleshooting

### Common Issues:

1. **Access Denied Error**
   - Check IAM user permissions
   - Verify bucket name and region
   - Ensure credentials are correct

2. **CORS Errors**
   - Verify CORS configuration in bucket
   - Check allowed origins match your domain

3. **File Upload Fails**
   - Check file size limits
   - Verify file format is allowed
   - Check network connectivity

4. **High Costs**
   - Monitor data transfer
   - Check for unnecessary API calls
   - Review storage class usage

## Migration from Local Storage

If you're migrating from local storage to S3:

1. **Backup existing files**
2. **Upload files to S3**
3. **Update database URLs**
4. **Test thoroughly**
5. **Switch STORAGE_TYPE to 's3'**

## Support

- **AWS Documentation**: [S3 Developer Guide](https://docs.aws.amazon.com/s3/)
- **AWS Support**: Available with paid plans
- **Community**: AWS Forums and Stack Overflow

## Cost Estimation

### Free Tier (First 12 months):
- Storage: 5 GB free
- Requests: 20,000 GET + 2,000 PUT free
- Transfer: 15 GB out free
- **Total: $0/month**

### After Free Tier (Typical hotel usage):
- Storage: ~1-5 GB = $0.023-0.115/month
- Requests: ~10,000/month = $0.40/month
- Transfer: ~5 GB/month = $0.45/month
- **Total: ~$1-2/month**

## Next Steps

1. **Test the integration** with your application
2. **Monitor costs** and usage
3. **Implement backup strategies**
4. **Consider CDN** for better performance
5. **Set up monitoring** and alerts

---

**Note**: Keep your AWS credentials secure and never commit them to version control. Use environment variables and consider using AWS IAM roles for production deployments.
