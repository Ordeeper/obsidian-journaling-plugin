import { Plugin } from "obsidian";
import { JournalingSettingTab } from "./settings";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./views/ExampleView";
import "virtual:uno.css";

interface JournalingPluginSettings {
    paths: string;
}

const DEFAULT_SETTINGS: Partial<JournalingPluginSettings> = {
    paths: "",
};

export default class JournalingPlugin extends Plugin {
    settings!: JournalingPluginSettings;

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData(),
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new JournalingSettingTab(this.app, this));

        this.registerView(VIEW_TYPE_EXAMPLE, (leaf) => new ExampleView(leaf));

        this.addRibbonIcon("dice", "Activate view", () => {
            this.activateView();
        });
    }

    onunload() {
        console.log("unloading plugin");
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

        await this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE_EXAMPLE,
            active: true,
        });

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0],
        );
    }
}
