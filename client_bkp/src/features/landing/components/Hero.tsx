import Image from 'next/image';
import { Button } from '@/components/ui/button/Button';

export default function Hero() {
  return (
    <div className="min-h-screen bg-autopulse-grey flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-autopulse-black mb-4">AutoPulse</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl text-gray-500">by</span>
            <Image 
              src="/assets/brand/lokam-ai-logo-dark.png"
              alt="Lokam.ai" 
              width={100} 
              height={35} 
              className="h-7 w-auto inline-block"
            />
          </div>
        </div>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-700">
          Your AI Voice Agent for Seamless After-Sales Feedback & Interaction
        </p>
        <p className="text-lg mb-12 text-gray-500">
          Enhance customer experience with intelligent, automated conversations that feel personal and meaningful
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/signup" variant="primary">
            Get Started
          </Button>
          <Button href="/signin" variant="secondary">
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
} 