import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Hero SVG Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 120 120"
                  className="text-primary-500"
                  fill="currentColor"
                >
                  {/* Lottery Ball Background */}
                  <circle cx="60" cy="60" r="50" className="fill-primary-500/20" />
                  <circle cx="60" cy="60" r="45" className="fill-primary-500" />

                  {/* Numbers Pattern */}
                  <circle cx="35" cy="35" r="8" className="fill-white" />
                  <text x="35" y="40" textAnchor="middle" className="fill-primary-500 text-sm font-bold">15</text>

                  <circle cx="85" cy="35" r="8" className="fill-white" />
                  <text x="85" y="40" textAnchor="middle" className="fill-primary-500 text-sm font-bold">7</text>

                  <circle cx="60" cy="60" r="8" className="fill-white" />
                  <text x="60" y="65" textAnchor="middle" className="fill-primary-500 text-sm font-bold">23</text>

                  <circle cx="35" cy="85" r="8" className="fill-white" />
                  <text x="35" y="90" textAnchor="middle" className="fill-primary-500 text-sm font-bold">11</text>

                  <circle cx="85" cy="85" r="8" className="fill-white" />
                  <text x="85" y="90" textAnchor="middle" className="fill-primary-500 text-sm font-bold">3</text>

                  {/* Sparkle Effects */}
                  <g className="animate-pulse">
                    <path d="M20 20 L25 25 L20 30 L15 25 Z" className="fill-yellow-400" />
                    <path d="M100 15 L105 20 L100 25 L95 20 Z" className="fill-yellow-400" />
                    <path d="M105 95 L110 100 L105 105 L100 100 Z" className="fill-yellow-400" />
                    <path d="M15 100 L20 105 L15 110 L10 105 Z" className="fill-yellow-400" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Hero Title */}
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                EasyLotto
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-xl sm:text-2xl text-foreground/80 mb-8 max-w-3xl mx-auto">
              Smart lottery number generation powered by mathematical algorithms and historical data analysis
            </p>

            {/* Hero Description */}
            <p className="text-lg text-foreground/60 mb-12 max-w-2xl mx-auto">
              Generate intelligent Lotofácil number combinations using advanced mathematical constraints,
              statistical patterns, and real-time data from thousands of historical games.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button
                as={Link}
                href="/generator"
                color="primary"
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
              >
                Start Generating Numbers
              </Button>
              <Button
                as={Link}
                href="/statistics"
                variant="bordered"
                size="lg"
                className="px-8 py-3 text-lg"
              >
                View Statistics
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-foreground/60">
              <Chip variant="flat" color="success">✓ Real-time Data</Chip>
              <Chip variant="flat" color="primary">✓ Mathematical Analysis</Chip>
              <Chip variant="flat" color="secondary">✓ Historical Patterns</Chip>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Smart Players
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to make informed decisions and maximize your lottery strategy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Number Generator */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-primary-500" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Smart Generator</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-foreground/70 mb-4">
                  Generate numbers using mathematical constraints like prime numbers, Fibonacci sequences,
                  and even/odd distributions for strategic combinations.
                </p>
                <Button as={Link} href="/generator" variant="flat" color="primary" size="sm">
                  Try Generator →
                </Button>
              </CardBody>
            </Card>

            {/* Feature 2: Bulk Sets */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-secondary-500" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Bulk Generation</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-foreground/70 mb-4">
                  Create multiple organized groups of number sets for systematic play.
                  Perfect for lottery pools and strategic betting approaches.
                </p>
                <Button as={Link} href="/generator-sets" variant="flat" color="secondary" size="sm">
                  Generate Sets →
                </Button>
              </CardBody>
            </Card>

            {/* Feature 3: Historical Analysis */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-success-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-success-500" fill="currentColor">
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Data Analytics</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-foreground/70 mb-4">
                  Analyze thousands of historical Lotofácil games to identify patterns,
                  trends, and statistical insights for informed number selection.
                </p>
                <Button as={Link} href="/statistics" variant="flat" color="success" size="sm">
                  View Analytics →
                </Button>
              </CardBody>
            </Card>

            {/* Feature 4: Game Management */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-warning-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-warning-500" fill="currentColor">
                      <path d="M17 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">My Games</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-foreground/70 mb-4">
                  Save, organize, and track your generated number combinations.
                  Keep a personal library of your favorite lottery strategies.
                </p>
                <Button as={Link} href="/my-games" variant="flat" color="warning" size="sm">
                  Manage Games →
                </Button>
              </CardBody>
            </Card>

            {/* Feature 5: Mathematical Combinations */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-danger-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-danger-500" fill="currentColor">
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Math Explorer</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-foreground/70 mb-4">
                  Explore all possible mathematical constraint combinations to understand
                  the complete universe of strategic number generation possibilities.
                </p>
                <Button as={Link} href="/possible-combinations" variant="flat" color="danger" size="sm">
                  Explore Math →
                </Button>
              </CardBody>
            </Card>

            {/* Feature 6: Geographic Insights */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="text-primary-500" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Winner Analysis</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-foreground/70 mb-4">
                  Discover geographic patterns and winner distributions across Brazilian states
                  to gain insights into regional lottery trends and statistics.
                </p>
                <Button as={Link} href="/winners-per-state" variant="flat" color="primary" size="sm">
                  View Winners →
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-foreground/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How EasyLotto Works
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Our intelligent system combines mathematical precision with data-driven insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Set Your Constraints</h3>
              <p className="text-foreground/70">
                Choose mathematical parameters like prime numbers, Fibonacci sequences,
                even/odd ratios, and multiples to guide the generation process.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-secondary-500 flex items-center justify-center text-white text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
              <p className="text-foreground/70">
                Our algorithms analyze thousands of historical games to identify patterns
                and generate numbers that match your specified constraints.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-success-500 flex items-center justify-center text-white text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-4">Get Smart Numbers</h3>
              <p className="text-foreground/70">
                Receive mathematically optimized number combinations with detailed analysis
                and save your favorites for future reference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Powered by Real Data
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Our platform analyzes comprehensive lottery data to provide you with the most informed insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-500 mb-2">3,500+</div>
              <div className="text-foreground/70">Historical Games</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary-500 mb-2">25</div>
              <div className="text-foreground/70">Number Range</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success-500 mb-2">15</div>
              <div className="text-foreground/70">Numbers per Game</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning-500 mb-2">∞</div>
              <div className="text-foreground/70">Combinations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500/10 to-secondary-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Ready to Play Smarter?
          </h2>
          <p className="text-xl text-foreground/70 mb-8">
            Join thousands of players who use mathematical strategies to improve their lottery experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              href="/generator"
              color="primary"
              size="lg"
              className="px-8 py-3 text-lg font-semibold"
            >
              Start Generating Now
            </Button>
            <Button
              as={Link}
              href="/statistics"
              variant="bordered"
              size="lg"
              className="px-8 py-3 text-lg"
            >
              Explore Data First
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold text-foreground mb-4">EasyLotto</h3>
              <p className="text-foreground/60 mb-4 max-w-md">
                Smart lottery number generation powered by mathematical algorithms and historical data analysis.
                Make informed decisions with data-driven insights.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Tools</h4>
              <div className="space-y-2">
                <Link href="/generator" className="block text-foreground/60 hover:text-foreground">Number Generator</Link>
                <Link href="/generator-sets" className="block text-foreground/60 hover:text-foreground">Bulk Sets</Link>
                <Link href="/my-games" className="block text-foreground/60 hover:text-foreground">My Games</Link>
                <Link href="/statistics" className="block text-foreground/60 hover:text-foreground">Statistics</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Analysis</h4>
              <div className="space-y-2">
                <Link href="/possible-combinations" className="block text-foreground/60 hover:text-foreground">Math Explorer</Link>
                <Link href="/winners-per-state" className="block text-foreground/60 hover:text-foreground">Winner Analysis</Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-foreground/10 text-center text-foreground/60">
            <p>&copy; 2024 EasyLotto. Built for smart lottery players.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
