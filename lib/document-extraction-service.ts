export type ExtractedPropertyDetails = {
  ownerName: string;
  propertyAddress: string;
  area: string;
  surveyNumber: string;
  registrationNumber: string;
  purchaseDate: string;
  uncertainFields?: Array<keyof Omit<ExtractedPropertyDetails, "uncertainFields">>;
};

// Competition-safe fallback. This is intentionally fictional and never derives values from a real document.
export const demoExtraction: ExtractedPropertyDetails = {
  ownerName: "Daiveek Kumar",
  propertyAddress: "Site 42, Ward 174, Bengaluru",
  area: "2,400 sq.ft",
  surveyNumber: "84/2",
  registrationNumber: "REG-2026-847291",
  purchaseDate: "14 August 2026",
};

const requiredFields = ["ownerName", "propertyAddress", "area", "surveyNumber", "registrationNumber", "purchaseDate"] as const;

export function normaliseExtraction(input: unknown): ExtractedPropertyDetails {
  const data = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const uncertainFields = requiredFields.filter((field) => typeof data[field] !== "string" || !data[field].trim());
  return {
    ownerName: typeof data.ownerName === "string" ? data.ownerName.trim() : "",
    propertyAddress: typeof data.propertyAddress === "string" ? data.propertyAddress.trim() : "",
    area: typeof data.area === "string" ? data.area.trim() : "",
    surveyNumber: typeof data.surveyNumber === "string" ? data.surveyNumber.trim() : "",
    registrationNumber: typeof data.registrationNumber === "string" ? data.registrationNumber.trim() : "",
    purchaseDate: typeof data.purchaseDate === "string" ? data.purchaseDate.trim() : "",
    uncertainFields,
  };
}
