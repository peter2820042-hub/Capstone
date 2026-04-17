# Run as Administrator to allow port 5173 through Windows Firewall

# Allow port 5173 for Vite dev server
netsh advfirewall firewall add rule name="Vite Dev Server 5173" dir=in action=allow protocol=TCP localport=5173

# Allow port 3001 for backend API
netsh advfirewall firewall add rule name="Node API Server 3001" dir=in action=allow protocol=TCP localport=3001

Write-Host "Firewall rules added successfully!" -ForegroundColor Green
Write-Host "Ports 5173 (frontend) and 3001 (backend) are now allowed through firewall."