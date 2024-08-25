import { moment, type App, type TAbstractFile, Vault, TFile } from "obsidian";
import type JournalingPlugin from "../main";

let intervalId: NodeJS.Timeout | null = null;

// Scan the directories for changes and update the journaling files accordingly
async function scanDirectories(vault: Vault, paths: string[], fileName: string) {
    for (const path of paths) {
        const journalingFilePath: string = `${path}/${fileName}`.trim();
        const targetFile: TAbstractFile | null = vault.getAbstractFileByPath(journalingFilePath);

        if (targetFile instanceof TFile) {
            const files: TFile[] = await getPathsByDate(vault, path);

            // Read the current content of the journaling file
            let content = await vault.read(targetFile);

            // Remove existing links and rebuild them
            content = files.reduce((acc, file) => {
                return acc.includes(`![[${file.path}]]`) ? acc : acc + `![[${file.path}]]\n\n`;
            }, "");

            await vault.modify(targetFile, content);
        } else {
            // Create the journaling file if it doesn't exist yet
            await createJournaling(vault, journalingFilePath);
        }
    }
}

// Helper function: Create a new journaling file
async function createJournaling(vault: Vault, filePath: string) {
    try {
        await vault.create(filePath, "");
    } catch (error) {
        console.error(`Failed to create journaling file: ${filePath}`, error);
    }
}

// Helper function: Get all daily note paths based on the date format (YYYY-MM-DD)
async function getPathsByDate(vault: Vault, path: string): Promise<TFile[]> {
    const dateRegex = /\d{4}-\d{2}-\d{2}/;
    const files = vault.getMarkdownFiles().filter(file => file.path.startsWith(path.trim()) && dateRegex.test(file.name));
    return files;
}

// Function to periodically scan directories for changes
function startMonitoring(vault: Vault, paths: string[], fileName: string, updateInterval: number) {

    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(async () => {
        await scanDirectories(vault, paths, fileName);
    }, updateInterval);

    return intervalId
}

export default async function journalingView(app: App, plugin: JournalingPlugin) {
    let paths: string | string[] = plugin.settings.paths.trim();
    const fileName: string = plugin.settings.fileName.trim();
    const updateInterval: number = plugin.settings.updateInterval * 1000;

    if (paths.length > 0 && fileName.length > 0 && updateInterval >= 1000) {
        paths = plugin.settings.paths.split(",");
        const vault: Vault = app.vault;

        // Start the monitoring process and return the new interval ID
        return startMonitoring(vault, paths, fileName, updateInterval);
    }
    else {
        return intervalId;
    }
}

