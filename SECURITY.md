# Security Policy

## Supported Versions

Currently, we support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please DO NOT open a public issue for security vulnerabilities.**

Instead, report security issues via:

1. **GitHub Security Advisories** (Preferred)
   - Go to the [Security tab](https://github.com/Krosebrook/AetherAgentsOS/security)
   - Click "Report a vulnerability"
   - Fill out the form with detailed information

2. **Email** (Alternative)
   - Send an email to the repository maintainer
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include

Please provide as much information as possible:

- **Type of vulnerability** (e.g., XSS, API key exposure, injection)
- **Location** (file name, line number, or URL)
- **Step-by-step reproduction** instructions
- **Impact** assessment (what could an attacker do?)
- **Suggested fix** (if you have one)
- **Your contact information** (for follow-up questions)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 1 week
- **Resolution Timeline**: Varies by severity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium: 30-60 days
  - Low: 60-90 days

### Disclosure Policy

- We will coordinate disclosure with you
- Security fixes will be released as soon as possible
- A security advisory will be published after the fix is deployed
- You will be credited for the discovery (unless you prefer to remain anonymous)

## Security Best Practices for Users

### API Key Management

**❌ Never:**
- Commit API keys to version control
- Share API keys publicly
- Use production keys in development
- Store API keys in localStorage or IndexedDB

**✅ Always:**
- Use environment variables for API keys
- Rotate API keys regularly
- Use API key restrictions (IP, referrer, API)
- Set up usage quotas and alerts

**For Development:**
```bash
# Create .env file (never commit this)
VITE_GEMINI_API_KEY=your_api_key_here
```

**For Production:**
- Use environment variables provided by your hosting platform
- Configure API key restrictions in Google AI Studio
- Monitor API usage regularly

### Content Security Policy

When deploying to production, set appropriate Content Security Policy headers:

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://generativelanguage.googleapis.com;
  font-src 'self';
```

### HTTPS

Always deploy the application over HTTPS:
- Prevents man-in-the-middle attacks
- Required for PWA features
- Protects API keys in transit

### Input Validation

- All user inputs should be sanitized
- Validate data before sending to APIs
- Implement rate limiting for API calls
- Use proper TypeScript types to catch issues early

### Dependencies

- Keep dependencies up to date
- Use `npm audit` regularly
- Review dependency changes before updating
- Use lock files (`package-lock.json`)

### Service Worker

- Keep service worker code minimal
- Don't cache sensitive data
- Implement proper cache versioning
- Clear caches on major updates

## Known Security Considerations

### API Key Storage

Currently, API keys are stored in:
- Environment variables (server-side) ✅ Safe
- React Context (memory only) ✅ Safe
- User can input via UI (memory only) ✅ Safe

**Not stored in:**
- localStorage ✅ Good
- IndexedDB ✅ Good
- Cookies ✅ Good

### Third-Party Dependencies

We use the following third-party services:
- **Google Gemini API**: For AI agent functionality
  - Requires API key
  - All data sent to Google's servers
  - Follow Google's data usage policies

### PWA Considerations

- Service worker can cache responses
- Be cautious about what gets cached
- Clear cache on sensitive data

## Security Updates

Security updates are released as:
- **Patch releases** for minor security fixes
- **Minor releases** for moderate security fixes
- **Immediate patches** for critical vulnerabilities

Subscribe to:
- GitHub Security Advisories
- Repository releases
- Watch the repository for updates

## Security Checklist for Contributions

When contributing code, ensure:

- [ ] No hardcoded API keys or secrets
- [ ] Input validation on all user inputs
- [ ] Proper error handling (no stack traces exposed)
- [ ] TypeScript types used (no `any`)
- [ ] No eval() or similar dangerous functions
- [ ] Secure API calls (HTTPS only)
- [ ] Dependencies are up to date
- [ ] No console.log of sensitive data

## Scope

This security policy applies to:
- The Aether Agentic IDE application code
- Official deployments and releases
- Documentation and examples

Out of scope:
- Third-party services (Google Gemini API)
- User's deployment configurations
- Browser vulnerabilities
- User's own API key management

## Questions?

If you have questions about security that don't involve reporting a vulnerability:
- Open a discussion in GitHub Discussions
- Review our security documentation
- Check existing security advisories

Thank you for helping keep Aether Agentic IDE secure! 🔒
