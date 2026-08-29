export type Property = {
  id: string;
  address: string;
  locality: string;
  area: string;
  type: string;
  verificationStatus: "Verified" | "In review";
  documentCount: number;
};

export const demoData = {
  owner: "Daiveek Kumar", passportId: "PP-8F4K2M", propertyId: "PROP-001", applicationId: "APP-2026-001",
  propertyAddress: "Site 42, Ward 174, Bengaluru", area: "2,400 sq.ft", propertyType: "Residential",
  surveyNumber: "84/2", registrationNumber: "REG-2026-847291", purchaseDate: "14 August 2026",
  officerId: "KA-0472", supervisorId: "SUP-019", issueDate: "29 Aug 2026", credentialVersion: "CRED. 01",
  morseToken: "·−−· ·−−· −··· ···−··− ··−· ··−−− −−··",
} as const;

export const demoCitizen = { passportId: demoData.passportId, owner: demoData.owner, credentialStatus: "Active", morseToken: demoData.morseToken };

export const properties: Property[] = [
  { id: demoData.propertyId, address: "Site 42, Ward 174", locality: "Bengaluru, Karnataka", area: demoData.area, type: demoData.propertyType, verificationStatus: "Verified", documentCount: 6 },
];

export const assistantReplies: Record<string, string> = {
  bought: "Congratulations on your new property. I’ll help you add it to your Property Passport.",
  own: "I can help you bring a property you already own into one clear, secure place.",
  application: "Let’s check where your application is and what happens next.",
  documents: "I’ll help you find the documents connected to your property.",
  help: "Tell me what feels unclear. I’ll guide you one step at a time.",
};
