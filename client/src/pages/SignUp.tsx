
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, ArrowLeft, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organizationName: "",
    location: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Global cities list - comprehensive selection from around the world
  const globalCities = [
    // North America
    "New York, NY, USA", "Los Angeles, CA, USA", "Chicago, IL, USA", "Houston, TX, USA", "Phoenix, AZ, USA",
    "Philadelphia, PA, USA", "San Antonio, TX, USA", "San Diego, CA, USA", "Dallas, TX, USA", "San Jose, CA, USA",
    "Austin, TX, USA", "Jacksonville, FL, USA", "Fort Worth, TX, USA", "Columbus, OH, USA", "Charlotte, NC, USA",
    "San Francisco, CA, USA", "Indianapolis, IN, USA", "Seattle, WA, USA", "Denver, CO, USA", "Washington, DC, USA",
    "Boston, MA, USA", "El Paso, TX, USA", "Nashville, TN, USA", "Detroit, MI, USA", "Oklahoma City, OK, USA",
    "Portland, OR, USA", "Las Vegas, NV, USA", "Memphis, TN, USA", "Louisville, KY, USA", "Baltimore, MD, USA",
    "Toronto, ON, Canada", "Montreal, QC, Canada", "Vancouver, BC, Canada", "Calgary, AB, Canada", "Ottawa, ON, Canada",
    "Mexico City, Mexico", "Guadalajara, Mexico", "Monterrey, Mexico", "Puebla, Mexico", "Tijuana, Mexico",
    
    // Europe
    "London, United Kingdom", "Paris, France", "Berlin, Germany", "Madrid, Spain", "Rome, Italy",
    "Amsterdam, Netherlands", "Vienna, Austria", "Brussels, Belgium", "Prague, Czech Republic", "Warsaw, Poland",
    "Budapest, Hungary", "Stockholm, Sweden", "Oslo, Norway", "Copenhagen, Denmark", "Helsinki, Finland",
    "Dublin, Ireland", "Lisbon, Portugal", "Athens, Greece", "Zurich, Switzerland", "Barcelona, Spain",
    "Milan, Italy", "Munich, Germany", "Hamburg, Germany", "Lyon, France", "Marseille, France",
    "Manchester, United Kingdom", "Birmingham, United Kingdom", "Glasgow, Scotland", "Edinburgh, Scotland",
    
    // Asia
    "Tokyo, Japan", "Shanghai, China", "Beijing, China", "Mumbai, India", "Delhi, India",
    "Seoul, South Korea", "Singapore", "Hong Kong", "Bangkok, Thailand", "Jakarta, Indonesia",
    "Manila, Philippines", "Kuala Lumpur, Malaysia", "Ho Chi Minh City, Vietnam", "Hanoi, Vietnam",
    "Taipei, Taiwan", "Osaka, Japan", "Kyoto, Japan", "Bangalore, India", "Chennai, India",
    "Kolkata, India", "Hyderabad, India", "Pune, India", "Ahmedabad, India", "Karachi, Pakistan",
    "Lahore, Pakistan", "Islamabad, Pakistan", "Dhaka, Bangladesh", "Colombo, Sri Lanka", "Kathmandu, Nepal",
    "Tel Aviv, Israel", "Jerusalem, Israel", "Dubai, UAE", "Abu Dhabi, UAE", "Doha, Qatar",
    "Kuwait City, Kuwait", "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Tehran, Iran", "Istanbul, Turkey",
    "Ankara, Turkey", "Tbilisi, Georgia", "Yerevan, Armenia", "Baku, Azerbaijan",
    
    // Australia & Oceania
    "Sydney, Australia", "Melbourne, Australia", "Brisbane, Australia", "Perth, Australia", "Adelaide, Australia",
    "Canberra, Australia", "Auckland, New Zealand", "Wellington, New Zealand", "Christchurch, New Zealand",
    "Suva, Fiji", "Port Moresby, Papua New Guinea",
    
    // South America
    "São Paulo, Brazil", "Rio de Janeiro, Brazil", "Buenos Aires, Argentina", "Lima, Peru", "Bogotá, Colombia",
    "Santiago, Chile", "Caracas, Venezuela", "Montevideo, Uruguay", "Asunción, Paraguay", "La Paz, Bolivia",
    "Quito, Ecuador", "Georgetown, Guyana", "Paramaribo, Suriname", "Brasília, Brazil", "Salvador, Brazil",
    "Fortaleza, Brazil", "Belo Horizonte, Brazil", "Manaus, Brazil", "Curitiba, Brazil", "Recife, Brazil",
    "Córdoba, Argentina", "Rosario, Argentina", "Mendoza, Argentina", "Medellín, Colombia", "Cali, Colombia",
    "Barranquilla, Colombia", "Cartagena, Colombia", "Arequipa, Peru", "Trujillo, Peru", "Chiclayo, Peru",
    "Valparaíso, Chile", "Concepción, Chile", "Antofagasta, Chile", "Temuco, Chile",
    
    // Africa
    "Cairo, Egypt", "Lagos, Nigeria", "Kinshasa, DR Congo", "Johannesburg, South Africa", "Luanda, Angola",
    "Dar es Salaam, Tanzania", "Khartoum, Sudan", "Algiers, Algeria", "Nairobi, Kenya", "Casablanca, Morocco",
    "Addis Ababa, Ethiopia", "Cape Town, South Africa", "Durban, South Africa", "Alexandria, Egypt",
    "Abidjan, Côte d'Ivoire", "Kano, Nigeria", "Ibadan, Nigeria", "Dakar, Senegal", "Accra, Ghana",
    "Bamako, Mali", "Ouagadougou, Burkina Faso", "Conakry, Guinea", "Freetown, Sierra Leone",
    "Monrovia, Liberia", "Tunis, Tunisia", "Rabat, Morocco", "Marrakech, Morocco", "Fez, Morocco",
    "Tripoli, Libya", "Benghazi, Libya", "Kampala, Uganda", "Kigali, Rwanda", "Bujumbura, Burundi",
    "Djibouti City, Djibouti", "Asmara, Eritrea", "Mogadishu, Somalia", "Antananarivo, Madagascar",
    "Port Louis, Mauritius", "Victoria, Seychelles", "Windhoek, Namibia", "Gaborone, Botswana",
    "Maseru, Lesotho", "Mbabane, Eswatini", "Maputo, Mozambique", "Lusaka, Zambia", "Harare, Zimbabwe",
    "Lilongwe, Malawi", "Dodoma, Tanzania", "Libreville, Gabon", "Malabo, Equatorial Guinea",
    "São Tomé, São Tomé and Príncipe", "Praia, Cape Verde", "Bissau, Guinea-Bissau",
    "N'Djamena, Chad", "Bangui, Central African Republic", "Brazzaville, Republic of the Congo"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle location search
    if (name === "location") {
      if (value.length > 0) {
        const filtered = globalCities.filter(location =>
          location.toLowerCase().includes(value.toLowerCase())
        );
        setLocationSuggestions(filtered.slice(0, 8)); // Show more suggestions for global search
        setShowSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, location }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.organizationName.trim()) newErrors.organizationName = "Organization name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Account created successfully! Please check your email to verify your account.");
      console.log("Account created for:", formData);
    } catch (error) {
      toast.error("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AutoPulse</span>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-4 w-4 text-gray-600" />
              </Link>
              <div>
                <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
                <CardDescription className="text-gray-600">
                  Get started with AutoPulse today
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  placeholder="Acme Auto Services"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className={errors.organizationName ? "border-red-500" : ""}
                />
                {errors.organizationName && <p className="text-sm text-red-500">{errors.organizationName}</p>}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="Start typing your city or country..."
                    value={formData.location}
                    onChange={handleChange}
                    onFocus={() => formData.location && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className={errors.location ? "border-red-500 pl-10" : "pl-10"}
                  />
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {locationSuggestions.map((location, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{location}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUp;
