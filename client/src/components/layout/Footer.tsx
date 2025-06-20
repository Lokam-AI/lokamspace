import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-autopulse-black-dark text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4">
              <Image 
                src="/assets/brand/lokam-ai-logo-light.png"
                alt="Lokam.ai" 
                width={120} 
                height={40} 
                className="h-8 w-auto"
              />
              <span className="text-gray-400">|</span>
              <span className="text-lg font-semibold text-autopulse-orange">AutoPulse</span>
            </div>
            <p className="text-gray-400 mt-2 text-center md:text-left max-w-sm">
              Empowering automotive businesses with intelligent AI solutions
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-16">
            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="https://lokam.ai/" className="text-gray-400 hover:text-autopulse-orange transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="https://lokam.ai/#contact" className="text-gray-400 hover:text-autopulse-orange transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-autopulse-orange transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-autopulse-orange transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Lokam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
} 