import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare,
  BarChart3,
  Target,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Star,
  Check,
  Crown,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";

export const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setIsVisible(true);
    
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observe all sections
    const sections = document.querySelectorAll('.scroll-animate');
    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

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

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      description: "Perfect for personal use",
      features: [
        "Up to 50 tasks",
        "Basic analytics",
        "3 goals tracking",
        "Email support",
        "Mobile app access"
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const
    },
    {
      name: "Pro",
      price: "9",
      period: "month",
      description: "For power users and professionals",
      features: [
        "Unlimited tasks & goals",
        "Advanced analytics",
        "Team collaboration",
        "Priority support",
        "Custom integrations",
        "Advanced automation"
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const
    },
    {
      name: "Enterprise",
      price: "29",
      period: "month",
      description: "For teams and organizations",
      features: [
        "Everything in Pro",
        "Advanced security",
        "Custom branding",
        "Dedicated support",
        "SLA guarantee",
        "On-premise deployment"
      ],
      popular: false,
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <LandingHeader />
      
      {/* Hero Section */}
      <section id="hero" className={`container mx-auto px-4 py-20 scroll-animate transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center max-w-4xl mx-auto">
          <div className={`inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <Star className="w-4 h-4 animate-pulse" />
            <span>Trusted by 10,000+ professionals</span>
          </div>
          
          <h1 className={`text-6xl md:text-7xl font-bold mb-6 leading-tight transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <span className="text-foreground">Master Your Tasks,</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-purple bg-clip-text text-transparent dark:from-primary dark:to-purple-foreground animate-gradient">
              Boost Your Productivity
            </span>
          </h1>
          
          <p className={`text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            The comprehensive task management platform that helps you stay organized, 
            track progress, and achieve your goals with intelligent automation and powerful analytics.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 rounded-xl hover:scale-105 transition-all">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20 scroll-animate opacity-0 translate-y-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powerful Features</span>
          </div>
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
            <div 
              key={index}
              className="scroll-animate opacity-0 translate-y-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                iconColor={feature.iconColor}
                buttonText={feature.buttonText}
                buttonVariant="outline"
                className="hover:scale-105 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20 scroll-animate opacity-0 translate-y-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
            <Crown className="w-4 h-4" />
            <span>Simple Pricing</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative transition-all duration-500 hover:scale-105 scroll-animate opacity-0 translate-y-8 ${
                plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : 'hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-6">
                  <Link to="/auth">
                    <Button 
                      variant={plan.buttonVariant}
                      className={`w-full ${plan.popular ? 'bg-gradient-primary' : ''} hover:scale-105 transition-all`}
                    >
                      {plan.buttonText}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-4 py-20 scroll-animate opacity-0 translate-y-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
              <Users className="w-4 h-4" />
              <span>About TaskMaster</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Built for Modern Productivity</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              TaskMaster was created by productivity experts who understand the challenges 
              of modern work and personal life management.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 scroll-animate opacity-0 translate-x-8">
              <h3 className="text-3xl font-bold">Our Mission</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe that everyone deserves tools that help them achieve their full potential. 
                TaskMaster combines cutting-edge technology with intuitive design to create 
                the ultimate productivity platform.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Goal-oriented approach to task management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Data-driven insights for continuous improvement</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">Privacy-first design with enterprise security</span>
                </div>
              </div>
            </div>
            <div className="scroll-animate opacity-0 translate-x-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20"></div>
                <Card className="relative bg-card/80 backdrop-blur border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 mx-auto bg-gradient-primary rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold">10,000+ Happy Users</h4>
                      <p className="text-muted-foreground">
                        Join thousands of professionals who have transformed their productivity with TaskMaster.
                      </p>
                      <div className="flex justify-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">4.9/5 average rating</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="container mx-auto px-4 py-20 scroll-animate opacity-0 translate-y-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full text-primary font-medium mb-6">
              <Mail className="w-4 h-4" />
              <span>Get in Touch</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="scroll-animate opacity-0 translate-x-8 shadow-lg">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea 
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-32"
                  />
                </div>
                <Button className="w-full bg-gradient-primary hover:scale-105 transition-all">
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8 scroll-animate opacity-0 translate-x-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Get in touch</h3>
                <p className="text-muted-foreground mb-8">
                  We're here to help and answer any question you might have. 
                  We look forward to hearing from you.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email</h4>
                    <p className="text-muted-foreground">support@taskmaster.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Phone</h4>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Office</h4>
                    <p className="text-muted-foreground">
                      123 Productivity Street<br />
                      San Francisco, CA 94105
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-primary rounded-2xl text-white">
                <h4 className="font-bold text-lg mb-2">Need immediate help?</h4>
                <p className="opacity-90 mb-4">
                  Check out our comprehensive documentation and FAQ section.
                </p>
                <Button variant="secondary" className="hover:scale-105 transition-all">
                  View Documentation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 scroll-animate opacity-0 translate-y-8">
        <div className="text-center bg-gradient-primary rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              Ready to transform your productivity?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already boosted their productivity 
              with TaskMaster's intelligent task management platform.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4 rounded-xl hover:scale-105 transition-all group">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-12 scroll-animate opacity-0 translate-y-8">
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