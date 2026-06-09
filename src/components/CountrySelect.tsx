import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";

// Countries list with priority countries first
const COUNTRIES = [
  // Priority countries
  "Bénin",
  "Côte d'Ivoire",
  // Rest of Africa
  "Afrique du Sud",
  "Algérie",
  "Angola",
  "Burkina Faso",
  "Burundi",
  "Cameroun",
  "Cap-Vert",
  "Comores",
  "Congo",
  "Égypte",
  "Érythrée",
  "Eswatini",
  "Éthiopie",
  "Gabon",
  "Gambie",
  "Ghana",
  "Guinée",
  "Guinée équatoriale",
  "Guinée-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libye",
  "Madagascar",
  "Malawi",
  "Mali",
  "Maroc",
  "Mauritanie",
  "Maurice",
  "Mozambique",
  "Namibie",
  "Niger",
  "Nigeria",
  "Ouganda",
  "République Centrafricaine",
  "République Démocratique du Congo",
  "Rwanda",
  "Sao Tomé-et-Principe",
  "Sénégal",
  "Seychelles",
  "Sierra Leone",
  "Somalie",
  "Soudan",
  "Soudan du Sud",
  "Tanzanie",
  "Tchad",
  "Togo",
  "Tunisie",
  "Zambie",
  "Zimbabwe",
  // Europe
  "Albanie",
  "Allemagne",
  "Andorre",
  "Autriche",
  "Belgique",
  "Biélorussie",
  "Bosnie-Herzégovine",
  "Bulgarie",
  "Chypre",
  "Croatie",
  "Danemark",
  "Espagne",
  "Estonie",
  "Finlande",
  "France",
  "Géorgie",
  "Gibraltar",
  "Grèce",
  "Groenland",
  "Hongrie",
  "Irlande",
  "Islande",
  "Italie",
  "Kosovo",
  "Lettonie",
  "Liechtenstein",
  "Lituanie",
  "Luxembourg",
  "Macédoine du Nord",
  "Malte",
  "Moldavie",
  "Monaco",
  "Monténégro",
  "Norvège",
  "Pays-Bas",
  "Pologne",
  "Portugal",
  "République Tchèque",
  "Roumanie",
  "Royaume-Uni",
  "Russie",
  "Saint-Marin",
  "Serbie",
  "Slovaquie",
  "Slovénie",
  "Suède",
  "Suisse",
  "Turquie",
  "Ukraine",
  "Vatican",
  // Americas
  "Antigua-et-Barbuda",
  "Argentine",
  "Bahamas",
  "Barbade",
  "Belize",
  "Bolivie",
  "Brésil",
  "Canada",
  "Chili",
  "Colombie",
  "Costa Rica",
  "Cuba",
  "Dominique",
  "Équateur",
  "États-Unis",
  "Grenade",
  "Guadeloupe",
  "Guam",
  "Guatemala",
  "Guernesey",
  "Guyana",
  "Haïti",
  "Honduras",
  "Île Bouvet",
  "Île Christmas",
  "Île Norfolk",
  "Îles Åland",
  "Îles Caïmans",
  "Îles Cocos",
  "Îles Féroé",
  "Îles Heard et McDonald",
  "Îles Malouines",
  "Îles Mariannes du Nord",
  "Îles Pitcairn",
  "Îles Salomon",
  "Îles Turques et Caïques",
  "Îles Vierges britanniques",
  "Îles Vierges des États-Unis",
  "Jamaïque",
  "Jersey",
  "Martinique",
  "Mexique",
  "Montserrat",
  "Nicaragua",
  "Île de Man",
  "Panama",
  "Paraguay",
  "Pérou",
  "Porto Rico",
  "République Dominicaine",
  "Réunion",
  "Saint-Barthélemy",
  "Saint-Christophe-et-Niévès",
  "Saint-Marin",
  "Saint-Martin",
  "Saint-Pierre-et-Miquelon",
  "Saint-Vincent-et-les-Grenadines",
  "Sainte-Lucie",
  "Suriname",
  "Terres australes françaises",
  "Trinité-et-Tobago",
  "Uruguay",
  "Venezuela",
  // Asia
  "Arabie Saoudite",
  "Afghanistan",
  "Bahreïn",
  "Bangladesh",
  "Bhoutan",
  "Birmanie",
  "Brunei",
  "Cambodge",
  "Chine",
  "Corée du Nord",
  "Corée du Sud",
  "Émirats Arabes Unis",
  "Hong Kong",
  "Inde",
  "Indonésie",
  "Irak",
  "Iran",
  "Irlande du Nord",
  "Israël",
  "Japon",
  "Jordanie",
  "Kazakhstan",
  "Kirghizistan",
  "Koweït",
  "Laos",
  "Liban",
  "Macao",
  "Malaisie",
  "Maldives",
  "Mongolie",
  "Népal",
  "Oman",
  "Ouzbékistan",
  "Pakistan",
  "Palestine",
  "Philippines",
  "Qatar",
  "Singapour",
  "Sri Lanka",
  "Syrie",
  "Tadjikistan",
  "Taïwan",
  "Territoire britannique de l'océan Indien",
  "Thaïlande",
  "Timor oriental",
  "Viêt Nam",
  "Yémen",
  // Oceania
  "Australie",
  "Fidji",
  "Île Bouvet",
  "Île Christmas",
  "Île Norfolk",
  "Îles Åland",
  "Îles Heard et McDonald",
  "Îles Mariannes du Nord",
  "Îles Pitcairn",
  "Îles Salomon",
  "Kiribati",
  "Micronésie",
  "Nauru",
  "Nouvelle-Calédonie",
  "Nouvelle-Zélande",
  "Palaos",
  "Papouasie-Nouvelle-Guinée",
  "Polynésie française",
  "Samoa",
  "Samoa américaines",
  "Terres australes françaises",
  "Timor oriental",
  "Tonga",
  "Tuvalu",
  "Vanuatu",
  "Wallis-et-Futuna",
].sort((a, b) => {
  // Keep Bénin and Côte d'Ivoire at the top
  if (a === "Bénin") return -1;
  if (b === "Bénin") return 1;
  if (a === "Côte d'Ivoire") return -1;
  if (b === "Côte d'Ivoire") return 1;
  return a.localeCompare(b, "fr");
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const CountrySelect = ({ value, onChange, placeholder = "Sélectionner un pays..." }: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return COUNTRIES;
    return COUNTRIES.filter((country) =>
      country.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" side="bottom" align="start">
        <div className="p-2">
          <Input
            placeholder="Rechercher un pays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Aucun pays trouvé
              </div>
            ) : (
              filtered.map((country) => (
                <button
                  key={country}
                  onClick={() => {
                    onChange(country);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${
                    value === country ? "bg-accent text-accent-foreground" : ""
                  }`}
                >
                  <Check
                    className={`absolute left-2 h-4 w-4 ${
                      value === country ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  {country}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelect;
