import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { Header } from "@/components/layout/Header";
import {
  CheckSquare,
  BarChart3,
  Target,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

export const LandingPage = () => {
  const features = [
    {
      title: "Smart Task Management",
      description: "Organize, prioritize, and track your tasks with intelligent automation and AI-powered insights.",
      icon: CheckSquare,
      iconColor: "blue" as const,
      buttonText: "Learn More →",
    },
    {
      title: "Productivity Analytics",
      description: "Get detailed insights into your productivity patterns with comprehensive analytics and reporting.",
      icon: BarChart3,
      iconColor: "green" as const,
      buttonText: "Explore Analytics →",
    },
    {
      title: "Goal Tracking",
      description: "Set and achieve your goals with advanced tracking, milestones, and progress visualization.",
      icon: Target,
      iconColor: "purple" as const,
      buttonText: "Track Goals →",
    },
    {
      title: "Smart Notifications",
      description: "Stay on track with intelligent reminders and notifications that adapt to your schedule.",
      icon: Zap,
      iconColor: "orange" as const,
      buttonText: "Try Notifications →",
    },
    {
      title: "Secure & Private", 
      description: "Your data is protected with enterprise-grade security and complete privacy controls.",
      icon: Shield,
      iconColor: "green" as const,
      buttonText: "View Security →",
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with shared projects, real-time updates, and team insights.",
      icon: Users,
      iconColor: "red" as const,
      buttonText: "Learn More →",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header showNavigation={false} />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
            <Star className="w-4 h-4" />
            <span>Trusted by 10,000+ professionals</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
            Master Your Tasks,
            <br />
            Boost Your Productivity
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The comprehensive task management platform that helps you stay organized, 
            track progress, and achieve your goals with intelligent automation and powerful analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-xl">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Everything you need to stay productive
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools and features designed to help you manage tasks, 
            track progress, and achieve your goals more efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              iconColor={feature.iconColor}
              buttonText={feature.buttonText}
              buttonVariant="outline"
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center bg-gradient-primary rounded-3xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your productivity?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have already boosted their productivity 
            with TaskMaster's intelligent task management platform.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4 rounded-xl">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <CheckSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">TaskMaster</span>
          </div>
          <p className="text-muted-foreground">
            © 2024 TaskMaster. Empowering productivity worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};