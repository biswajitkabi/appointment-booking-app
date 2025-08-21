# Register
curl -X POST https://your-backend.onrender.com/api/register \
 -H "Content-Type: application/json" \
 -d '{"name":"Patient","email":"patient@example.com","password":"Passw0rd!"}'

# Login
curl -X POST https://your-backend.onrender.com/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"patient@example.com","password":"Passw0rd!"}'

# Get slots
curl "https://your-backend.onrender.com/api/slots?from=2025-08-21&to=2025-08-28"

# Book slot
curl -X POST https://your-backend.onrender.com/api/book \
 -H "Authorization: Bearer <TOKEN>" \
 -H "Content-Type: application/json" \
 -d '{"slotId": 1}'
