import { GitBranch, Brain, Shield } from 'lucide-react';

const features = [
  {
    icon: GitBranch,
    title: 'Visual Diagrams',
    description: 'Auto-generated flowcharts that map out key concepts and relationships.',
  },
  {
    icon: Brain,
    title: 'Technical Analysis',
    description: 'In-depth breakdowns for professionals and researchers.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your documents are processed securely and never stored.',
  },
];

export function Features() {
  return (
    <section className="py-12 border-t border-border/40">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <feature.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
