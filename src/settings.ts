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

    private static createFragmentWithHTML = (html: string) =>
        createFragment((documentFragment) => (documentFragment.createDiv().innerHTML = html));

    display(): void {
        let { containerEl } = this;
        const momentjsLink: string = "https://momentjs.com/docs/#/displaying/format/";

        containerEl.empty();

        this.component = new Header({
            target: this.containerEl
        });

        containerEl.createEl("h4", { text: "General Settings" });

        new Setting(containerEl)
            .setName("Include Paths")
            .setDesc("The daily notes located in these paths will be accessible via the journaling view.")
            .addTextArea((text) =>
                text
                    .setPlaceholder("Folder paths separated by commas, e.g.: path1/path2, path3, path4")
                    .setValue(this.plugin.settings.paths)
                    .onChange(async (value) => {
                        this.plugin.settings.paths = value;
                        await this.plugin.saveSettings();
                    })
            )
            .infoEl.createEl("p", { cls: "setting-item-description mod-warning", text: "Ensure file names within folders adhere to the Moment.js format, see " });

        containerEl.find("p.mod-warning").createEl("a", { text: "docs of moment.js.", href: momentjsLink })

        new Setting(containerEl)
            .setName("Journal File Name")
            .setDesc("Specifies the filename for the journaling view file. This file will be used to list and organize your journal entries.")
            .addText((text) =>
                text
                    .setPlaceholder("File name, e.g.: Journaling.md")
                    .setValue(this.plugin.settings.fileName)
                    .onChange(async (value) => {
                        this.plugin.settings.fileName = value;
                        await this.plugin.saveSettings();
                    })
            )

        new Setting(containerEl)
            .setName("Update Interval")
            .setDesc("Set the interval at which the plugin scans the directories for changes. The interval is specified in milliseconds.")
            .addText((text) =>
                text
                    .setPlaceholder("Interval in seconds, e.g., 10 for 10 seconds")
                    .setValue(this.plugin.settings.updateInterval.toString())  // Assuming you have an updateInterval setting
                    .onChange(async (value) => {
                        this.plugin.settings.updateInterval = parseInt(value, 10);  // Parse and save the interval
                        await this.plugin.saveSettings();
                    })
            )

    }
}
