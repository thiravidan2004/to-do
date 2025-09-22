# Deployment Guide - Multi-Tenant Todo API

## Prerequisites

1. **Supabase Project** - Set up and configured
2. **Vercel Account** - For deployment
3. **Environment Variables** - Properly configured

## Step 1: Database Setup

1. **Run the SQL Setup Script**
   - Open your Supabase SQL Editor
   - Copy and paste the contents of `SUPABASE_API_SETUP.sql`
   - Execute the script to create tables and policies

2. **Verify Database Structure**
   ```sql
   -- Check if tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('companies', 'tasks');
   
   -- Check if company_id column was added to tasks
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'tasks' AND column_name = 'company_id';
   ```

## Step 2: Environment Variables

Create a `.env.local` file with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin API Key (generate a secure random string)
ADMIN_API_KEY=admin_your_secure_admin_key_here_123456789

# Optional: Database URL for direct connections
DATABASE_URL=your_supabase_database_url
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add ADMIN_API_KEY
   ```

### Option B: Deploy via GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add multi-tenant API"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in project settings

## Step 4: Create Your First Company

After deployment, create a test company:

```bash
curl -X POST "https://your-app.vercel.app/api/v1/companies" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your_admin_api_key" \
  -d '{
    "name": "Test Company"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "company-uuid",
    "name": "Test Company",
    "api_key": "tk_generated_api_key_here",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "message": "Company created successfully. Save the API key securely - it cannot be retrieved again."
}
```

**⚠️ Important**: Save the API key immediately - it cannot be retrieved later!

## Step 5: Test Your API

1. **Check API Status**
   ```bash
   curl "https://your-app.vercel.app/api/v1/status"
   ```

2. **Test Authentication**
   ```bash
   curl -X GET "https://your-app.vercel.app/api/v1/tasks" \
     -H "x-api-key: tk_your_company_api_key"
   ```

3. **Create a Test Task**
   ```bash
   curl -X POST "https://your-app.vercel.app/api/v1/tasks" \
     -H "Content-Type: application/json" \
     -H "x-api-key: tk_your_company_api_key" \
     -d '{
       "title": "API Test Task",
       "description": "Testing the deployed API"
     }'
   ```

## Step 6: Domain Configuration (Optional)

If you want a custom domain:

1. **Add Domain in Vercel**
   - Go to your project settings
   - Add your custom domain
   - Configure DNS records

2. **Update Documentation**
   - Update base URLs in API documentation
   - Update any hardcoded URLs in your code

## Step 7: Monitoring and Maintenance

### API Monitoring
- Monitor `/api/v1/status` endpoint
- Set up alerts for high error rates
- Monitor rate limit usage

### Database Monitoring
- Monitor Supabase dashboard for usage
- Check for slow queries
- Monitor storage usage

### Security Checklist
- [ ] Environment variables are secure
- [ ] Admin API key is complex and secure
- [ ] Rate limiting is working
- [ ] API keys are properly validated
- [ ] Company data isolation is working

## Step 8: Provide API Access to Companies

When a company wants to integrate:

1. **Create Company Account**
   ```bash
   curl -X POST "https://your-app.vercel.app/api/v1/companies" \
     -H "Content-Type: application/json" \
     -H "x-admin-key: your_admin_key" \
     -d '{"name": "Client Company Name"}'
   ```

2. **Provide Integration Package**
   - API key (securely)
   - API documentation
   - Code examples
   - Support contact

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check Supabase project status
   - Verify environment variables
   - Check RLS policies

2. **API Key Not Working**
   - Verify API key format (should start with 'tk_')
   - Check if company exists in database
   - Verify header format

3. **Rate Limiting Issues**
   - Check if rate limits are too restrictive
   - Monitor rate limit headers in responses

4. **CORS Issues**
   - Add proper CORS headers if needed
   - Check if requests are from allowed origins

### Logs and Debugging
- Check Vercel function logs
- Monitor Supabase logs
- Use API status endpoint for health checks

## Production Recommendations

1. **Security**
   - Use HTTPS only
   - Implement proper logging
   - Regular security audits

2. **Performance**
   - Enable caching where appropriate
   - Monitor response times
   - Optimize database queries

3. **Scalability**
   - Consider Redis for rate limiting
   - Monitor resource usage
   - Plan for database scaling

4. **Backup**
   - Regular database backups
   - Environment variable backups
   - Documentation updates

## Support

For deployment issues or questions:
- Check Vercel deployment logs
- Review Supabase project health
- Test API endpoints systematically
- Contact development team if needed
