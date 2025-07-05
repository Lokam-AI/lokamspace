// List of major cities from around the world
export const cities = [
  // North America
  { value: "new-york", label: "New York, NY, USA" },
  { value: "los-angeles", label: "Los Angeles, CA, USA" },
  { value: "chicago", label: "Chicago, IL, USA" },
  { value: "toronto", label: "Toronto, ON, Canada" },
  { value: "mexico-city", label: "Mexico City, Mexico" },
  { value: "vancouver", label: "Vancouver, BC, Canada" },
  { value: "san-francisco", label: "San Francisco, CA, USA" },
  { value: "miami", label: "Miami, FL, USA" },
  { value: "montreal", label: "Montreal, QC, Canada" },

  // Europe
  { value: "london", label: "London, United Kingdom" },
  { value: "paris", label: "Paris, France" },
  { value: "berlin", label: "Berlin, Germany" },
  { value: "madrid", label: "Madrid, Spain" },
  { value: "rome", label: "Rome, Italy" },
  { value: "amsterdam", label: "Amsterdam, Netherlands" },
  { value: "barcelona", label: "Barcelona, Spain" },
  { value: "munich", label: "Munich, Germany" },
  { value: "zurich", label: "Zurich, Switzerland" },
  { value: "dublin", label: "Dublin, Ireland" },

  // Asia
  { value: "tokyo", label: "Tokyo, Japan" },
  { value: "singapore", label: "Singapore" },
  { value: "hong-kong", label: "Hong Kong" },
  { value: "seoul", label: "Seoul, South Korea" },
  { value: "mumbai", label: "Mumbai, India" },
  { value: "dubai", label: "Dubai, UAE" },
  { value: "bangkok", label: "Bangkok, Thailand" },
  { value: "shanghai", label: "Shanghai, China" },
  { value: "beijing", label: "Beijing, China" },
  { value: "delhi", label: "Delhi, India" },

  // Australia/Oceania
  { value: "sydney", label: "Sydney, Australia" },
  { value: "melbourne", label: "Melbourne, Australia" },
  { value: "brisbane", label: "Brisbane, Australia" },
  { value: "auckland", label: "Auckland, New Zealand" },
  { value: "perth", label: "Perth, Australia" },

  // Africa
  { value: "cairo", label: "Cairo, Egypt" },
  { value: "cape-town", label: "Cape Town, South Africa" },
  { value: "johannesburg", label: "Johannesburg, South Africa" },
  { value: "lagos", label: "Lagos, Nigeria" },
  { value: "nairobi", label: "Nairobi, Kenya" },

  // South America
  { value: "sao-paulo", label: "São Paulo, Brazil" },
  { value: "buenos-aires", label: "Buenos Aires, Argentina" },
  { value: "rio-de-janeiro", label: "Rio de Janeiro, Brazil" },
  { value: "bogota", label: "Bogotá, Colombia" },
  { value: "lima", label: "Lima, Peru" },
  { value: "santiago", label: "Santiago, Chile" },
];

// Function to filter cities based on search input
export const filterCities = (inputValue: string) => {
  return cities.filter((city) =>
    city.label.toLowerCase().includes(inputValue.toLowerCase())
  );
};

// Function to load options for react-select async
export const loadCityOptions = (inputValue: string) => {
  return new Promise<typeof cities>((resolve) => {
    setTimeout(() => {
      resolve(filterCities(inputValue));
    }, 300);
  });
};
