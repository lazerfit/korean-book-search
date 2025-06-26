import {App, Notice, Plugin, PluginSettingTab, Setting, TFile} from 'obsidian';
import { searchBook, getBookInfo, buildUpdatedFrontmatterContent, escapeHtml } from "./src/bookService";

export interface BookMetadata {
	title: string;
	author: string;
	pubDate: string;
	isbn13: string;
	cover: string;
	categoryName: string;
	publisher: string;
}

export interface CustomField {
	key: string;
	value: string;
}

export interface ToggleField {
	key: string;
	value: string | number;
	enabled: boolean;
}

interface KoreanBookSearchSettings {
	API_KEY: string;
	customFields: CustomField[];
	defaultFrontmatterFields: ToggleField[];
}

const DEFAULT_SETTINGS: KoreanBookSearchSettings = {
	API_KEY: '',
	customFields: [],
	defaultFrontmatterFields: [
		{key: 'myRate', value: 0, enabled: true},
		{key: 'status', value: '읽는 중', enabled: true},
		{key: 'startReadDate', value: new Date().toISOString().split("T")[0], enabled: true},
		{key: 'finishReadDate', value: new Date().toISOString().split("T")[0], enabled: false},
	],
}

export default class KoreanBookSearchPlugin extends Plugin {
	settings: KoreanBookSearchSettings;

	setFrontmatterDataToFile = async (file: TFile, bookInfo: BookMetadata)=> {
		const fileManager = this.app.fileManager;
		const newPath  = await buildUpdatedFrontmatterContent(fileManager,file, bookInfo, this.settings.customFields, this.settings.defaultFrontmatterFields, file.path);

		if (!newPath) {
			new Notice('❌ Error building frontmatter content');
			return;
		}

		try {
			await this.app.vault.rename(file, newPath);
			new Notice('✅ Book information updated successfully');
		} catch(e) {
			new Notice('❌ Error updating book information');
		}
	}

	updateBookFrontmatter = async (cleanTitle: string, API_KEY: string, file: TFile) => {
		try {
			const isbn = await searchBook(cleanTitle, API_KEY);
			const data = await getBookInfo(isbn, API_KEY);
			const bookInfo = data.item[0];
			new Notice('✍️ Updating book information...');
			await this.setFrontmatterDataToFile(file, bookInfo);
		} catch (error) {
			new Notice('❌ Error processing book information');
		}
	}

	async onload() {
		await this.loadSettings();

		const ribbonIconEl = this.addRibbonIcon('book-open', 'Automatic book information entry', (evt: MouseEvent) => {
			const file = this.app.workspace.getActiveFile();
			const API_KEY = this.settings.API_KEY;
			if (!API_KEY) {
				new Notice('❌ API key not set');
				return;
			}
			if (file && file.extension === 'md') {
				const rawTitle = file.basename;
				const cleanTitle = rawTitle.replace(/\(.*\)/gi, "").replace(/\[.*]/gi, "").replace(":", "\uFF1A").replace("?", "\uFF1F").trim();
				const custom: Record<string, string> = {};
				const seen = new Set<string>();
				this.settings.customFields.forEach(f => {
					if (!seen.has(f.key.trim())) {
						custom[f.key.trim()] = f.value;
						seen.add(f.key.trim());
					}
				});
				this.updateBookFrontmatter(cleanTitle, API_KEY, file);
			}
		});

		ribbonIconEl.addClass('korean-book-search-ribbon-class');

		this.addSettingTab(new KoreanBookSearchSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		const loaded = await this.loadData();
		this.settings = {
			...DEFAULT_SETTINGS,
			...loaded,
			defaultFrontmatterFields: loaded?.defaultFrontmatterFields ?? DEFAULT_SETTINGS.defaultFrontmatterFields,
			customFields: loaded?.customFields ?? DEFAULT_SETTINGS.customFields,
		};
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

let apiKeyInput = '';

class KoreanBookSearchSettingTab extends PluginSettingTab {
	plugin: KoreanBookSearchPlugin;

	constructor(app: App, plugin: KoreanBookSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName('API key')
			.setDesc('Enter your aladin API key')
			.addText(text =>{
				text.inputEl.type = 'password';
				text.setPlaceholder('ttbkey...')
				.setValue(this.plugin.settings.API_KEY)
				.onChange(async (value) => {
					apiKeyInput = value;
				})})
			.addButton(btn =>
				btn
					.setButtonText('save')
					.setCta()
					.onClick(async () => {
						this.plugin.settings.API_KEY = apiKeyInput;
						try {
							await this.plugin.saveSettings()
							new Notice('✅ API key saved')
						} catch (e) {
							new Notice('❌ Error saving API key');
						}
					})
			);
		this.plugin.settings.defaultFrontmatterFields.forEach((f, index) => {
			new Setting(containerEl)
				.setName(`Include '${f.key}'`)
				.setDesc(`Toggle whether to include '${f.key}' in frontmatter`)
				.addToggle(t => {
					t.setValue(f.enabled)
						.onChange(async (value) => {
							this.plugin.settings.defaultFrontmatterFields[index].enabled = value;
							await this.plugin.saveSettings();
						})
				})
		})
		new Setting(containerEl).setName('📋 Custom frontmatter fields').setHeading();
		this.plugin.settings.customFields.forEach((f, index) => {
			new Setting(containerEl)
				.setName(`Field ${index + 1}`)
				.addText(text => text
					.setPlaceholder('key')
					.setValue(escapeHtml(f.key))
					.onChange(async (value) => {
						this.plugin.settings.customFields[index].key = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('value')
					.setValue(escapeHtml(f.value))
					.onChange(async (value) => {
						this.plugin.settings.customFields[index].value = value;
						await this.plugin.saveSettings();
					}))
				.addExtraButton(button => {
					button.setIcon('trash')
						.setTooltip('Remove field')
						.onClick(async () => {
							this.plugin.settings.customFields.splice(index, 1);
							await this.plugin.saveSettings();
							this.display();
						});
				});
		});
		new Setting(containerEl)
			.addButton(button => {
				button.setButtonText('➕ Add')
					.onClick(async () => {
						this.plugin.settings.customFields.push({ key: '', value: '' });
						await this.plugin.saveSettings();
						this.display();
					});
			});
	}
}
