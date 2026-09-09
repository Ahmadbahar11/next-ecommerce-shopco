import fs from "fs";
import path from "path";

const logDir = path.resolve(process.cwd(), "logs");
const errorLogPath = path.join(logDir, "errors.log");

function serializeError(error: unknown) {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}\n${error.stack ?? ""}`;
    }
    return typeof error === "string" ? error : JSON.stringify(error);
}

export function logError(error: unknown, context?: Record<string, unknown>) {
    try {
        fs.mkdirSync(logDir, { recursive: true });
        const contextText = context ? `\nContext: ${JSON.stringify(context)}` : "";
        fs.appendFileSync(
            errorLogPath,
            `[${new Date().toISOString()}] ${serializeError(error)}${contextText}\n\n`,
            "utf8"
        );
    } catch (loggingError) {
        console.error("Could not write error log", loggingError);
    }

    console.error(error);
}

export { errorLogPath };
