import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E3E3E7]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Company Info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4">
              <Image 
                src="/assets/lokam-ai-logo.png"
                alt="Lokam.ai" 
                width={120} 
                height={40} 
                className="h-8 w-auto"
              />
              <span className="text-[#71717A]">|</span>
              <span className="text-lg font-semibold text-[#F97316]">GarageBot</span>
            </div>
            <p className="text-[#71717A] mt-2 text-center md:text-left max-w-sm">
              Empowering automotive businesses with intelligent AI solutions
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8 md:gap-16">
            <div>
              <h3 className="font-semibold text-[#27272A] mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="https://lokam.ai/" className="text-[#71717A] hover:text-[#F97316] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="https://lokam.ai/#contact" className="text-[#71717A] hover:text-[#F97316] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-[#27272A] mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-[#71717A] hover:text-[#F97316] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[#71717A] hover:text-[#F97316] transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-[#E3E3E7]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-[#71717A] text-sm">
          <p>© {new Date().getFullYear()} Lokam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 