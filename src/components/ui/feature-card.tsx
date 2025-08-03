import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: "blue" | "green" | "purple" | "red" | "orange";
  buttonText: string;
  buttonVariant?: "default" | "secondary" | "outline";
  onClick?: () => void;
  className?: string;
  href?: string;
}

const iconColorMap = {
  blue: "text-primary",
  green: "text-success", 
  purple: "text-purple",
  red: "text-destructive",
  orange: "text-warning",
};

const iconBgMap = {
  blue: "bg-primary/10",
  green: "bg-success/10",
  purple: "bg-purple/10", 
  red: "bg-destructive/10",
  orange: "bg-warning/10",
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor = "blue",
  buttonText,
  buttonVariant = "default",
  onClick,
  className = "",
}) => {
  return (
    <Card className={`group transition-all duration-300 hover:shadow-hover hover:-translate-y-1 cursor-pointer ${className}`}>
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto w-16 h-16 rounded-full ${iconBgMap[iconColor]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-8 h-8 ${iconColorMap[iconColor]}`} />
        </div>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {description}
        </CardDescription>
        <Button 
          variant={buttonVariant} 
          onClick={onClick}
          className="w-full transition-smooth"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};