import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="min-h-screen bg-[#F4F4F5] flex flex-col items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-[#27272A] mb-4">GarageBot</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl text-[#71717A]">by</span>
            <Image 
              src="/assets/lokam-ai-logo.png"
              alt="Lokam.ai" 
              width={100} 
              height={35} 
              className="h-7 w-auto inline-block"
            />
          </div>
        </div>
        
        <p className="text-xl md:text-2xl mb-8 text-[#71717A]">
          Your AI Voice Agent for Seamless After-Sales Feedback & Interaction
        </p>
        <p className="text-lg mb-12 text-[#71717A]">
          Enhance customer experience with intelligent, automated conversations that feel personal and meaningful
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/signup" 
            className="px-8 py-3 bg-[#F97316] hover:bg-[#EA580C] rounded-lg font-semibold transition-colors text-white"
          >
            Get Started
          </Link>
          <Link 
            href="/signin" 
            className="px-8 py-3 bg-white hover:bg-[#E5E7EB] text-[#27272A] rounded-lg font-semibold transition-colors border border-[#E3E3E7]"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow border border-[#E3E3E7]">
            <h3 className="text-xl font-semibold mb-3 text-[#27272A]">Voice Intelligence</h3>
            <p className="text-[#71717A]">Natural conversations powered by advanced AI</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-[#E3E3E7]">
            <h3 className="text-xl font-semibold mb-3 text-[#27272A]">Smart Feedback</h3>
            <p className="text-[#71717A]">Automated collection and analysis of customer insights</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow border border-[#E3E3E7]">
            <h3 className="text-xl font-semibold mb-3 text-[#27272A]">24/7 Availability</h3>
            <p className="text-[#71717A]">Always ready to assist your customers</p>
          </div>
        </div>
      </div>
    </div>
  );
} 