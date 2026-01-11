const App = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold text-primary mb-4">
          NanoReach Platform
        </h1>
        <p className="text-muted-foreground mb-6">
          Connecting brands with content creators
        </p>
        
        {/* Test Tailwind Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">For Brands</h2>
            <p className="text-sm text-muted-foreground">
              Create campaigns and find the perfect influencers
            </p>
          </div>
          
          <div className="p-6 bg-secondary border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">For Creators</h2>
            <p className="text-sm text-muted-foreground">
              Discover campaigns and grow your influence
            </p>
          </div>
          
          <div className="p-6 bg-accent border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Get Started</h2>
            <p className="text-sm text-muted-foreground">
              Join thousands of brands and creators
            </p>
          </div>
        </div>

        {/* Test Button Styles */}
        <div className="mt-8 flex gap-4">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Primary Button
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            Secondary Button
          </button>
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
            Destructive Button
          </button>
        </div>
      </div>
    </div>
  )
}

export default App