import JournalingPlugin from "./main";
import Header from "./components/Header.svelte";
import { App, PluginSettingTab, Setting } from "obsidian";

export class JournalingSettingTab extends PluginSettingTab {
    plugin: JournalingPlugin;
    component!: Header;

    constructor(app: App, plugin: JournalingPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Date Format")
            .setDesc("For more syntax, refer to ")
            .addMomentFormat((format) =>
                format
                    .setDefaultFormat(this.plugin.settings.dateFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.dateFormat = value;
                        await this.plugin.saveSettings();
                    }),
            )
            .descEl.createEl("a", {
                href: "https://momentjs.com/docs/#/displaying/format/", text: "format reference"
            })


        new Setting(containerEl)
            .setName("Journal File Name")
            .setDesc(
                "Specifies the filename for the journaling view file. This file will be used to list and organize your journal entries.",
            )
            .addText((text) =>
                text
                    .setPlaceholder("File name, e.g.: Journaling.md")
                    .setValue(this.plugin.settings.fileName)
                    .onChange(async (value) => {
                        this.plugin.settings.fileName = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Include Paths")
            .setDesc(
                "The daily notes located in these paths will be accessible via the journaling view.",
            )
            .addTextArea((text) =>
                text
                    .setPlaceholder(
                        "Folder paths separated by commas, e.g.: path1/path2, path3, path4",
                    )
                    .setValue(this.plugin.settings.paths)
                    .onChange(async (value) => {
                        this.plugin.settings.paths = value;
                        await this.plugin.saveSettings();
                    }),
            )
            .infoEl.createEl("p", {
                cls: "setting-item-description mod-warning",
                text: 'Ensure file names within folders adhere to the "Date Format."',
            });

        new Setting(containerEl)
            .setName("Filter By")
            .setDesc(
                "Choose how the plugin displays journal entries based on their dates.",
            )
            .addDropdown((text) =>
                text
                    .addOption("new", "New -> Old")
                    .addOption("old", "Old -> New")
                    .setValue(this.plugin.settings.filterValue)
                    .onChange(async (value) => {
                        this.plugin.settings.filterValue = value;
                        await this.plugin.saveSettings();
                    }),
            );

        new Setting(containerEl)
            .setName("Update Interval")
            .setDesc(
                "Set the interval at which the plugin scans the directories for changes. The interval is specified in seconds.",
            )
            .addText((text) =>
                text
                    .setPlaceholder("Interval in seconds, e.g.: 10")
                    .setValue(this.plugin.settings.updateInterval.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.updateInterval = parseInt(
                            value,
                            10,
                        );
                        await this.plugin.saveSettings();
                    }),
            );

        this.component = new Header({
            target: this.containerEl,
        });

    }
}
