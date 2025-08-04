'use client'

export default function BrandTest() {
  return (
    <div className="p-space-8 bg-background text-foreground">
      <div className="max-w-6xl mx-auto space-y-space-8">
        {/* Page Header */}
        <div className="text-center space-y-space-4">
          <h1 className="text-hero text-gradient">AirVikBook</h1>
          <h2 className="text-display">Brand System Test</h2>
          <p className="text-body-lg text-gray-600 dark:text-gray-400">
            Testing all brand elements, colors, typography, and components
          </p>
        </div>

        {/* Color Swatches */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Primary Brand Colors</h3>
          <div className="grid grid-cols-3 md:grid-cols-7 gap-space-4">
            <div className="bg-airvik-black p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Airvik Black</p>
            </div>
            <div className="bg-airvik-midnight p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Midnight</p>
            </div>
            <div className="bg-airvik-purple p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Airvik Purple</p>
            </div>
            <div className="bg-airvik-blue p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Airvik Blue</p>
            </div>
            <div className="bg-airvik-cyan p-space-4 rounded-radius-lg text-airvik-black text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Airvik Cyan</p>
            </div>
            <div className="bg-airvik-violet p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Airvik Violet</p>
            </div>
            <div className="bg-airvik-white p-space-4 rounded-radius-lg text-airvik-black border border-gray-200 text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption">Airvik White</p>
            </div>
          </div>
        </section>

        {/* Status Colors */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Status Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-4">
            <div className="bg-status-available p-space-4 rounded-radius-lg text-airvik-black text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption font-medium">Available</p>
            </div>
            <div className="bg-status-occupied p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption font-medium">Occupied</p>
            </div>
            <div className="bg-status-maintenance p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption font-medium">Maintenance</p>
            </div>
            <div className="bg-status-unavailable p-space-4 rounded-radius-lg text-airvik-white text-center">
              <div className="w-full h-16 mb-space-2"></div>
              <p className="text-caption font-medium">Unavailable</p>
            </div>
          </div>
        </section>

        {/* Typography Scale */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Typography Scale</h3>
          <div className="space-y-space-4">
            <div>
              <p className="text-caption text-gray-500 mb-space-1">Hero (72px) - SF Pro Display Bold</p>
              <h1 className="text-hero">The quick brown fox</h1>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">Display (60px) - SF Pro Display Bold</p>
              <h2 className="text-display">jumps over the lazy dog</h2>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">H1 (48px) - SF Pro Display Bold</p>
              <h1 className="text-h1">Hotel Management Excellence</h1>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">H2 (36px) - SF Pro Display Bold</p>
              <h2 className="text-h2">Streamlined Operations</h2>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">H3 (30px) - SF Pro Display Semibold</p>
              <h3 className="text-h3">Room Management</h3>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">Body Large (18px) - Inter Regular</p>
              <p className="text-body-lg">This is large body text for important descriptions and lead paragraphs.</p>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">Body (16px) - Inter Regular</p>
              <p className="text-body">This is standard body text for most content. It's comfortable to read and works well for longer passages.</p>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">Body Small (14px) - Inter Regular</p>
              <p className="text-body-sm">This is small body text for secondary information and details.</p>
            </div>
            <div>
              <p className="text-caption text-gray-500 mb-space-1">Button (14px) - SF Pro Display Medium Uppercase</p>
              <p className="text-button">Book Now</p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Button Components</h3>
          <div className="flex flex-wrap gap-space-4">
            <button className="px-space-6 py-space-3 bg-airvik-blue text-airvik-white rounded-radius-md text-button transition-all duration-normal hover:bg-airvik-purple hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
              Primary Button
            </button>
            <button className="px-space-6 py-space-3 bg-transparent border-2 border-airvik-blue text-airvik-blue rounded-radius-md text-button transition-all duration-normal hover:bg-airvik-blue hover:text-airvik-white">
              Secondary Button
            </button>
            <button className="px-space-8 py-space-4 bg-gradient-mid text-airvik-white rounded-radius-lg text-button transition-all duration-normal hover:shadow-glow-primary hover:-translate-y-0.5">
              Gradient Button
            </button>
          </div>
        </section>

        {/* Gradients */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Brand Gradients</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-4">
            <div className="bg-gradient-dark-1 p-space-8 rounded-radius-xl text-airvik-white text-center">
              <h4 className="text-h4 mb-space-2">Dark Gradient 1</h4>
              <p className="text-body">Black to Purple</p>
            </div>
            <div className="bg-gradient-mid p-space-8 rounded-radius-xl text-airvik-white text-center">
              <h4 className="text-h4 mb-space-2">Mid Gradient</h4>
              <p className="text-body">Purple to Cyan</p>
            </div>
            <div className="bg-gradient-light-2 p-space-8 rounded-radius-xl text-airvik-black text-center">
              <h4 className="text-h4 mb-space-2">Light Gradient 2</h4>
              <p className="text-body">Blue Light to Cyan Light</p>
            </div>
          </div>
        </section>

        {/* Shadows & Effects */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Shadows & Effects</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-4">
            <div className="bg-airvik-white dark:bg-gray-900 p-space-6 rounded-radius-lg shadow-sm">
              <h5 className="text-h5 mb-space-2">Shadow SM</h5>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">Subtle elevation</p>
            </div>
            <div className="bg-airvik-white dark:bg-gray-900 p-space-6 rounded-radius-lg shadow-md">
              <h5 className="text-h5 mb-space-2">Shadow MD</h5>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">Medium elevation</p>
            </div>
            <div className="bg-airvik-white dark:bg-gray-900 p-space-6 rounded-radius-lg shadow-lg">
              <h5 className="text-h5 mb-space-2">Shadow LG</h5>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">High elevation</p>
            </div>
            <div className="bg-airvik-white dark:bg-gray-900 p-space-6 rounded-radius-lg shadow-glow-primary">
              <h5 className="text-h5 mb-space-2">Glow Effect</h5>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">Brand glow</p>
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Spacing System (8px Grid)</h3>
          <div className="space-y-space-2">
            {[1, 2, 3, 4, 6, 8, 12, 16, 24].map((size) => (
              <div key={size} className="flex items-center gap-space-4">
                <div 
                  className="bg-airvik-blue" 
                  style={{ 
                    width: `${size * 4}px`, 
                    height: '16px' 
                  }}
                ></div>
                <span className="text-body-sm">space-{size} ({size * 4}px)</span>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive States */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Interactive States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-6">
            <div className="space-y-space-4">
              <h4 className="text-h4">Hover Effects</h4>
              <button className="w-full p-space-4 bg-airvik-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-radius-lg text-left transition-all duration-normal hover:shadow-md hover:-translate-y-0.5">
                <span className="text-body">Hover me for lift effect</span>
              </button>
              <button className="w-full p-space-4 bg-airvik-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-radius-lg text-left transition-all duration-normal hover:scale-105">
                <span className="text-body">Hover me for scale effect</span>
              </button>
            </div>
            <div className="space-y-space-4">
              <h4 className="text-h4">Focus States</h4>
              <input 
                type="text" 
                placeholder="Focus me to see ring"
                className="w-full p-space-3 border-2 border-gray-300 dark:border-gray-700 rounded-radius-md focus:border-airvik-blue focus:outline-none focus:ring-2 focus:ring-airvik-blue/20 transition-all duration-fast"
              />
              <button className="w-full p-space-4 bg-airvik-blue text-airvik-white rounded-radius-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-airvik-blue focus-visible:ring-offset-2 transition-all duration-normal">
                <span className="text-button">Focus me with keyboard</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dark Mode Toggle */}
        <section className="space-y-space-6">
          <h3 className="text-h3">Dark Mode Support</h3>
          <p className="text-body text-gray-600 dark:text-gray-400">
            Use your browser's theme toggle or system setting to test dark mode. 
            All elements above should adapt seamlessly.
          </p>
        </section>

        <div className="text-center pt-space-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-caption text-gray-500">
            Brand System v1.0 - AirVikBook Hotel Management
          </p>
        </div>
      </div>
    </div>
  )
}