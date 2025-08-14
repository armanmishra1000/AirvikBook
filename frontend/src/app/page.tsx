export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-space-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-h1 text-center mb-space-8">
          Welcome to AirVikBook
        </h1>
        <p className="text-center text-gray-600 mb-space-12">
          Modern Hotel Management System
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-6 max-w-4xl mx-auto">
          <div className="p-space-6 bg-airvik-white rounded-radius-lg shadow-shadow-md">
            <h2 className="text-h4 font-semibold mb-space-2">🏨 Property Management</h2>
            <p className="text-gray-600">Manage rooms, rates, and availability</p>
          </div>
          
          <div className="p-space-6 bg-airvik-white rounded-radius-lg shadow-shadow-md">
            <h2 className="text-h4 font-semibold mb-space-2">📅 Booking Engine</h2>
            <p className="text-gray-600">Online reservations and guest management</p>
          </div>
          
          <div className="p-space-6 bg-airvik-white rounded-radius-lg shadow-shadow-md">
            <h2 className="text-h4 font-semibold mb-space-2">💳 Payment Processing</h2>
            <p className="text-gray-600">Secure payments and financial reporting</p>
          </div>
        </div>
        
        <div className="mt-space-12 text-center">
          <p className="text-sm text-gray-500">
            API Status: <span className="text-green-600">Ready</span>
          </p>
          <p className="text-sm text-gray-500">
            Backend: http://localhost:5000 | Frontend: http://localhost:3000
          </p>
        </div>
      </div>
    </div>
  );
}