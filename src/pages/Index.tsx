import { useState } from "react";
import { Navbar } from "@/components/mockdrop/Navbar";
import { Hero } from "@/components/mockdrop/Hero";
import { Editor } from "@/components/mockdrop/Editor";
import { HowItWorks } from "@/components/mockdrop/HowItWorks";
import { Features } from "@/components/mockdrop/Features";
import { ActivityLog } from "@/components/mockdrop/ActivityLog";
import { Footer } from "@/components/mockdrop/Footer";

const Index = () => {
  const [activityTrigger, setActivityTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Editor onCreated={() => setActivityTrigger((v) => v + 1)} />
        <HowItWorks />
        <Features />
        <ActivityLog trigger={activityTrigger} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
