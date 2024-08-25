import { App, Plugin } from "obsidian";
import { JournalingSettingTab } from "./settings";
import "virtual:uno.css";
import journalingView from "./scripts/JournalingView";

interface JournalingPluginSettings {
    paths: string;
    fileName: string;
    updateInterval: number;
}

const DEFAULT_SETTINGS: Partial<JournalingPluginSettings> = {
    paths: "",
    fileName: "Journaling.md",
    updateInterval: 15
};

export default class JournalingPlugin extends Plugin {
    settings!: JournalingPluginSettings;
    private intervalId: NodeJS.Timeout | null = null;

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);

        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = await journalingView(this.app, this);
    }

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new JournalingSettingTab(this.app, this));

        if (this.intervalId) clearInterval(this.intervalId);
        this.intervalId = await journalingView(this.app, this);
    }

    onunload() {
        if (this.intervalId) clearInterval(this.intervalId);
        console.log("unloading plugin");
    }

}
