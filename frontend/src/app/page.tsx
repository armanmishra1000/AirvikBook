export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-space-24">
      <div className="z-10 items-center justify-between w-full max-w-5xl font-mono text-sm">
        <h1 className="text-center text-h1 mb-space-8">
          Welcome to AirVikBook
        </h1>
        <p className="text-center text-gray-600 mb-space-12">
          Modern Hotel Management System
        </p>
        
        <div className="grid max-w-4xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
          <div className="p-6 bg-white rounded-radius-lg shadow-shadow-md">
            <h2 className="mb-2 text-xl font-semibold">🏨 Property Management</h2>
            <p className="text-gray-600">Manage rooms, rates, and availability</p>
          </div>
          
          <div className="p-6 bg-white rounded-radius-lg shadow-shadow-md">
            <h2 className="mb-2 text-xl font-semibold">📅 Booking Engine</h2>
            <p className="text-gray-600">Online reservations and guest management</p>
          </div>
          
          <div className="p-6 bg-white rounded-radius-lg shadow-shadow-md">
            <h2 className="mb-2 text-xl font-semibold">💳 Payment Processing</h2>
            <p className="text-gray-600">Secure payments and financial reporting</p>
          </div>
        </div>
        
        <div className="text-center mt-space-12">
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