# Session Management Testing Guide

## Overview
This guide provides comprehensive testing instructions for the session management fixes implemented in the AirVik application.

## ✅ Backend Testing Results

### Service Verification
- ✅ SessionManagementService properly exported
- ✅ JwtService properly exported
- ✅ All required methods available
- ✅ Method signatures correct
- ✅ Error handling in place

### Build Status
- ✅ Backend builds successfully without errors
- ✅ Frontend builds successfully (warnings are unrelated)

## 🧪 Manual Testing Instructions

### Prerequisites
1. Start the backend server
2. Start the frontend development server
3. Have multiple browsers/devices ready for testing

### Test Scenario 1: Multi-Device Login

#### Steps:
1. **Login on Device 1** (e.g., Chrome)
   - Navigate to the login page
   - Login with valid credentials
   - Verify successful login

2. **Login on Device 2** (e.g., Firefox)
   - Open a different browser or device
   - Login with the same account
   - Verify successful login

3. **Check Active Sessions**
   - On Device 1, navigate to Account → Security
   - Look for "Active Sessions" section
   - Verify both sessions are displayed
   - Verify current session is marked as "Current"

### Test Scenario 2: Logout All Devices

#### Steps:
1. **Verify Multiple Sessions**
   - Ensure you have at least 2 active sessions
   - Navigate to Account → Security

2. **Click "Logout All Devices"**
   - Click the "Logout All Devices" button
   - Confirm the action in the dialog

3. **Verify Logout**
   - Check that you're logged out on the current device
   - Try to access the same account on Device 2
   - Verify Device 2 is also logged out
   - Try to access protected pages - should redirect to login

### Test Scenario 3: Individual Session Logout

#### Steps:
1. **Login on Multiple Devices**
   - Login on at least 2 devices

2. **Logout from Specific Device**
   - On Device 1, go to Account → Security
   - Find the session for Device 2
   - Click "Logout" on that specific session

3. **Verify Selective Logout**
   - Device 1 should remain logged in
   - Device 2 should be logged out
   - Try to access protected pages on Device 2 - should redirect to login

### Test Scenario 4: Session Activity Updates

#### Steps:
1. **Monitor Session Activity**
   - Login on multiple devices
   - Navigate to Account → Security
   - Note the "Last Activity" timestamps

2. **Perform Actions**
   - Browse different pages on Device 1
   - Wait a few minutes
   - Refresh the sessions page

3. **Verify Updates**
   - Check that "Last Activity" timestamps have updated
   - Verify current session shows recent activity

### Test Scenario 5: Manual Refresh

#### Steps:
1. **Login on Multiple Devices**
   - Login on at least 2 devices

2. **Test Manual Refresh**
   - On Device 1, go to Account → Security
   - Click the "Refresh" button
   - Verify sessions list updates

3. **Test Auto-Refresh**
   - Wait for auto-refresh (if enabled)
   - Verify sessions update automatically

## 🔍 API Testing

### Test Endpoints with Postman/curl

#### 1. Get Active Sessions
```bash
GET /api/v1/auth/sessions
Headers:
  Authorization: Bearer <access_token>
  X-Refresh-Token: <refresh_token>
```

#### 2. Logout All Devices
```bash
DELETE /api/v1/auth/sessions
Headers:
  Authorization: Bearer <access_token>
```

#### 3. Logout Specific Device
```bash
DELETE /api/v1/auth/sessions/{sessionId}
Headers:
  Authorization: Bearer <access_token>
```

### Expected Responses

#### Get Sessions Success Response:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session-id",
        "deviceInfo": {
          "deviceId": "device-1",
          "deviceName": "Chrome on Windows",
          "lastActivity": "2024-01-01T12:00:00Z"
        },
        "createdAt": "2024-01-01T10:00:00Z",
        "lastActivity": "2024-01-01T12:00:00Z",
        "isCurrent": true,
        "ipAddress": "192.168.1.1"
      }
    ],
    "totalSessions": 1
  }
}
```

#### Logout All Devices Success Response:
```json
{
  "success": true,
  "data": {
    "loggedOut": true,
    "sessionsInvalidated": 2,
    "message": "Logged out from 2 devices"
  }
}
```

## 🐛 Error Testing

### Test Error Scenarios

#### 1. Network Errors
- Disconnect internet during session operations
- Verify graceful error handling
- Check user-friendly error messages

#### 2. Invalid Tokens
- Use expired access tokens
- Use invalid refresh tokens
- Verify proper error responses

#### 3. Database Errors
- Simulate database connection issues
- Verify fallback behavior
- Check error logging

## 📊 Performance Testing

### Load Testing
1. **Multiple Concurrent Sessions**
   - Login with same account on 10+ devices
   - Verify all sessions are tracked
   - Test logout all devices performance

2. **Session Activity Updates**
   - Monitor performance during high activity
   - Check for any performance degradation

### Memory Testing
1. **Long-Running Sessions**
   - Keep sessions active for extended periods
   - Monitor memory usage
   - Check for memory leaks

## 🔒 Security Testing

### Token Security
1. **Token Invalidation**
   - Verify tokens are properly blacklisted
   - Test token reuse prevention
   - Check Redis fallback behavior

2. **Session Hijacking Prevention**
   - Test session isolation
   - Verify proper session validation
   - Check IP address tracking

### Audit Logging
1. **Log Verification**
   - Check audit logs for session actions
   - Verify log data integrity
   - Test log rotation

## 🚀 Deployment Testing

### Pre-Deployment Checklist
- [ ] All backend services build successfully
- [ ] All frontend components build successfully
- [ ] Database migrations are ready
- [ ] Redis configuration is correct
- [ ] Environment variables are set

### Post-Deployment Verification
- [ ] Session management endpoints respond correctly
- [ ] Frontend session UI works properly
- [ ] Logout all devices functionality works
- [ ] Session activity tracking is active
- [ ] Error handling works as expected

## 📝 Test Results Template

### Test Run Summary
```
Date: _______________
Tester: _____________
Environment: ________

✅ Passed Tests:
- [ ] Multi-device login
- [ ] Logout all devices
- [ ] Individual session logout
- [ ] Session activity updates
- [ ] Manual refresh
- [ ] API endpoints
- [ ] Error handling
- [ ] Performance
- [ ] Security

❌ Failed Tests:
- [ ] Test name: Description of issue

🔧 Issues Found:
- Issue 1: Description
- Issue 2: Description

📋 Recommendations:
- Recommendation 1
- Recommendation 2
```

## 🎯 Success Criteria

The session management fixes are considered successful when:

1. ✅ Users can see all active sessions when logged in from multiple devices
2. ✅ "Logout All Devices" successfully logs out from all devices
3. ✅ Individual session logout works correctly
4. ✅ Session activity is tracked and updated in real-time
5. ✅ Manual refresh functionality works
6. ✅ Error handling provides user-friendly messages
7. ✅ Security measures are properly implemented
8. ✅ Performance remains acceptable under load

## 🆘 Troubleshooting

### Common Issues

#### Sessions Not Displaying
- Check browser console for errors
- Verify API endpoints are accessible
- Check authentication tokens
- Verify database connection

#### Logout All Devices Not Working
- Check Redis connection
- Verify token blacklisting
- Check database session updates
- Review server logs

#### Performance Issues
- Monitor database query performance
- Check Redis connection pool
- Review session cleanup procedures
- Monitor memory usage

### Debug Commands
```bash
# Check backend logs
npm run dev

# Check frontend logs
npm run dev

# Test API endpoints
curl -X GET http://localhost:3001/api/v1/auth/sessions \
  -H "Authorization: Bearer <token>"

# Check Redis connection
redis-cli ping
```

## 📞 Support

If you encounter issues during testing:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Verify all prerequisites are met
4. Contact the development team with detailed error information
