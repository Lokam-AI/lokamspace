import { useState } from "react";
import AsyncSelect from "react-select/async";
import { loadCityOptions } from "../data/cities";
import { Label } from "./ui/label";

interface CityOption {
  value: string;
  label: string;
}

interface CitySearchProps {
  defaultValue?: CityOption | null;
  onChange?: (city: CityOption | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function CitySearch({
  defaultValue = null,
  onChange,
  label = "City",
  placeholder = "Search for a city...",
  className = "",
  required = false,
}: CitySearchProps) {
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(
    defaultValue
  );

  const handleChange = (option: CityOption | null) => {
    setSelectedCity(option);
    if (onChange) {
      onChange(option);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="city-search">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <AsyncSelect
        id="city-search"
        cacheOptions
        defaultOptions
        loadOptions={loadCityOptions}
        onChange={handleChange}
        value={selectedCity}
        placeholder={placeholder}
        isClearable
        classNames={{
          control: (state) =>
            `border rounded-md px-3 py-1 bg-background font-sans ${
              state.isFocused
                ? "border-primary ring-1 ring-primary"
                : "border-input"
            }`,
          menu: () =>
            "bg-popover border rounded-md shadow-md mt-1 z-50 font-sans",
          option: (state) =>
            `px-3 py-2 cursor-pointer font-sans ${
              state.isFocused ? "bg-accent" : ""
            } ${state.isSelected ? "bg-primary text-primary-foreground" : ""}`,
          placeholder: () => "text-muted-foreground font-sans",
          singleValue: () => "text-foreground font-sans",
        }}
      />
      <div className="text-sm text-foreground-secondary">
        Select your organization's primary location
      </div>
    </div>
  );
}
