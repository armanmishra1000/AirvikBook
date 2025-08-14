export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to AirVikBook
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Modern Hotel Management System
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-radius-lg shadow-shadow-md">
            <h2 className="text-xl font-semibold mb-2">🏨 Property Management</h2>
            <p className="text-gray-600">Manage rooms, rates, and availability</p>
          </div>
          
          <div className="p-6 bg-white rounded-radius-lg shadow-shadow-md">
            <h2 className="text-xl font-semibold mb-2">📅 Booking Engine</h2>
            <p className="text-gray-600">Online reservations and guest management</p>
          </div>
          
          <div className="p-6 bg-white rounded-radius-lg shadow-shadow-md">
            <h2 className="text-xl font-semibold mb-2">💳 Payment Processing</h2>
            <p className="text-gray-600">Secure payments and financial reporting</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
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