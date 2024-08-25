import { type App, type TAbstractFile, Vault, TFile } from "obsidian";
import moment from "moment";
import type JournalingPlugin from "../main";

let intervalId: NodeJS.Timeout | null = null;

// Scan the directories for changes and update the journaling files accordingly
async function scanDirectories(
    vault: Vault,
    paths: string[],
    fileName: string,
    dateFormat: string,
    filterValue: string,
) {
    for (const path of paths) {
        const journalingFilePath: string = `${path}/${fileName}`.trim();
        const targetFile: TAbstractFile | null =
            vault.getAbstractFileByPath(journalingFilePath);

        if (targetFile instanceof TFile) {
            const files: TFile[] = await getPathsByDate(
                vault,
                path,
                dateFormat,
            );

            // Sort files by date based on filterValue
            files.sort((a, b) => {
                const fileNameWithoutExtA = a.name.replace(".md", "");
                const fileNameWithoutExtB = b.name.replace(".md", "");

                const dateA = moment(fileNameWithoutExtA, dateFormat);
                const dateB = moment(fileNameWithoutExtB, dateFormat);

                return filterValue === "new"
                    ? dateB.diff(dateA)
                    : dateA.diff(dateB);
            });

            // Read the current content of the journaling file
            try {
                let content = await vault.read(targetFile);

                // Remove existing links and rebuild them
                content = files.reduce((acc, file) => {
                    return acc.includes(`![[${file.path}]]`)
                        ? acc
                        : acc + `![[${file.path}]]\n\n`;
                }, "");

                await vault.modify(targetFile, content);
            } catch (error) {
                console.error(
                    `Failed to update journaling file: ${targetFile.path}`,
                    error,
                );
            }
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
async function getPathsByDate(
    vault: Vault,
    path: string,
    dateFormat: string,
): Promise<TFile[]> {
    const files = vault.getMarkdownFiles().filter((file) => {
        const fileNameWithoutExt = file.name.replace(".md", "");
        const parsedDate = moment(fileNameWithoutExt, dateFormat, true);
        return file.path.startsWith(path.trim()) && parsedDate.isValid();
    });
    return files;
}

// Function to periodically scan directories for changes
function startMonitoring(
    vault: Vault,
    paths: string[],
    fileName: string,
    updateInterval: number,
    dateFormat: string,
    filterValue: string,
) {
    if (intervalId) clearInterval(intervalId);

    intervalId = setInterval(async () => {
        await scanDirectories(vault, paths, fileName, dateFormat, filterValue);
    }, updateInterval);

    return intervalId;
}

export default async function journalingView(
    app: App,
    plugin: JournalingPlugin,
) {
    let paths: string | string[] = plugin.settings.paths.trim();
    const dateFormat: string = plugin.settings.dateFormat.trim();
    const fileName: string = plugin.settings.fileName.trim();
    const filterValue: string = plugin.settings.filterValue;
    const updateInterval: number = plugin.settings.updateInterval * 1000;

    if (paths.length > 0 && fileName.length > 0 && updateInterval >= 1000) {
        paths = plugin.settings.paths.split(",");
        const vault: Vault = app.vault;

        // Start the monitoring process and return the new interval ID
        return startMonitoring(
            vault,
            paths,
            fileName,
            updateInterval,
            dateFormat,
            filterValue,
        );
    } else {
        return intervalId;
    }
}
