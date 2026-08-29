import { loadEnvFile } from "node:process";
import { seedDemoApplication } from "../lib/repositories/upis-repository";

loadEnvFile(".env.local");

seedDemoApplication()
  .then((result) => {
    console.log(result.created ? "Created fictional demo application." : "Fictional demo application already exists.");
    if (result.duplicatesRemoved) console.log(`Removed ${result.duplicatesRemoved} accidental duplicate demo property.`);
    console.log(`Application ID: ${result.applicationId}`);
    console.log(`Property ID: ${result.propertyId}`);
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Unable to seed the fictional demo application.");
    process.exitCode = 1;
  });
